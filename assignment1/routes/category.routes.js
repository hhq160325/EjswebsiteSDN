const express = require('express')
const router = express.Router()
const Category = require('../models/category.model')
const Product = require('../models/product.model')
const authMiddleware = require('../middlewares/authMiddleware')
const auth = authMiddleware(['admin'])
/**
 * @swagger
 * tags:
 *   name: Categories
 *   description: API cho quản lý các hạng mục
 */
/**
 * @swagger
 * /api/categories:
 *   post:
 *     summary: Thêm mới một category
 *     tags: [Categories]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       201:
 *         description: Category đã được tạo
 */
router.post('/',auth, async (req, res) => {
  try {
    const category = new Category(req.body)
    await category.save()
    res.status(201).json(category)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

// GET all Categories with Products
/**
 * @swagger
 * /api/categories/with-products:
 *   get:
 *     summary: Lấy danh sách tất cả categories kèm theo products của chúng
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: Thành công
 */
router.get('/with-products', async (req, res) => {
  try {
    const categories = await Category.find()
    const categoriesWithProducts = await Promise.all(
      categories.map(async category => {
        const products = await Product.find({ categoryId: category._id })
        return {
          ...category.toObject(),
          products: products
        }
      })
    )

    res.json(categoriesWithProducts)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})
//

// GET specific Categories with Products
/**
 * @swagger
 * /api/categories/{id}:
 *   get:
 *     summary: Lấy thông tin category kèm danh sách products
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của category cần lấy thông tin
 *     responses:
 *       200:
 *         description: Thành công
 *       404:
 *         description: Không tìm thấy category
 *       500:
 *         description: Lỗi server
 */

router.get('/:id', async (req, res) => {
  try {
    const category = await Category.findById(req.params.id)
    if (!category)
      return res.status(404).json({ message: 'Category not found' })

    const products = await Product.find({ categoryId: category._id })

    res.json({
      ...category.toObject(),
      products: products
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

//

// GET all Categories
/**
 * @swagger
 * /api/categories:
 *   get:
 *     summary: Lấy danh sách tất cả categories
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: Thành công
 */
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// UPDATE Category
/**
 * @swagger
 * /api/categories/{id}:
 *   put:
 *     summary: Cập nhật thông tin của một category
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của category cần cập nhật
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       200:
 *         description: Category đã được cập nhật
 *       404:
 *         description: Không tìm thấy category
 */
router.put('/:id',auth, async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
      new: true
    })
    if (!category)
      return res.status(404).json({ message: 'Category not found' })
    res.json(category)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// DELETE Category
/**
 * @swagger
 * /api/categories/{id}:
 *   delete:
 *     summary: Xóa một category
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của category cần xóa
 *     responses:
 *       200:
 *         description: Category đã được xóa
 *       404:
 *         description: Không tìm thấy category
 */
// router.delete('/:id', async (req, res) => {
//   try {
//     const category = await Category.findByIdAndDelete(req.params.id);
//     if (!category) return res.status(404).json({ message: 'Category not found' });
//     res.json({ message: 'Category deleted' });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });
router.delete('/:id',auth, async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id)
    if (!category)
      return res.status(404).json({ message: 'Category not found' })

    await Product.deleteMany({ categoryId: req.params.id })

    res.json({ message: 'Category and related products deleted' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})
module.exports = router

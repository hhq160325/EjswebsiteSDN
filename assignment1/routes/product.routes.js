const express = require('express')
const router = express.Router()
const Product = require('../models/product.model')
const authMiddleware = require('../middlewares/authMiddleware')
const auth = authMiddleware(['admin'])
const upload = require('../middlewares/uploadMiddleware');
const Category = require('../models/category.model');
// // Cấu hình multer để lưu trữ hình ảnh
/**
 * @swagger
 * tags:
 *   - name: Product
 *     description: API quản lý sản phẩm
 */
// CREATE Product
/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Tạo sản phẩm mới
 *     tags: [Product]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Laptop Gaming"
 *               price:
 *                 type: number
 *                 example: 1999.99
 *               categoryId:
 *                 type: string
 *                 example: "65c9b8f6e8c2b001f8d1234"
 *     responses:
 *       201:
 *         description: Sản phẩm được tạo thành công
 *       400:
 *         description: Lỗi đầu vào
 */
router.post('/', auth, async (req, res) => {
  try {
    const product = new Product(req.body)
    await product.save()
    res.status(201).json(product)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

// GET all Products
/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Lấy danh sách tất cả sản phẩm
 *     tags: [Product]
 *     responses:
 *       200:
 *         description: Thành công
 */
router.get('/', async (req, res) => {
  try {
    const products = await Product.find().populate('categoryId', 'name')
    res.json(products)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

//
/**
 * @swagger
 * /api/products/price-range:
 *   get:
 *     summary: Lấy danh sách sản phẩm có giá trong khoảng nhất định
 *     tags: [Product]
 *     parameters:
 *       - in: query
 *         name: min
 *         required: false
 *         schema:
 *           type: number
 *         description: Giá tối thiểu (mặc định là 0 nếu không nhập)
 *       - in: query
 *         name: max
 *         required: false
 *         schema:
 *           type: number
 *         description: Giá tối đa (không giới hạn nếu không nhập)
 *     responses:
 *       200:
 *         description: Danh sách sản phẩm trong khoảng giá đã cho
 *       400:
 *         description: Lỗi request không hợp lệ
 *       500:
 *         description: Lỗi server
 */
router.get('/price-range', async (req, res) => {
  try {
    let { min, max } = req.query
    if (isNaN(min)) min = 0
    if (isNaN(max)) max = Infinity
    const products = await Product.find({ price: { $gte: min, $lte: max } })
    if (products.length === 0) {
      return res
        .status(400)
        .json({ message: 'Không có sản phẩm trong khoảng giá này' })
    }
    res.json(products)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

//

// READ Products by Category
/**
 * @swagger
 * /api/products/category/{categoryId}:
 *   get:
 *     summary: Lấy danh sách sản phẩm theo danh mục
 *     tags: [Product]
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của danh mục
 *     responses:
 *       200:
 *         description: Thành công
 */
router.get('/category/:categoryId', async (req, res) => {
  try {
    const products = await Product.find({ categoryId: req.params.categoryId })
    res.json(products)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// GET Product by ID
/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Lấy sản phẩm theo ID
 *     tags: [Product]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của sản phẩm
 *     responses:
 *       200:
 *         description: Thành cong
 *       404:
 *         description: Không tìm thấy sản phẩm
 */
router.get('/:id', async (req, res) => {
  try {
    const products = await Product.findById(req.params.id)
    res.json(products)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// UPDATE Product
// /**
//  * @swagger
//  * /api/products/{id}:
//  *   put:
//  *     summary: Cập nhật sản phẩm
//  *     tags: [Product]
//  *     parameters:
//  *       - in: path
//  *         name: id
//  *         required: true
//  *         schema:
//  *           type: string
//  *         description: ID của sản phẩm cần cập nhật
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         multipart/form-data::
//  *           schema:
//  *             type: object
//  *             properties:
//  *               name:
//  *                 type: string
//  *               price:
//  *                 type: number
//  *               categoryId:
//  *                 type: string
//  *     responses:
//  *       200:
//  *         description: Cập nhật thành công
//  *       404:
//  *         description: Không tìm thấy sản phẩm
//  */
/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     summary: Cập nhật sản phẩm
 *     tags: [Product]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của sản phẩm cần cập nhật
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               price:
 *                 type: number
 *               categoryId:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary  # Hình ảnh dạng binary
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *       404:
 *         description: Không tìm thấy sản phẩm
 */

// router.put('/:id',auth, async (req, res) => {
//   try {
//     const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
//     if (!product) return res.status(404).json({ message: 'Product not found' });
//     res.json(product);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });
router.put('/:id', auth, upload.single('image'), async (req, res) => {
  try {
    console.log('File uploaded:', req.file);
    // Tìm sản phẩm theo ID
    const product = await Product.findById(req.params.id)
    if (!product) return res.status(404).json({ message: 'Product not found' })

    // Cập nhật các thông tin sản phẩm từ body và hình ảnh nếu có
    product.name = req.body.name || product.name
    product.price = req.body.price || product.price
    product.categoryId = req.body.categoryId || product.categoryId

    // Nếu có hình ảnh mới, cập nhật trường 'imageUrl'
    if (req.file) {
      product.image = `/uploads/${req.file.filename}` // Lưu đường dẫn hình ảnh
    }
    console.log('imgae',req.file);
    // Lưu lại sản phẩm đã được cập nhật
    await product.save()
    res.json(product) // Trả về sản phẩm đã cập nhật
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// DELETE Product
/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Xóa sản phẩm
 *     tags: [Product]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của sản phẩm cần xóa
 *     responses:
 *       200:
 *         description: Xóa thành công
 *       404:
 *         description: Không tìm thấy sản phẩm
 */
router.delete('/:id', auth, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id)
    if (!product) return res.status(404).json({ message: 'Product not found' })
    res.json({ message: 'Product deleted' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})
module.exports = router

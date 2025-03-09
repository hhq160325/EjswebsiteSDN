const express = require('express');
const router = express.Router();
const Product = require('../models/product.model');
const Category = require('../models/category.model');
const upload = require('../middlewares/uploadMiddleware');
const { webAuth, isAdmin } = require('../middlewares/webAuthMiddleware');
// GET PRODUCTS
router.get('/',webAuth, async (req, res) => {
    try {
        const products = await Product.find();
        res.render('products', { products, user: req.user });
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// ADD PRODUCT
router.get('/add',webAuth, isAdmin, async (req, res) => {
    // res.render('product-add');
    try {
        const categories = await Category.find(); // Lấy tất cả categories từ database
        res.render('product-add', { categories }); // Truyền dữ liệu categories vào template
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});
// ADD PRODUCT PROCESSING
router.post('/add', upload.single('image'),webAuth, isAdmin, async (req, res) => {
    try {
        const { name, price, categoryId } = req.body;
        const image = req.file ? `/uploads/${req.file.filename}` : '';

        const newProduct = new Product({ name, price, categoryId, image });
        await newProduct.save();
        res.redirect('/products');
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// EDIT PRODUCT
router.get('/edit/:id',webAuth, isAdmin, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).send('Sản phẩm không tồn tại');
        res.render('product-edit', { product });
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// EDIT PRODUCT PROCESSING
router.post('/edit/:id', upload.single('image'),webAuth, isAdmin, async (req, res) => {
    try {
        const { name, price, categoryId } = req.body;
        const product = await Product.findById(req.params.id);

        if (!product) return res.status(404).send('Sản phẩm không tồn tại');

        product.name = name;
        product.price = price;
        product.categoryId = categoryId;

        if (req.file) {
            product.image = `/uploads/${req.file.filename}`;
        }

        await product.save();
        res.redirect('/products');
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// DELETE PRODUCT
router.get('/delete/:id',webAuth, isAdmin, async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.redirect('/products');
    } catch (error) {
        res.status(500).send(error.message);
    }
});
module.exports = router;

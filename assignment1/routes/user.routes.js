const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { body, validationResult } = require('express-validator')
const User = require('../models/user.model')
const router = express.Router()
const authMiddleware = require('../middlewares/authMiddleware')
const auth = authMiddleware(['admin'])
//User Sign-up

/**
 * @swagger
 * tags:
 *   name: Admins
 *   description: API quản lý người dùng
 */

/**
 * @swagger
 * /api/users/register:
 *   post:
 *     summary: Đăng ký tài khoản mới
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 example: "admin123"
 *               email:
 *                 type: string
 *                 example: "admin@example.com"
 *               password:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       201:
 *         description: Đăng ký thành công
 *       400:
 *         description: Dữ liệu đầu vào không hợp lệ
 *       500:
 *         description: Lỗi server
 */
router.post(
  '/register',
  [
    body('username').notEmpty(),
    body('email').isEmail(),
    body('password').isLength({ min: 6 })
  ],
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }
    try {
      const { username, email, password } = req.body
      const hashedPAssword = await bcrypt.hash(password, 10)
      const user = new User({ username, email, password: hashedPAssword })
      await user.save()
      res.status(201).json({ message: 'User created successfully' })
    } catch (error) {
      res.status(500).json({ message: error.message })
    }
  }
)

//User Sign-in

/**
 * @swagger
 * /api/users/login:
 *   post:
 *     summary: Đăng nhập người dùng
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: "admin@example.com"
 *               password:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Đăng nhập thành công, trả về token
 *       400:
 *         description: Email hoặc mật khẩu không hợp lệ
 *       500:
 *         description: Lỗi server
 */
router.post(
  '/login',
  [body('email').isEmail(), body('password').notEmpty()],
  async (req, res) => {
    const { email, password } = req.body
    try {
      const user = await User.findOne({ email })
      console.log("user:", user);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' })
      }
      const isMatch = await bcrypt.compare(password, user.password)
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials' })
      }
      console.log("JWT_SECRET:", process.env.JWT_SECRET);
      const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, {
        expiresIn: '1h'
      })
      res.json({ token })
    } catch (error) {
      res.status(500).json({ message: error.message })
    }
  }
)

//User Lists (Only Admin can access)

/**
 * @swagger
 * /api/users/users:
 *   get:
 *     summary: Lấy danh sách tất cả người dùng (chỉ admin)
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Thành công, trả về danh sách user
 *       401:
 *         description: Không có quyền truy cập
 *       500:
 *         description: Lỗi server
 */
router.get('/users',auth, async (req, res) => {
  try {
    const users = await User.find().select('-password')
    res.json(users)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})
// GET User by ID
/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Lấy danh sách người dùng theo ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của người dùng
 *     responses:
 *       200:
 *         description: Thành cong
 *       404:
 *         description: Không tìm thấy người dùng
 */
router.get('/:id', async (req, res) => {
  try {
    const users = await User.findById(req.params.id );
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
module.exports = router;
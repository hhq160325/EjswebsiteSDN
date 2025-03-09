const express = require('express')
const { body, validationResult } = require('express-validator')
const router = express.Router()
const jwt = require('jsonwebtoken')
const User = require('../models/user.model')
const bcrypt = require('bcryptjs')
const redirectIfAuthenticated = require('../middlewares/redirectIfAuthenticated')
router.get('/', redirectIfAuthenticated, (req, res) => {
  res.render('login')
})
router.post(
  '/',
  [
    body('email').isEmail().withMessage('Invalid email format'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters')
  ],
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { email, password } = req.body

    console.log('Email:', email)
    console.log('Password:', password)

    try {
      const userFromDb = await User.findOne({ email })
      console.log('User from DB:', userFromDb)

      if (!userFromDb) {
        return res.status(401).json({ message: 'Invalid credentials' })
      }

      const isMatch = await bcrypt.compare(password, userFromDb.password)
      console.log('Is Match:', isMatch)

      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid credentials' })
      }

      const token = jwt.sign(
        { userId: userFromDb._id, role: userFromDb.role },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      )

      req.session.token = token
      req.session.user = {
        id: userFromDb._id,
        email: userFromDb.email,
        role: userFromDb.role
      }

      res.redirect('/dashboard')
    } catch (error) {
      res.status(500).json({ message: error.message })
    }
  }
)

module.exports = router

const jwt = require('jsonwebtoken')

const authMiddleware = (roles = []) => {
  return (req, res, next) => {
    // console.log('Authorization Header AuthMiddleware:', req.headers.authorization)
    const token = req.header('Authorization')?.split(' ')[1]
    if (!token) return res.status(401).json({ message: 'Access Denied' })

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      req.user = decoded
      if (roles.length && !roles.includes(req.user.role)) {
        return res
          .status(403)
          .json({ message: 'Forbidden: Insufficient permissions' })
      }

      next()
    } catch (error) {
      res.status(401).json({ message: 'Invalid Token' })
    }
  }
}

module.exports = authMiddleware

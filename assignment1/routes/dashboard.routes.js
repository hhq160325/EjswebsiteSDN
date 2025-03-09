const express = require('express');
const router = express.Router();
const {webAuth} = require('../middlewares/webAuthMiddleware');

// Middleware xác thực cho Web
router.get('/', webAuth, (req, res) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  res.set('Surrogate-Control', 'no-store');
  res.render('dashboard', { user: req.user });
});

module.exports = router;

// webAuthMiddleware.js
const jwt = require('jsonwebtoken');

module.exports.webAuth = (req, res, next) => {
    if (!req.session.token) return res.redirect('/login');  // Kiểm tra session token cho web

    try {
        const decoded = jwt.verify(req.session.token, process.env.JWT_SECRET);
        req.user = decoded; 
        next();  
    } catch (error) {
        res.redirect('/login'); 
    }
};
module.exports.isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next(); 
    } else {
        res.status(403).send("Bạn không có quyền truy cập.");
    }
};
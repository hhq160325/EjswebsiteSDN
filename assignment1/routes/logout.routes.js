const express = require('express');
const router = express.Router();
// Route API để logout
router.get('/', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ message: 'Error while logging out' });
        }
        res.clearCookie('connect.sid', {
            path: '/',
        });
        res.redirect('/login');
    });
});
module.exports = router
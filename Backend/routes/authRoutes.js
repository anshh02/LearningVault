const express = require('express');
const { body } = require('express-validator');
const { register, login } = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/register', [
    body('name', 'Name is required').not().isEmpty(),
    body('email', 'Please include a valid email').isEmail(),
    body('password', 'Password must be 6 or more characters').isLength({ min: 6 })
], register);

router.post('/login', login);

// Example of a protected route
router.get('/me', authMiddleware, (req, res) => {
    res.json({ message: 'This is a protected route', userId: req.user.id });
});

module.exports = router;
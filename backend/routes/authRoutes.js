// backend/routes/authRoutes.js

const express = require('express');
const { registerUser, loginUser, verifyToken } = require('../controllers/authController');
const { authMiddleware, verifyRole } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);

// Exemple de route protégée
router.get('/protected', verifyToken, (req, res) => {
  res.send('This is a protected route.');
});

// Exemple de route protégée par rôle
router.get('/admin', verifyToken, verifyRole(['admin']), (req, res) => {
  res.send('This is an admin protected route.');
});

module.exports = router;

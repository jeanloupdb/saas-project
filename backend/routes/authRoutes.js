const express = require('express');
const { registerUser, loginUser, refreshToken, logoutUser } = require('../controllers/authController');
const { verifyToken, verifyRole } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/refresh-token', refreshToken); // Route pour renouveler le token
router.post('/logout', logoutUser); // Route pour déconnecter l'utilisateur

// Exemple de route protégée
router.get('/protected', verifyToken, (req, res) => {
  res.send('This is a protected route.');
});

// Exemple de route protégée par rôle
router.get('/admin', verifyToken, verifyRole(['admin']), (req, res) => {
  res.send('This is an admin protected route.');
});

module.exports = router;

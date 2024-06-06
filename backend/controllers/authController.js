const User = require('../models/User');
const argon2 = require('argon2');
const jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator');

// Clé secrète pour signer les tokens JWT
const SECRET_KEY = process.env.JWT_SECRET;

// Register User
exports.registerUser = [
  // Validate input
  check('username').not().isEmpty().withMessage('Username is required'),
  check('email').isEmail().withMessage('Invalid email'),
  check('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  check('role').isIn(['client', 'entreprise']).withMessage('Invalid role'),

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password, role } = req.body;
    try {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'Email déjà utilisé.' });
      }
      const user = new User({ username, email, password, role });
      console.log('User being saved:', user); // Log the user object before saving
      await user.save();
      res.status(201).json({ message: 'Utilisateur enregistré avec succès.' });
    } catch (error) {
      res.status(400).json({ message: 'Erreur lors de l\'inscription de l\'utilisateur.', error });
    }
  }
];

// Login User
exports.loginUser = [
  // Validate input
  check('email').isEmail().withMessage('Invalid email'),
  check('password').not().isEmpty().withMessage('Password is required'),
  check('role').isIn(['client', 'entreprise']).withMessage('Invalid role'),

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, role } = req.body;
    try {
      const user = await User.findOne({ email, role });
      if (!user) {
        return res.status(400).json({ message: 'Email ou mot de passe invalide.' });
      }
      console.log('Stored hashed password:', user.password); // Log the stored hashed password
      console.log('Password being compared:', password); // Log the plain password being compared
      const isMatch = await argon2.verify(user.password, password);
      console.log('Password match status:', isMatch); // Log the result of the comparison
      if (!isMatch) {
        return res.status(400).json({ message: 'Email ou mot de passe invalide.' });
      }
      const token = jwt.sign({ id: user._id, username: user.username, role: user.role }, SECRET_KEY, { expiresIn: '1h' });
      res.json({ token });
    } catch (error) {
      res.status(400).json({ message: 'Erreur lors de la connexion.', error });
    }
  }
];

// Middleware pour vérifier le token
exports.verifyToken = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) {
    return res.status(403).json({ message: 'Pas de token fourni.' });
  }

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Échec de l\'authentification du token.' });
    }
    req.user = decoded;
    next();
  });
};

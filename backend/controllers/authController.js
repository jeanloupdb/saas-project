const User = require('../models/User');
const argon2 = require('argon2');
const jwt = require('jsonwebtoken');

// Clé secrète pour signer les tokens JWT
const SECRET_KEY = process.env.JWT_SECRET;

// Register User
exports.registerUser = async (req, res) => {
  const { username, email, password, role } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email déjà utilisé.' });
    }
    const user = new User({ username, email, password, role });
    await user.save();
    res.status(201).json({ message: 'Utilisateur enregistré avec succès.' });
  } catch (error) {
    res.status(400).json({ message: 'Erreur lors de l\'inscription de l\'utilisateur.', error });
  }
};

// Login User
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Email ou mot de passe invalide.' });
    }
    const isMatch = await argon2.verify(user.password, password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Email ou mot de passe invalide.' });
    }
    const token = jwt.sign({ id: user._id, username: user.username, role: user.role }, SECRET_KEY, { expiresIn: '1h' });
    const userObj = user.toObject();
    console.log('User logged in:', userObj); // Log user details
    res.json({ token, user: userObj });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(400).json({ message: 'Erreur lors de la connexion.', error });
  }
};


// Verify Token
exports.verifyToken = (req, res, next) => {
  const token = req.header('Authorization').replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: 'Accès refusé. Aucun token fourni.' });

  try {
    const verified = jwt.verify(token, SECRET_KEY);
    req.user = verified;
    next();
  } catch (error) {
    res.status(400).json({ message: 'Token invalide.' });
  }
};

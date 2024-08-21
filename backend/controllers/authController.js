const User = require('../models/User');
const argon2 = require('argon2');
const jwt = require('jsonwebtoken');
const RefreshToken = require('../models/RefreshToken');
const crypto = require('crypto');

// Clé secrète pour signer les tokens JWT
const SECRET_KEY = process.env.JWT_SECRET;
const REFRESH_SECRET_KEY = process.env.JWT_REFRESH_SECRET;

// Générer un Access Token
const generateAccessToken = (user) => {
  return jwt.sign({ id: user._id, username: user.username, role: user.role }, SECRET_KEY, { expiresIn: '15m' });
};

// Générer un Refresh Token
const generateRefreshToken = (user) => {
  const refreshToken = crypto.randomBytes(64).toString('hex');
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // Le Refresh Token expire dans 7 jours

  const newRefreshToken = new RefreshToken({
    token: refreshToken,
    userID: user._id,
    expiresAt: expiresAt,
  });

  return newRefreshToken.save().then(() => refreshToken);
};

// Register User and Log In
exports.registerUser = async (req, res) => {
  const { username, email, password, role } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email déjà utilisé.' });
    }

    const user = new User({ username, email, password, role });
    await user.save();

    const token = generateAccessToken(user);
    const refreshToken = await generateRefreshToken(user);

    res.status(201).json({ message: 'Utilisateur enregistré avec succès.', token, refreshToken, user });
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

    const token = generateAccessToken(user);
    const refreshToken = await generateRefreshToken(user);

    res.json({ token, refreshToken, user });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(400).json({ message: 'Erreur lors de la connexion.', error });
  }
};

// Renew Access Token using Refresh Token
exports.refreshToken = async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({ message: 'Refresh Token est requis.' });
  }

  try {
    const storedToken = await RefreshToken.findOne({ token: refreshToken });

    if (!storedToken || storedToken.expiresAt < new Date()) {
      return res.status(403).json({ message: 'Refresh Token invalide ou expiré.' });
    }

    const user = await User.findById(storedToken.userID);
    const newAccessToken = generateAccessToken(user);

    res.json({ token: newAccessToken });
  } catch (error) {
    console.error('Erreur lors du renouvellement du token:', error);
    res.status(500).json({ message: 'Erreur lors du renouvellement du token.', error });
  }
};

// Logout User and remove Refresh Token
exports.logoutUser = async (req, res) => {
  const { refreshToken } = req.body;

  try {
    await RefreshToken.findOneAndDelete({ token: refreshToken });
    res.status(200).json({ message: 'Déconnexion réussie.' });
  } catch (error) {
    console.error('Erreur lors de la déconnexion:', error);
    res.status(500).json({ message: 'Erreur lors de la déconnexion.', error });
  }
};

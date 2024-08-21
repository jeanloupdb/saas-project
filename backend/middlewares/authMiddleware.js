const jwt = require('jsonwebtoken');
const logger = require('../logger');

const authMiddleware = (req, res, next) => {
  const authHeader = req.header('Authorization');

  if (!authHeader) {
    logger.warn('Accès refusé. Aucun header Authorization fourni.');
    return res.status(401).json({ message: 'Accès refusé. Aucun token fourni.' });
  }

  const token = authHeader.replace('Bearer ', '');

  if (!token) {
    logger.warn('Accès refusé. Aucun token trouvé dans le header.');
    return res.status(401).json({ message: 'Accès refusé. Aucun token fourni.' });
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch (error) {
    logger.error('Erreur de vérification du token:', error);
    res.status(400).json({ message: 'Token invalide.' });
  }
};

const verifyRole = (roles) => (req, res, next) => {
  if (roles.includes(req.user.role)) {
    return next();
  }
  logger.warn(`Accès refusé pour le rôle: ${req.user.role}`);
  res.status(403).send('Accès refusé.');
};

module.exports = {
  authMiddleware,
  verifyRole,
  verifyToken: authMiddleware
};

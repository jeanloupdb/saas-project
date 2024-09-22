const jwt = require('jsonwebtoken');
const logger = require('../logger');

const authMiddleware = (req, res, next) => {
  const authHeader = req.header('Authorization');

  if (authHeader) {
    // Si le header Authorization existe, vérifier le JWT
    const token = authHeader.replace('Bearer ', '');

    try {
      const verified = jwt.verify(token, process.env.JWT_SECRET);
      req.user = verified; // Stocker l'utilisateur vérifié dans req.user
      return next();
    } catch (error) {
      logger.error('Erreur de vérification du token:', error);
      return res.status(400).json({ message: 'Token invalide.' });
    }
  } else if (req.session && req.session.userId) {
    // Si la session existe et contient un userId, l'utiliser
    req.user = { userId: req.session.userId }; // Stocker l'ID utilisateur de la session dans req.user
    return next();
  } else {
    // Si aucun token ni session n'est trouvé
    logger.warn('Accès refusé. Aucun token ou session fourni.');
    return res.status(401).json({ message: 'Accès refusé. Aucun token ou session fourni.' });
  }
};

// Middleware pour vérifier le rôle de l'utilisateur
const verifyRole = (roles) => (req, res, next) => {
  if (req.user && roles.includes(req.user.role)) {
    return next();
  }
  logger.warn(`Accès refusé pour le rôle: ${req.user.role || 'inconnu'}`);
  return res.status(403).send('Accès refusé.');
};

module.exports = {
  authMiddleware,
  verifyRole,
  verifyToken: authMiddleware
};

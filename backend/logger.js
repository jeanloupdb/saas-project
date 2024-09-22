// logger.js

const { createLogger, format, transports } = require('winston');
const { combine, timestamp, printf, colorize } = format;

// Définir le format des logs
const logFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} [${level}]: ${message}`;
});

// Créer le logger
const logger = createLogger({
  level: 'info', // Niveau minimum de log (info, warn, error, etc.)
  format: combine(
    colorize(), // Ajoute de la couleur aux logs pour une meilleure lisibilité
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), // Ajoute un timestamp aux logs
    logFormat // Applique le format des logs défini plus haut
  ),
  transports: [
    new transports.Console(), // Affiche les logs dans la console
    new transports.File({ filename: 'logs/app.log' }) // Enregistre les logs dans un fichier
  ],
});

module.exports = logger;

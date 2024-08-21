const express = require('express');
const router = express.Router();
const Game = require('../models/Game');
const { verifyToken } = require('../middlewares/authMiddleware');
const { playGame } = require('../controllers/gameController'); // Modification ici
const logger = require('../logger');

// Route pour obtenir la liste des jeux
router.get('/list', verifyToken, async (req, res) => {
  try {
    const games = await Game.find();
    res.status(200).json(games);
  } catch (error) {
    logger.error('Erreur lors de la récupération des jeux: ', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des jeux.', error });
  }
});

// Route pour jouer à un jeu de roulette
router.post('/play/roulette', async (req, res) => {
  try {
    await playGame(req, res); // Appelle le contrôleur du jeu
  } catch (error) {
    logger.error('Erreur lors du jeu de roulette: ', error);
    return res.status(500).json({ message: 'Erreur lors du jeu de roulette.', error });
  }
});

module.exports = router;

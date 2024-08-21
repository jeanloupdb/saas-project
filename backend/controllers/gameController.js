const logger = require('../logger');
const { playRouletteService } = require('../services/RouletteService');

const playGame = async (req, res) => {
  const { gameID, userID, numSegments, betNumber, companyID } = req.body;
  try {
    const result = await playRouletteService(gameID, userID, numSegments, betNumber, companyID);
    return res.status(result.status).json(result.data);
  } catch (error) {
    return res.status(500).json({ message: 'Erreur lors du jeu.', error });
  }
};

module.exports = {
  playGame,
};

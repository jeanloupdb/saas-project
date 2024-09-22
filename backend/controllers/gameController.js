const logger = require('../logger');
const { playRouletteService } = require('../services/RouletteService');
const { playCoffresService } = require('../services/CoffresService');

const playRoulette = async (req, res) => {
  const { gameID, userID, numSegments, betNumber, companyID, rewardRarity } = req.body;
  try {
    const result = await playRouletteService(gameID, userID, numSegments, betNumber, companyID, rewardRarity);
    return res.status(result.status).json(result.data);
  } catch (error) {
    return res.status(500).json({ message: 'Erreur lors du jeu.', error });
  }
};

const playCoffres = async (req, res) => {
  const { gameID, userID, numCoffres, betNumber, companyID, rewardRarity } = req.body;
  try {
    const result = await playCoffresService(gameID, userID, numCoffres, betNumber, companyID, rewardRarity);
    return res.status(result.status).json(result.data);
  } catch (error) {
    return res.status(500).json({ message: 'Erreur lors du jeu.', error });
  }
};

module.exports = {
  playRoulette,
  playCoffres,
};

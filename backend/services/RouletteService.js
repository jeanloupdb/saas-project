// services/RouletteService.js
const mongoose = require('mongoose');
const Reward = require('../models/Reward');
const RewardController = require('../controllers/rewardController');
const {processGame} = require('./GameService');
const logger = require('../logger');
const GameHistory = require('../models/GameHistory');



const playRouletteService = async (gameID, userID, numSegments, betNumber, companyID) => {
  const calculateResult = async () => {
    // Déterminer le numéro gagnant
    const winningNumber = Math.floor(Math.random() * numSegments) + 1;

    // Calculer l'angle pour l'affichage de la roulette
    const segmentAngle = 360 / numSegments;
    const offset = segmentAngle / 2;
    let winningAngle = (winningNumber - 1) * segmentAngle;
    winningAngle += 5 * 360; // Ajouter des rotations complètes pour l'animation
    winningAngle += offset;

    // Déterminer si l'utilisateur gagne ou perd
    const win = winningNumber === betNumber;
    let rewardID = null;


    if (win) {
      // Récupérer les récompenses disponibles pour l'entreprise
      const rewards = await Reward.find({ companyID, remainingQuantity: { $gt: 0 } });

      if (rewards.length > 0) {
        // Sélectionner une récompense aléatoire parmi les récompenses disponibles
        const reward = rewards[Math.floor(Math.random() * rewards.length)];

        if (reward) {
          reward.remainingQuantity -= 1;
          await reward.save();

          // Créer un UserReward pour l'utilisateur
          RewardController.createUserReward(userID, reward._id, gameID, companyID);
          rewardID = reward._id;
        } else {
          logger.warn("No reward was selected even though it was a winning bet.");
        }
      } else {
        logger.warn("No rewards available for this company.");
      }
    }

    return { win, rewardID, extraData: { winningNumber, winningAngle } };
  };


  const saveGameHistory = async (win, rewardID, extraData, entryCost) => {
    logger.info(` Win: ${win}, RewardID: ${rewardID}`);
    const gameHistory = new GameHistory({
      userID: new mongoose.Types.ObjectId(userID),
      gameID: new mongoose.Types.ObjectId(gameID),
      companyID:new  mongoose.Types.ObjectId(companyID),
      result: win ? 'win' : 'lose',
      rewardID: win && rewardID ? rewardID : null,
      tokensSpent: entryCost,
      date: new Date(),
    });
    await gameHistory.save();
    return gameHistory;
  };


  return processGame(gameID, userID, companyID, 10, calculateResult, saveGameHistory);
};

module.exports = {
  playRouletteService,
};

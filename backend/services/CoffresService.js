const mongoose = require('mongoose');
const Reward = require('../models/Reward');
const RewardController = require('../controllers/rewardController');
const { processGame } = require('./GameService');
const logger = require('../logger');
const GameHistory = require('../models/GameHistory');
require('dotenv').config();


const playCoffresService = async (gameID, userID, numCoffres, selectedCoffreId, companyID, rewardRarity) => {
  console.log("rarity: ", rewardRarity);
  const calculateResult = async () => {
    // Déterminer si le coffre sélectionné est gagnant avec une probabilité de 20% (par exemple)
    const winning_probability = parseFloat(process.env.WINNING_PROBABILITY_CHEST);
    const isWinningCoffre = Math.random() < winning_probability;
    let winningCoffre = selectedCoffreId;
    let rewardID = null;
    let win = false;

    if (isWinningCoffre || numCoffres === 1) {
      win = true;

      // Récupérer les récompenses disponibles pour l'entreprise en fonction de la "rarity"
      const rewards = await Reward.find({ 
        companyID, 
        remainingQuantity: { $gt: 0 }, 
        rarity: { $eq: rewardRarity }  // Filtrer par `rarity` selon la valeur passée
      });
      console.log("rewards : ", rewards)

      if (rewards.length > 0) {
        // Sélectionner une récompense aléatoire parmi celles disponibles
        const reward = rewards[Math.floor(Math.random() * rewards.length)];
        if (reward) {
          reward.remainingQuantity -= 1;
          await reward.save();

          // Créer un UserReward pour l'utilisateur
          await RewardController.createUserReward(userID, reward._id, gameID, companyID);
          rewardID = reward._id;
        } else {
          logger.warn("Aucune récompense n'a été sélectionnée même si l'utilisateur a gagné.");
        }
      } else {
        logger.warn("Pas de récompenses disponibles pour cette entreprise ou avec la rareté sélectionnée.");
      }
    } else {
      // Si le coffre est perdant, choisir un autre coffre aléatoire comme le vrai gagnant
      while (winningCoffre === selectedCoffreId){
        winningCoffre = Math.floor(Math.random() * numCoffres) + 1;
      }
    }

    return { win, rewardID, extraData: { selectedCoffreId, winningCoffre } };
  };

  const saveGameHistory = async (win, rewardID, extraData, entryCost) => {
    const gameHistory = new GameHistory({
      userID: new mongoose.Types.ObjectId(userID),
      gameID: new mongoose.Types.ObjectId(gameID),
      companyID: new mongoose.Types.ObjectId(companyID),
      result: win ? 'win' : 'lose',
      rewardID: win && rewardID ? rewardID : null,
      tokensSpent: entryCost,
      date: new Date(),
      extraData, // Sauvegarder les coffres sélectionné et gagnant
    });
    await gameHistory.save();
    return gameHistory;
  };

  return processGame(gameID, userID, companyID, 10, calculateResult, saveGameHistory);
};

module.exports = {
  playCoffresService,
};

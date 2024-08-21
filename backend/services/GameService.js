// services/GameService.js

const mongoose = require('mongoose');
const Game = require('../models/Game');
const TokenWallet = require('../models/TokenWallet');
const logger = require('../logger');

const processGame = async (gameID, userID, companyID, entryCost, calculateResult, saveGameHistory) => {
  try {
    const gameObjectId = new mongoose.Types.ObjectId(gameID);
    const userObjectId = new mongoose.Types.ObjectId(userID);
    const companyObjectId = new mongoose.Types.ObjectId(companyID);

    // Rechercher le jeu et le portefeuille de l'utilisateur 
    const game = await Game.findById(gameObjectId);
    const userWallet = await TokenWallet.findOne({ userID: userObjectId, companyID: companyObjectId });

    if (!game || !userWallet || userWallet.balance < entryCost) {
      return { status: 400, data: { message: "Not enough tokens or invalid game" } };
    }

    // Déduire le coût du solde des jetons de l'utilisateur
    userWallet.balance -= entryCost;
    await userWallet.save();


    // Calculer le résultat du jeu (cette partie dépend du jeu spécifique, par exemple, roulette)
    const { win, rewardID, extraData } = await calculateResult();

    // Enregistrer l'historique du jeu
    const gameHistory = await saveGameHistory(win, rewardID, extraData, game.entryCost);


    return {
      status: 200,
      data: {
        win,
        rewardID,
        ...extraData,
      }
    };
  } catch (error) {
    logger.error(`Error processing game: ${error}`);
    return { status: 500, data: { message: 'Erreur lors du traitement du jeu.', error } };
  }
};

module.exports = {
  processGame,
};

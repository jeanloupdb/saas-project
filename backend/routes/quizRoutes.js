const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/authMiddleware');
const Quiz = require('../models/Quiz');
const UserAction = require('../models/UserAction');
const TokenWallet = require('../models/TokenWallet');
const Action = require('../models/Action');
const logger = require('../logger');

router.post('/submit', verifyToken, async (req, res) => {

  // Extraction directe des données du corps de la requête
  const actionId = req.body.actionId;
  const userId = req.body.userId;
  const responses = req.body.responses;


  // Vérification des valeurs extraites
  if (!actionId) {
    logger.error('actionId is missing');
    return res.status(400).json({ message: 'actionId is required.' });
  }

  if (!userId) {
    logger.error('userId is missing');
    return res.status(400).json({ message: 'userId is required.' });
  }

  if (!responses) {
    logger.error('responses are missing');
    return res.status(400).json({ message: 'responses are required.' });
  }

  try {
    // Enregistrer les réponses du quiz
    const quiz = new Quiz({ userId, actionId, responses });
    await quiz.save();

    // Ajouter des jetons au portefeuille de l'utilisateur
    const action = await Action.findById(actionId);
    if (!action) {
      logger.error('Action not found');
      return res.status(404).json({ message: 'Action non trouvée.' });
    }

    const wallet = await TokenWallet.findOne({ userID: userId, companyID: action.companyID });
    if (!wallet) {
      logger.error('Wallet not found');
      return res.status(404).json({ message: 'Portefeuille non trouvé.' });
    }

    wallet.balance += action.tokens_reward;
    await wallet.save();

    // Marquer l'action comme réalisée par l'utilisateur
    const userAction = new UserAction({ userId, actionId });
    await userAction.save();

    res.status(201).json({ message: 'Quiz soumis avec succès et jetons attribués.' });
  } catch (error) {
    logger.error(`Error submitting quiz: ${error}`);
    res.status(500).json({ message: 'Erreur lors de la soumission du quiz.', error });
  }
});

module.exports = router;

// backend/controllers/actionController.js

// Assurez-vous qu'il n'y a qu'une seule déclaration de `Action`
const Action = require('../models/Action');
const TokenWallet = require('../models/TokenWallet');
const TokenTransaction = require('../models/TokenTransaction');
const logger = require('../logger');


exports.createAction = async (req, res) => {
  try {
    const { type, tokens_reward, companyID, action_details } = req.body;
    const action = new Action({ type, tokens_reward, companyID, action_details });
    await action.save();
    logger.info('Action créée avec succès');
    res.status(201).json({ message: 'Action créée avec succès.', action });
  } catch (error) {
    logger.error(`Erreur lors de la création de l'action: ${error.message}`);
    res.status(400).json({ message: 'Erreur lors de la création de l\'action.', error });
  }
};

exports.verifyAction = async (req, res) => {
  try {
    const { userID, actionID } = req.body;
    const action = await Action.findById(actionID);
    if (!action) {
      logger.error('Action non trouvée');
      return res.status(404).json({ message: 'Action non trouvée.' });
    }

    // Vérification de l'action ici (à personnaliser selon le type d'action)
    const verificationSuccess = true; // Supposons que la vérification soit réussie

    if (verificationSuccess) {
      const wallet = await TokenWallet.findOne({ userID, companyID: action.companyID });
      if (!wallet) {
        logger.error('Portefeuille non trouvé');
        return res.status(404).json({ message: 'Portefeuille non trouvé.' });
      }

      wallet.balance += action.tokens_reward;
      await wallet.save();

      const transaction = new TokenTransaction({
        tokenWalletID: wallet._id,
        type: 'credit',
        tokens_amount: action.tokens_reward,
        verification_details: { status: 'verified', actionID: action._id }
      });

      await transaction.save();

      logger.info('Action vérifiée et jetons crédités');
      res.status(200).json({ message: 'Action vérifiée et jetons crédités.', balance: wallet.balance });
    } else {
      logger.error('Vérification de l\'action échouée');
      res.status(400).json({ message: 'Vérification de l\'action échouée.' });
    }
  } catch (error) {
    logger.error(`Erreur lors de la vérification de l'action: ${error.message}`);
    res.status(400).json({ message: 'Erreur lors de la vérification de l\'action.', error });
  }
};


exports.getActionsByCompany = async (req, res) => {
  logger.info('Début de getActionsByCompany');
  try {
    const { companyId } = req.params;
    logger.info(`req.params: ${req}`);
    logger.info(`Récupération des actions pour la société ID: ${companyId}`);
    
    const actions = await Action.find({ companyID: companyId });
    
    if (!actions) {
      logger.error('Aucune action trouvée pour cette entreprise');
      return res.status(404).json({ message: 'Aucune action trouvée pour cette entreprise.' });
    }
    
    logger.info(`Nombre d'actions trouvées: ${actions.length}`);
    res.status(200).json(actions);
  } catch (error) {
    logger.error(`Erreur lors de la récupération des actions: ${error.message}`);
    res.status(400).json({ message: 'Erreur lors de la récupération des actions.', error });
  }
};


exports.performAction = async (req, res) => {
  const { actionId } = req.params;
  const userId = req.user.id;

  try {
    const action = await Action.findById(actionId);
    if (!action) {
      return res.status(404).json({ message: 'Action non trouvée' });
    }

    const companyId = action.companyID;

    // Mettre à jour le wallet
    let wallet = await TokenWallet.findOne({ userID: userId, companyID: companyId });
    if (!wallet) {
      wallet = new TokenWallet({
        userID: userId,
        companyID: companyId,
        balance: 0
      });
    }
    wallet.balance += action.tokens_reward;
    await wallet.save();

    // Créer une transaction
    const transaction = new TokenTransaction({
      userID: userId,
      companyID: companyId,
      actionID: actionId,
      amount: action.tokens_reward,
      type: 'reward'
    });
    await transaction.save();

    res.status(200).json({ message: 'Action effectuée avec succès', reward: action.tokens_reward });
  } catch (error) {
    res.status(400).json({ message: 'Erreur lors de l\'exécution de l\'action', error });
  }
};
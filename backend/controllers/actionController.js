const Action = require('../models/Action');
const TokenWallet = require('../models/TokenWallet');
const TokenTransaction = require('../models/TokenTransaction');
const UserAction = require('../models/UserAction');
const Quiz = require('../models/Quiz'); // Assurez-vous d'importer le modèle Quiz
const logger = require('../logger');

const mongoose = require('mongoose');

// Créer une action et un quiz associé
exports.createActionWithQuiz = async (req, res) => {
  try {
    const actionData = req.body;

    // Log initial des données reçues

    if (!actionData) {
      throw new Error("Aucune donnée reçue dans le corps de la requête.");
    }

    let companyIDObject;
    // Vérifiez si companyID est une chaîne hexadécimale de 24 caractères
    if (mongoose.Types.ObjectId.isValid(actionData.companyID)) {
      companyIDObject = new mongoose.Types.ObjectId(actionData.companyID);
    } else {
      throw new Error("Format de companyID invalide.");
    }

    // Préparation de l'objet actionData_
    const actionData_ = {
      ...actionData,
      companyID: companyIDObject
    };

    // Ajouter les champs quizQuestions et quizDescription si l'action est un quiz
    if (actionData_.type === 'quiz') {
      actionData_.quizQuestions = actionData.quizQuestions || [];
      actionData_.quizDescription = actionData.quizDescription || '';
    }


    // Création de l'action
    const action = new Action(actionData_);

    await action.save();


    res.status(201).json({ message: 'Action et quiz créés avec succès.', action });
  } catch (error) {
    logger.error('Erreur lors de la création de l\'action:', error);
    res.status(400).json({ message: 'Erreur lors de la création de l\'action.', error });
  }
};

// Fonction existante pour vérifier une action
exports.verifyAction = async (req, res) => {
  try {
    const { userID, actionID } = req.body;
    const action = await Action.findById(actionID);
    if (!action) {
      return res.status(404).json({ message: 'Action non trouvée.' });
    }

    const verificationSuccess = true; // Supposons que la vérification soit réussie

    if (verificationSuccess) {
      const wallet = await TokenWallet.findOne({ userID, companyID: action.companyID });
      if (!wallet) {
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

      res.status(200).json({ message: 'Action vérifiée et jetons crédités.', balance: wallet.balance });
    } else {
      res.status(400).json({ message: 'Vérification de l\'action échouée.' });
    }
  } catch (error) {
    res.status(400).json({ message: 'Erreur lors de la vérification de l\'action.', error });
  }
};

exports.getActionsByCompany = async (req, res) => {
  try {
    const { companyId } = req.params;

    // Vérification que l'ID de l'entreprise est un ObjectId valide
    if (!mongoose.Types.ObjectId.isValid(companyId)) {
      return res.status(400).json({ message: 'Invalid company ID format.' });
    }

    const actions = await Action.find({ companyID: companyId });

    if (!actions || actions.length === 0) {
      return res.status(404).json({ message: 'Aucune action trouvée pour cette entreprise.' });
    }

    res.status(200).json(actions);
  } catch (error) {
    console.error('Erreur lors de la récupération des actions:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des actions.', error });
  }
};

// Fonction existante pour effectuer une action
exports.performAction = async (req, res) => {
  const { actionId } = req.params;
  const userId = req.user.id;

  try {
    const action = await Action.findById(actionId);
    if (!action) {
      return res.status(404).json({ message: 'Action non trouvée' });
    }


    // Vérifier si l'utilisateur a déjà réalisé cette action
    const existingUserAction = await UserAction.findOne({ userId, actionId });
    if (existingUserAction) {
      return res.status(400).json({ message: 'Action déjà réalisée.' });
    }

    // Enregistrer l'action réalisée
    const userAction = new UserAction({ userId, actionId });
    await userAction.save();

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


exports.deleteAction = async (req, res) => {
  const { actionId } = req.params;

  try {
    await Action.findByIdAndDelete(actionId);
    res.status(200).json({ message: 'Action supprimée avec succès' });
  } catch (error) {
    res.status(400).json({ message: 'Erreur lors de la suppression de l\'action', error });
  }
};

exports.updateAction = async (req, res) => {
  const { actionId } = req.params;
  const updatedAction = req.body; // Pas besoin de destructurer ici, on veut directement tout l'objet


  try {
    const updatedAction_ = await Action.findByIdAndUpdate(actionId, updatedAction, { new: true });
    if (!updatedAction_) {
      return res.status(404).json({ message: 'Action non trouvée.' });
    }
    res.status(200).json(updatedAction_);
  } catch (error) {
    logger.error('Erreur lors de la mise à jour de l\'action:', error);
    res.status(400).json({ message: 'Erreur lors de la mise à jour de l\'action', error });
  }
};


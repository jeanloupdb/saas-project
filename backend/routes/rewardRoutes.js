const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/authMiddleware');
const Reward = require('../models/Reward');
const logger = require('../logger');
const User = require('../models/User');
const UserReward = require('../models/UserReward');



// Route pour créer un nouveau lot
router.post('/create', verifyToken, async (req, res) => {
  try {
      const  newReward  = req.body;
      const newReward_ = new Reward({
          ...newReward,
          companyID: req.user.id,
      });
  
      await newReward_.save();
      res.status(201).json({ message: 'Lot créé avec succès.', reward: newReward_ });
  } catch (error) {
      logger.error(`Erreur lors de la création du lot: ${error}`);
      res.status(500).json({ message: 'Erreur lors de la création du lot.', error });
  }
    
});


// Route pour récupérer les lots d'une entreprise
router.get('/get/:companyID', verifyToken, async (req, res) => {
  try {
    const { companyID } = req.params;

    const rewards = await Reward.find({ companyID });

    res.status(200).json(rewards);
  } catch (error) {
    logger.error(`Erreur lors de la récupération des lots: ${error.message}`);
    res.status(500).json({ message: 'Erreur lors de la récupération des lots', error });
  }
});

// Route pour supprimer un lot
router.delete('/:rewardID', verifyToken, async (req, res) => {
  try {
    const { rewardID } = req.params;
    await Reward.findByIdAndDelete(rewardID);

    res.status(200).json({ message: 'Lot supprimé avec succès.' });
  } catch (error) {
    logger.error(`Erreur lors de la suppression du lot: ${error.message}`);
    res.status(500).json({ message: 'Erreur lors de la suppression du lot', error });
  }
});

// Route pour mettre à jour un lot
router.put('/:rewardID', verifyToken, async (req, res) => {
  try {
    const { rewardID } = req.params;
    const updatedReward = req.body;

    const reward = await Reward.findByIdAndUpdate(rewardID, updatedReward, { new: true });

    res.status(200).json({ message: 'Lot mis à jour avec succès.', reward });
  } catch (error) {
    logger.error(`Erreur lors de la mise à jour du lot: ${error.message}`);
    res.status(500).json({ message: 'Erreur lors de la mise à jour du lot', error });
  }
} );

// Route pour récupérer les détails d'un lot spécifique
router.get('/:rewardID', verifyToken, async (req, res) => {
  try {
    const { rewardID } = req.params;
    const reward = await Reward.findById(rewardID);
    if (!reward) {
      return res.status(404).json({ message: 'Lot non trouvé.' });
    }
    res.status(200).json(reward);
  } catch (error) {
    logger.error(`Erreur lors de la récupération des détails du lot: ${error.message}`);
    res.status(500).json({ message: 'Erreur lors de la récupération des détails du lot', error });
  }
});
// Route pour récupérer les utilisateurs ayant gagné un lot spécifique
router.get('/users-by-reward/:rewardID', verifyToken, async (req, res) => {
  try {
    const { rewardID } = req.params;
    
    // Supposons que vous avez un modèle User qui contient un champ wonRewards
    const users = await User.find({ wonRewards: rewardID }).select('username email wonRewards');
    
    if (users.length === 0) {
      return res.status(404).json({ message: 'Aucun utilisateur trouvé pour ce lot.' });
    }

    res.status(200).json(users);
  } catch (error) {
    logger.error(`Erreur lors de la récupération des utilisateurs par lot: ${error.message}`);
    res.status(500).json({ message: 'Erreur lors de la récupération des utilisateurs par lot', error });
  }
});

// Route pour récupérer les détails d'un lot spécifique pour une entreprise spécifique pour une rareté spécifique
router.get('/rarity/:rarity/company/:companyID', verifyToken, async (req, res) => {
  try {
    
    const rarity = req.params.rarity;
    const companyID = req.params.companyID;

    // Si rarity est un nombre, assurez-vous qu'il est traité comme un nombre.
    const parsedRarity = Number(rarity);

    const rewards = await Reward.find({ rarity: parsedRarity, companyID: companyID });

    if (rewards.length === 0) {
      return res.status(404).json({ message: 'Aucun lot trouvé pour cette rareté et entreprise.' });
    }


    res.status(200).json(rewards);
  } catch (error) {
    logger.error(`Erreur lors de la récupération des lots par rareté et entreprise: ${error.message}`);
    res.status(500).json({ message: 'Erreur lors de la récupération des lots par rareté et entreprise', error });
  }
});

// Route pour récupérer les lots gagnés par un utilisateur
router.get('/user/:userId/company/:companyID', verifyToken, async (req, res) => {
  try {
    const userId = req.params.userId;
    const companyID = req.params.companyID;

    // Rechercher les lots gagnés par l'utilisateur et peupler les informations du lot (rewardID)
    const userRewards = await UserReward.find({ userID: userId, companyID }).populate('rewardID');

    // Filtrer les userRewards pour ignorer ceux où rewardID est null (le lot n'existe plus dans la collection Reward)
    const validUserRewards = userRewards.filter(userReward => userReward.rewardID !== null);

    // Si aucun lot valide n'est trouvé, retourner un message approprié
    if (validUserRewards.length === 0) {
      return res.status(404).json({ message: 'Aucun lot valide trouvé pour cet utilisateur.' });
    }

    // Map les résultats pour renvoyer uniquement les informations nécessaires
    const rewardsData = validUserRewards.map(userReward => ({
      _id: userReward._id,
      name: userReward.rewardID.name,
      description: userReward.rewardID.description,
      isClaimed: userReward.isClaimed, // Si le modèle `UserReward` contient un champ `claimed`
      distributionMethod: userReward.rewardID.distributionMethod,
      distributionDescription: userReward.rewardID.distributionDescription,
      pickupCode: userReward.pickupCode, // Si le modèle `UserReward` contient un champ `pickupCode`
      dateWon: userReward.date // La date à laquelle le lot a été gagné
    }));

    res.status(200).json(rewardsData);
  } catch (error) {
    logger.error('Erreur lors de la récupération des lots gagnés:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des lots gagnés.' });
  }
});



// Route pour mettre à jour les informations de contact pour un lot gagné
router.put('/claim/:userRewardID', verifyToken, async (req, res) => {
  try {
    const { userRewardID } = req.params;
    const { address, phoneNumber } = req.body;

    const userReward = await UserReward.findById(userRewardID);
    logger.info(userReward);
    if (!userReward) {
      return res.status(404).json({ message: 'Récompense non trouvée pour cet utilisateur.' });
    }

    userReward.address = address;
    userReward.phoneNumber = phoneNumber;
    userReward.isClaimed = true; // Marquer comme réclamé si nécessaire

    await userReward.save();

    res.status(200).json({ message: 'Informations de contact mises à jour avec succès.', userReward });
  } catch (error) {
    logger.error(`Erreur lors de la mise à jour des informations de contact: ${error.message}`);
    res.status(500).json({ message: 'Erreur lors de la mise à jour des informations de contact.', error });
  }
});

// Route pour mettre à jour le champ isClaimed d'un UserReward
router.put('/:userRewardID/claim', async (req, res) => {
  try {
    const { userRewardID } = req.params;
    const { isClaimed } = req.body;

    const userReward = await UserReward.findById(userRewardID);
    if (!userReward) {
      return res.status(404).json({ message: 'UserReward non trouvé' });
    }

    userReward.isClaimed = isClaimed;
    await userReward.save();

    res.status(200).json({ message: 'Statut isClaimed mis à jour avec succès', userReward });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du statut isClaimed:', error);
    res.status(500).json({ message: 'Erreur interne du serveur', error: error.message });
  }
});

// Route pour valider un code de retrait
router.get('/validate-code/:pickupCode', async (req, res) => {
  try {
    const { pickupCode } = req.params;
    // afficher tous les userReward
    const AllUserReward = await UserReward.find();
    console.log(AllUserReward);
    const userReward = await UserReward.findOne({ pickupCode }).populate('rewardID userID');
    
    if (!userReward) {
      return res.status(404).json({ message: 'Code non trouvé' });
    }
    
    res.status(200).json(userReward);
  } catch (error) {
    console.error('Erreur lors de la validation du code:', error);
    res.status(500).json({ message: 'Erreur interne du serveur', error: error.message });
  }
});

module.exports = router;

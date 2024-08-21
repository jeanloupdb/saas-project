const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/authMiddleware');
const Action = require('../models/Action');
const Reward = require('../models/Reward');
const TokenWallet = require('../models/TokenWallet');
const UserReward = require('../models/UserReward');

router.get('/global/:companyId', verifyToken, async (req, res) => {
  try {
    const { companyId } = req.params;

    const totalActions = await Action.countDocuments({ companyID: companyId });
    const totalRewards = await Reward.countDocuments({ companyID: companyId });

    // Récupérer les utilisateurs uniques avec un wallet pour l'entreprise
    const uniqueUsersWithWallet = await TokenWallet.distinct('userID', { companyID: companyId });
    const totalUsers = uniqueUsersWithWallet.length;

    // Récupérer les utilisateurs uniques ayant gagné un lot
    const uniqueUsersWhoWon = await UserReward.distinct('userID', { companyID: companyId });
    const totalUsersWhoWon = uniqueUsersWhoWon.length;

    res.status(200).json({
      totalActions,
      totalRewards,
      totalUsers,
      totalUsersWhoWon,  // Nombre d'utilisateurs ayant gagné un lot
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques globales:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des statistiques globales.', error });
  }
});

module.exports = router;

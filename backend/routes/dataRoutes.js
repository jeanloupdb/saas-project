const express = require('express');
const router = express.Router();
const { getUsersByAction, getUsersByReward } = require('../controllers/dataController');
const { verifyToken } = require('../middlewares/authMiddleware');

// Route pour récupérer les utilisateurs par action
router.get('/users-by-action/:actionId', verifyToken, getUsersByAction);

// Route pour récupérer les utilisateurs par récompense
router.get('/users-by-reward/:rewardId', verifyToken, getUsersByReward);

module.exports = router;

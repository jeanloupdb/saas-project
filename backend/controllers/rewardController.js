// controllers/RewardController.js
const UserReward = require('../models/UserReward');
const Reward = require('../models/Reward');
const { generatePickupCode } = require('../utils/codeGenerator'); // Assurez-vous de créer un utilitaire pour générer le code

const createUserReward = async (userID, rewardID, gameID, companyID) => {
  try {
    const reward = await Reward.findById(rewardID);

    if (!reward) {
      throw new Error("Reward not found");
    }

    let pickupCode = null;
    if (reward.distributionMethod === 'pickup_in_store') {
      pickupCode = generatePickupCode();
    }

    const userReward = new UserReward({
      userID,
      rewardID,
      gameID,
      companyID,
      date: new Date(),
      pickupCode, // Ajout du code de retrait s'il y a lieu
      isClaimed: false, // Par défaut, le lot n'est pas réclamé
    });

    await userReward.save();
    return userReward;
  } catch (error) {
    throw new Error(`Erreur lors de la création du UserReward: ${error.message}`);
  }
};

module.exports = {
  createUserReward,
};

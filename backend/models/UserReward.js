const mongoose = require('mongoose');

const userRewardSchema = new mongoose.Schema({
  userID: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rewardID: { type: mongoose.Schema.Types.ObjectId, ref: 'Reward', required: true },
  gameID: { type: mongoose.Schema.Types.ObjectId, ref: 'Game', required: true },
  companyID: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  date: { type: Date, default: Date.now },
  pickupCode: { type: String }, // Code de retrait
  isClaimed: { type: Boolean, default: false }, // Statut de réclamation
  address: { type: String }, // Nouveau champ pour l'adresse
  phoneNumber: { type: String }, // Nouveau champ pour le numéro de téléphone
});

const UserReward = mongoose.model('UserReward', userRewardSchema);

module.exports = UserReward;

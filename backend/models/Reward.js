const mongoose = require('mongoose');

const rewardSchema = new mongoose.Schema({
  name: { type: String, required: true },
  initialQuantity: { type: Number, required: true },
  remainingQuantity: { type: Number, required: true },
  companyID: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  rarity: { type: Number, required: true, min: 1, max: 100 }, // Rareté exprimée en pourcentage (1-100)
  description: { type: String}, // Description pour guider le gagnant
  distributionDescription: { type: String, required: true  }, // Instructions pour la distribution
  distributionMethod: { type: String, required: true }, // Méthode de distribution
  createdAt: { type: Date, default: Date.now },
});

rewardSchema.pre('validate', function (next) {
  if (this.isNew) {
    this.remainingQuantity = this.initialQuantity;
  }
  next();
});

const Reward = mongoose.model('Reward', rewardSchema);

module.exports = Reward;

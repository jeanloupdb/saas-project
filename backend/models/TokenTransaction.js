const mongoose = require('mongoose');

const tokenTransactionSchema = new mongoose.Schema({
  userID: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  companyID: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  actionID: { type: mongoose.Schema.Types.ObjectId, ref: 'Action', required: true },
  amount: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  type: { type: String, enum: ['reward', 'penalty'], required: true } // 'reward' pour gain de jetons, 'penalty' pour perte
});

module.exports = mongoose.model('TokenTransaction', tokenTransactionSchema);

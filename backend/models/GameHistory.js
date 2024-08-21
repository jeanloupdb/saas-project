// models/GameHistory.js
const mongoose = require('mongoose');

const gameHistorySchema = new mongoose.Schema({
  userID: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  gameID: { type: mongoose.Schema.Types.ObjectId, ref: 'Game', required: true },
  companyID: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  result: { type: String, enum: ['win', 'lose'], required: true },
  rewardID: { type: mongoose.Schema.Types.ObjectId, ref: 'Reward' },
  tokensSpent: { type: Number, required: true },
  date: { type: Date, default: Date.now },
});

const GameHistory = mongoose.model('GameHistory', gameHistorySchema);

module.exports = GameHistory;

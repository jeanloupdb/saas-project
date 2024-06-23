// backend/models/TokenWallet.js

const mongoose = require('mongoose');
const { Schema } = mongoose;

const tokenWalletSchema = new Schema({
  userID: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  companyID: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  balance: {
    type: Number,
    required: true,
    default: 0
  }
}, { collection: 'tokenWallets' });
const TokenWallet = mongoose.model('TokenWallet', tokenWalletSchema);

module.exports = TokenWallet;

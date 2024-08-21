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

tokenWalletSchema.statics.addTokens = async function(userId, companyId, tokens) {
  const wallet = await this.findOne({ userID: userId, companyID: companyId });
  if (!wallet) {
    const newWallet = new this({ userID: userId, companyID: companyId, balance: tokens });
    await newWallet.save();
  } else {
    wallet.balance += tokens;
    await wallet.save();
  }
};

const TokenWallet = mongoose.model('TokenWallet', tokenWalletSchema);

module.exports = TokenWallet;

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ActionSchema = new Schema({
  companyID: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  tokens_reward: { type: Number, required: true },
  type: { type: String, required: true },
  action_details: {
    description: { type: String, required: true },
    target_account: { type: String }, // Autres détails spécifiques à l'action
    review_platform: { type: String },
    review_url: { type: String }
  }
});

const Action = mongoose.model('Action', ActionSchema);

module.exports = Action;


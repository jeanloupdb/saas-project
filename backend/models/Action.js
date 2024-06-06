const mongoose = require('mongoose');

const ActionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  reward: { type: Number, required: true },
  type: { type: String, required: true },
});

module.exports = mongoose.model('Action', ActionSchema);


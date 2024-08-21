// Example Game Model
const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  entryCost: { type: Number, required: true },
  winChance: { type: Number, required: true }, // Probability as a percentage
  rewards: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Reward' }],
  global: { type: Boolean, default: true },
});

const Game = mongoose.model('Game', gameSchema);

module.exports = Game;

const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  entryCost: { type: Number, required: true },
  rarity: { type: String, required: true },
  icon: { type: String, required: true },  // Chemin de l'icône du jeu
  type: { type: String, required: true }  // Par exemple, "roulette", "coffres", etc.
});

const Game = mongoose.model('Game', gameSchema);

module.exports = Game;

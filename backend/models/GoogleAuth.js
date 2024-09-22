const mongoose = require('mongoose');

const googleAuthSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Référence vers l'utilisateur associé
  googleUserId: { type: String, required: true }, // ID de l'utilisateur Google
  name: { type: String, required: true }, // Nom de l'utilisateur Google
  email: { type: String, required: true }, // Email de l'utilisateur Google
  picture: { type: String, required: false }, // Photo de profil Google
  access_token: { type: String, required: true }, // Token d'accès Google
  refresh_token: { type: String, required: true }, // Refresh token Google
  token_expiry: { type: Date, required: true }, // Date d'expiration du token d'accès
}, { timestamps: true });

const GoogleAuth = mongoose.model('GoogleAuth', googleAuthSchema);

module.exports = GoogleAuth;

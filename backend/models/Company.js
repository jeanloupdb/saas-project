const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  name: { type: String, required: true },
  // Autres champs selon vos besoins
});

module.exports = mongoose.model('Company', companySchema);

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = require('../models/User');
const TokenWallet = require('../models/TokenWallet');
const { authMiddleware } = require('../middlewares/authMiddleware');

// Route pour obtenir tous les utilisateurs avec le rôle entreprise
router.get('/', authMiddleware, async (req, res) => {
  try {
    const companies = await User.find({ role: 'entreprise' });
    res.status(200).json({ companies });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des entreprises', error });
  }
});

// Route pour obtenir une entreprise spécifique par ID
router.get('/:companyId', authMiddleware, async (req, res) => {
  const { companyId } = req.params;
  console.log('companyId:', companyId);
  try {
    const company = await User.findById(companyId);
    if (!company || company.role !== 'entreprise') {
      return res.status(404).json({ message: 'Entreprise non trouvée' });
    }
    res.status(200).json({ company });
  } catch (error) {
    console.error('Erreur lors de la récupération des détails de l\'entreprise:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Route pour obtenir toutes les entreprises avec les soldes de jetons pour un client spécifique
router.get('/with-token-balances/:clientId', authMiddleware, async (req, res) => {
  const { clientId } = req.params;

  try {
    const companies = await User.find({ role: 'entreprise' });
    console.log('Companies found:', companies.length);

    const clientObjectId = new mongoose.Types.ObjectId(clientId);

    const wallets = await TokenWallet.find();
    console.log('Number of wallets found:', wallets.length);

    const companiesWithBalances = await Promise.all(companies.map(async (company) => {
      console.log(`Fetching wallet for client ${clientObjectId} and company ${company._id}`);
      const wallet = await TokenWallet.findOne({ userID: clientObjectId, companyID: company._id });
      if (!wallet) {
        console.log(`No wallet found for client ${clientObjectId} and company ${company._id}`);
      } else {
        console.log(`Wallet found for client ${clientObjectId} and company ${company._id}: ${wallet.balance} tokens`);
      }
      return {
        ...company.toObject(),
        tokenBalance: wallet ? wallet.balance : 0
      };
    }));

    res.status(200).json({ companies: companiesWithBalances });
  } catch (error) {
    console.error('Erreur lors de la récupération des entreprises et des balances des jetons:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des entreprises et des balances des jetons', error });
  }
});

module.exports = router;

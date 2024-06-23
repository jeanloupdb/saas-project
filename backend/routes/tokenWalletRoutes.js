const express = require('express');
const router = express.Router();
const tokenWalletController = require('../controllers/tokenWalletController');
const { authMiddleware } = require('../middlewares/authMiddleware');

// Route pour obtenir les soldes des wallets pour un client spécifique
router.get('/client/:clientId', authMiddleware, tokenWalletController.getTokenWalletsByClient);

// Route pour obtenir le solde d'un wallet spécifique
router.get('/:walletId', authMiddleware, tokenWalletController.getTokenWalletById);

// Route pour obtenir le solde d'un wallet pour un client et une entreprise spécifiques
router.get('/client/:clientId/company/:companyId', authMiddleware, tokenWalletController.getTokenWalletByClientAndCompany);

// route pour obtenir le nombre de wallets reliés à une entreprise
router.get('/company/:companyId', authMiddleware, tokenWalletController.getTokenWalletsByCompany);

module.exports = router;

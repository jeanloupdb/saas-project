const TokenWallet = require('../models/TokenWallet');

// Obtenir les soldes des wallets pour un client spécifique
exports.getTokenWalletsByClient = async (req, res) => {
  try {
    const { clientId } = req.params;
    const tokenWallets = await TokenWallet.find({ userID: clientId });

    if (!tokenWallets) {
      return res.status(404).json({ message: 'Wallets not found' });
    }

    res.status(200).json(tokenWallets);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching wallets', error });
  }
};

// Obtenir le solde d'un wallet spécifique
exports.getTokenWalletById = async (req, res) => {
  try {
    const { walletId } = req.params;
    const tokenWallet = await TokenWallet.findById(walletId);

    if (!tokenWallet) {
      return res.status(404).json({ message: 'Wallet not found' });
    }

    res.status(200).json(tokenWallet);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching wallet', error });
  }
};


// Obtenir le solde d'un wallet pour un client et une entreprise spécifiques
exports.getTokenWalletByClientAndCompany = async (req, res) => {
  try {
    const { clientId, companyId } = req.params;
    let tokenWallet = await TokenWallet.findOne({ userID: clientId, companyID: companyId });

    console.log('Token wallet for client and company:', tokenWallet);

    // Si le wallet n'existe pas, en créer un avec un solde de 0
    if (!tokenWallet) {
      tokenWallet = new TokenWallet({
        userID: clientId,
        companyID: companyId,
        balance: 0
      });

      await tokenWallet.save();
      console.log('New token wallet created:', tokenWallet);
    }

    res.status(200).json(tokenWallet);
  } catch (error) {
    console.error('Error fetching or creating wallet:', error);
    res.status(500).json({ message: 'Error fetching or creating wallet', error });
  }
};

// Obtenir le nombre de wallets reliés à une entreprise
exports.getTokenWalletsByCompany = async (req, res) => {
  try {
    const { companyId } = req.params;
    const tokenWallets = await TokenWallet.find({ companyID: companyId });
    const count = tokenWallets.length;
    res.status(200).json({ count });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching token wallets for company', error });
  }
};


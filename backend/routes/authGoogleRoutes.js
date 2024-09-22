const express = require('express');
const axios = require('axios');
const router = express.Router();
const { OAuth2Client, auth } = require('google-auth-library');
const logger = require('../logger');
const {authMiddleware} = require('../middlewares/authMiddleware');

const GoogleAuth = require('../models/GoogleAuth');
const oauth2Client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

router.get('/google', authMiddleware, (req, res) => {
    console.log('Route /google');
    const userId = req.user?.id; // L'ID utilisateur doit être présent via le middleware
    if (!userId) {
        return res.status(401).json({ message: 'Utilisateur non authentifié' });
    }

    req.session.save((err) => {
        if (err) {
            console.error('Erreur lors de la sauvegarde de la session:', err);
            return res.status(500).send('Erreur lors de la sauvegarde de la session');
        }

        console.log('Session après sauvegarde:', req.session);

        const url = oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: [
                'profile', 
                'email', 
                'https://www.googleapis.com/auth/business.manage'
            ],
            prompt: 'consent select_account',
            state: JSON.stringify({ userId }),  // Ajouter l'userId au state
            redirect_uri: process.env.GOOGLE_REDIRECT_URI,
        });

        console.log('Generated Google OAuth URL:', url);
        res.json({ authUrl: url });
    });
});



router.get('/google/callback', async (req, res) => {
    const code = req.query.code;
    const state = JSON.parse(req.query.state);  // Récupérer l'état qui contient l'userId
    const userId = state?.userId;
    try {
        // Récupérer les tokens d'accès avec le code reçu
        const { tokens } = await oauth2Client.getToken(code);
        oauth2Client.setCredentials(tokens);

        // Récupérer les informations de l'utilisateur Google
        const userInfoResponse = await oauth2Client.request({
            url: 'https://www.googleapis.com/oauth2/v3/userinfo',
        });
        const userInfo = userInfoResponse.data;

        // Récupérer l'ID de l'utilisateur depuis la session
        console.log('userId in /google/callback:', userId);

        if (!userId) {
            return res.status(401).send('Utilisateur non authentifié');
        }

        // Logique pour lier le compte Google
        let googleAuth = await GoogleAuth.findOne({ userId, googleUserId: userInfo.sub });

        if (!googleAuth) {
            googleAuth = new GoogleAuth({
                userId,
                googleUserId: userInfo.sub,
                name: userInfo.name,
                email: userInfo.email,
                picture: userInfo.picture,
                access_token: tokens.access_token,
                refresh_token: tokens.refresh_token,
                token_expiry: new Date(tokens.expiry_date),
            });
            await googleAuth.save();
        } else {
            googleAuth.access_token = tokens.access_token;
            googleAuth.refresh_token = tokens.refresh_token || googleAuth.refresh_token;
            googleAuth.token_expiry = new Date(tokens.expiry_date);
            await googleAuth.save();
        }

        // Rediriger après la sauvegarde
        req.session.save((err) => {
            if (err) {
                return res.status(500).send('Erreur lors de la sauvegarde de la session');
            }
            res.redirect('http://localhost:3000/dashboard-entreprise?action_creation=true&google_connected=true');
        });

    } catch (error) {
        console.error('Erreur lors de l\'authentification Google:', error);
        res.status(500).send('Échec de l\'authentification');
    }
});

  

// Route pour obtenir les infos de l'utilisateur Google
router.get('/googleuserinfo', (req, res) => {
    if (req.session && req.session.user) {
        res.json(req.session.user);
    } else {
        res.status(401).json({ message: 'Google user info not found' });
    }
});

// Route pour obtenir le token d'accès actuel
router.get('/access-token', (req, res) => {
    if (req.session && req.session.access_token) {
        res.json({ access_token: req.session.access_token });
    } else {
        res.status(401).json({ message: 'No access token found in session' });
    }
});

// Rafraîchir le token d'accès à partir du refresh token
router.get('/refresh-token', async (req, res) => {
    if (req.session && req.session.refresh_token) {
        try {
            const { tokens } = await oauth2Client.refreshToken(req.session.refresh_token);
            req.session.access_token = tokens.access_token;
            req.session.save();
            res.json({ access_token: tokens.access_token });
        } catch (error) {
            console.error('Error refreshing access token:', error);
            res.status(500).json({ message: 'Error refreshing access token' });
        }
    } else {
        res.status(401).json({ message: 'No refresh token found in session' });
    }
});


// Route pour récupérer tous les comptes Google associés à un utilisateur
router.get('/accounts/:userId', async (req, res) => {
    logger.info('Récupération des comptes Google pour l\'utilisateur:', req.params.userId);
  try {
    const { userId } = req.params;
    console.log('userId:', userId);
    // Rechercher tous les comptes Google liés à cet utilisateur
    const googleAccounts = await GoogleAuth.find({ userId });

    if (!googleAccounts.length) {
        console.log('Aucun compte Google trouvé pour cet utilisateur.');
      return res.status(404).json({ message: "Aucun compte Google trouvé pour cet utilisateur." });
    }

    // Retourner la liste des comptes Google
    res.status(200).json(googleAccounts);
  } catch (error) {
    console.error('Erreur lors de la récupération des comptes Google:', error);
    res.status(500).json({ message: "Erreur lors de la récupération des comptes Google", error });
  }
});

router.get('/account/:accountId', async (req, res) => {
    try {
        const { accountId } = req.params;
        const googleAccount = await GoogleAuth.findById(accountId);
        if (!googleAccount) {
            return res.status(404).json({ message: 'Compte Google non trouvé' });
        }
        res.json(googleAccount);
    } catch (error) {
        console.error('Erreur lors de la récupération du compte Google:', error);
        res.status(500).json({ message: 'Erreur lors de la récupération du compte Google', error });
    }
});
// Route pour récupérer les lieux associés à un compte Google My Business
router.get('/locations/:accountId', async (req, res) => {
    console.log('\nGET /locations/:accountId');
    try {
      const { accountId } = req.params;
      console.log('accountId:', accountId);
  
      // Récupérer le compte Google associé à cet accountId dans la base de données
      const googleAccount = await GoogleAuth.findById(accountId);
      if (!googleAccount) {
        return res.status(404).json({ message: 'Compte Google non trouvé' });
      }
      console.log('googleAccount:', googleAccount);
  
      let accessToken = googleAccount.access_token;
      const tokenExpiry = new Date(googleAccount.token_expiry);

      console.log('accessToken:', accessToken);
  
      // Vérifier si le token a expiré
      if (tokenExpiry < new Date()) {
        console.log('Token expiré. Rafraîchissement en cours...');
        
        // Rafraîchir le token
        const refreshToken = googleAccount.refresh_token;
        const requestBody = new URLSearchParams({
          grant_type: 'refresh_token',
          client_id: process.env.GOOGLE_CLIENT_ID,
          client_secret: process.env.GOOGLE_CLIENT_SECRET,
          refresh_token: refreshToken,
        });

        console.log('requestBody:', requestBody.toString());
  
        const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', requestBody.toString(), {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        });

        console.log('tokenResponse:', tokenResponse.data);
  
        // Mettre à jour le token et la date d'expiration dans la base de données
        accessToken = tokenResponse.data.access_token;
        googleAccount.access_token = accessToken;
        googleAccount.token_expiry = new Date(Date.now() + tokenResponse.data.expires_in * 1000);
        await googleAccount.save();

        console.log('Token rafraîchi avec succès');
      }
  
      // Faire une requête à Google My Business pour récupérer les lieux
      const response = await axios.get(`https://mybusinessbusinessinformation.googleapis.com/v1/accounts/${googleAccount.googleUserId}/locations`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
  
      // Retourner les lieux
      res.json({ locations: response.data.locations });
    } catch (error) {
      console.error('Erreur lors de la récupération des lieux:', error.response?.data || error.message);
      res.status(500).json({ error: 'Erreur lors de la récupération des lieux Google My Business' });
    }
  });
  
  // Route pour rafraîchir le token d'accès manuellement (si nécessaire)
  router.post('/refresh-token', async (req, res) => {
    const { refreshToken } = req.body;
  
    try {
      const requestBody = new URLSearchParams({
        grant_type: 'refresh_token',
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        refresh_token: refreshToken,
      });
  
      const response = await axios.post('https://oauth2.googleapis.com/token', requestBody.toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
  
      res.json({
        accessToken: response.data.access_token,
        expiresIn: response.data.expires_in,
      });
    } catch (error) {
      console.error('Erreur lors du rafraîchissement du token:', error.response?.data || error.message);
      res.status(500).json({ error: 'Erreur lors du rafraîchissement du token.' });
    }
  });

module.exports = router;
const express = require('express');
const router = express.Router();
const Action = require('../models/Action');
const mongoose = require('mongoose');
const { verifyToken } = require('../middlewares/authMiddleware');
const actionController = require('../controllers/actionController');
const { authMiddleware } = require('../middlewares/authMiddleware');

router.get('/company/:companyId', verifyToken, async (req, res) => {
    const { companyId } = req.params;
  
    try {
      // Convertir companyId en ObjectId avec 'new'
      const objectId = new mongoose.Types.ObjectId(companyId);
      
      // afficher les actions de l'entreprise dans le terminal
      console.log(`Request to /api/actions/company/${companyId} received`);
      const actions = await Action.find({ companyID: objectId });
      const allActions = await Action.find();
      console.log('Actions found with companyID =', companyId, ':', actions);
      // afficher l'ensemble des actions
      console.log('allActions found:', allActions);
      res.status(200).json({ actions });
    } catch (error) {
      console.error(`Error fetching actions for company ${companyId} (in action routes) :`, error);
      res.status(400).json({ message: 'Erreur lors de la récupération des actions', error });
    }
  });
  router.post('/create', verifyToken, async (req, res) => {
    const { companyID, tokens_reward, type, action_details } = req.body;
  
    if (!companyID || !tokens_reward || !type || !action_details || !action_details.description) {
      return res.status(400).json({ message: 'Tous les champs sont obligatoires' });
    }
  
    try {
      const action = new Action({
        companyID,
        tokens_reward,
        type,
        action_details
      });
      await action.save();
      res.status(201).json({ action });
    } catch (error) {
      console.error('Error creating action:', error);
      res.status(500).json({ message: 'Erreur lors de la création de l\'action' });
    }
  });
  
  

// Route pour effectuer une action
router.post('/:actionId/perform', authMiddleware, actionController.performAction);

  
module.exports = router;

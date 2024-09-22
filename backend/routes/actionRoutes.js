const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Action = require('../models/Action');
const UserAction = require('../models/UserAction'); // Assurez-vous d'importer ce modèle
const { authMiddleware } = require('../middlewares/authMiddleware');
const actionController = require('../controllers/actionController');
// logger
const logger = require('../logger');


// Route pour récupérer les actions d'une entreprise
router.get('/company/:companyId', authMiddleware, actionController.getActionsByCompany);

// Route pour récupérer une action par ID
router.get('/:id', async (req, res) => {
    const actionId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(actionId)) {
        return res.status(400).json({ message: 'Invalid ID format' });
    }

    try {
        const action = await Action.findById(actionId);
        if (!action) {
            return res.status(404).json({ message: 'Action not found' });
        }
        res.json(action);
    } catch (error) {
        console.error('Error fetching action:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Route pour créer une action
router.post('/create', authMiddleware, actionController.createAction);

// Route pour effectuer une action
router.post('/:actionId/perform', authMiddleware, actionController.performAction);

router.get('/completed/:userId', authMiddleware, async (req, res) => {
  try {
    const userId = req.params.userId;  // Récupère l'ID utilisateur à partir des paramètres d'URL

    // Vérification que l'ID utilisateur est un ObjectId valide
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      logger.error(`Invalid ID format for user: ${userId}`);
      return res.status(400).json({ message: 'Invalid ID format' });
    }

    
    const completedActions = await UserAction.find({ userId }).select('actionId -_id');

    res.status(200).json({ completedActions: completedActions.map(action => action.actionId.toString()) });
  } catch (error) {
    logger.error(`Error fetching completed actions: ${error}`);
    res.status(500).json({ message: 'Erreur lors de la récupération des actions complétées', error });
  }
});
// Route pour supprimer une action
router.delete('/:actionId', authMiddleware, actionController.deleteAction);

// Route pour mettre à jour une action
router.put('/:actionId', authMiddleware, actionController.updateAction);

module.exports = router;

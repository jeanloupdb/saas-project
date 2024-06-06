const Action = require('../models/Action');

exports.createAction = async (req, res) => {
  try {
    const action = new Action(req.body);
    await action.save();
    res.status(201).json({ message: 'Action created successfully', action });
  } catch (error) {
    res.status(400).json({ message: 'Error creating action', error });
  }
};

// Contrôleur pour vérifier une action
exports.verifyAction = async (req, res) => {
  // Implémentez la logique pour vérifier une action
};


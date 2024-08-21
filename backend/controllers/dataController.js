const UserAction = require('../models/UserAction');
const UserReward = require('../models/UserReward');
const logger = require('../logger');

// Contrôleur pour récupérer les utilisateurs par action
exports.getUsersByAction = async (req, res) => {
    const { actionId } = req.params;
  
    try {
      // Trouver les actions effectuées par les utilisateurs pour une action donnée
      const userActions = await UserAction.find({ actionId }).populate('userId');
  
      if (!userActions) {
        return res.status(404).json({ message: 'Aucune action trouvée pour cet ID' });
      }
  
      // Filtrer pour n'inclure que les utilisateurs qui sont des clients
      const clientUsers = userActions
        .map(userAction => userAction.userId)
        .filter(user => user.role === 'client'); // Assurez-vous que le champ `role` existe dans le modèle `User`
  
      res.json(clientUsers);
    } catch (error) {
      res.status(500).json({ message: 'Erreur lors de la récupération des utilisateurs par action', error });
    }
  };

// Contrôleur pour récupérer les utilisateurs par récompense
exports.getUsersByReward = async (req, res) => {
  const { rewardId } = req.params;

  try {
    const userRewards = await UserReward.find({ rewardID: rewardId }).populate('userID');
    if (!userRewards) {
      return res.status(404).json({ message: 'Aucune récompense trouvée pour cet ID' });
    }

    const users = userRewards.map(userReward => userReward.userID);
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des utilisateurs par récompense', error });
  }
};

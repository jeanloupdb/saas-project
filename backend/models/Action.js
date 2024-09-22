const mongoose = require('mongoose');

// Schéma pour les questions du quiz
const quizQuestionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  type: { type: String, required: true },
  options: { type: [{ value: String, isCorrect: Boolean }], required: false },
  correctAnswer: { type: String, required: false },
  min: { type: Number, required: false },
  max: { type: Number, required: false }
});

// Schéma pour les détails de l'action
const actionDetailsSchema = new mongoose.Schema({
  description: { type: String, required: true },
});

// Schéma de l'action
const actionSchema = new mongoose.Schema({
  companyID: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  tokens_reward: { type: Number, required: true },
  type: { type: String, enum: ['click', 'quiz', 'google_review'], required: true }, 
  action_details: actionDetailsSchema,
  quizQuestions: [quizQuestionSchema], 
  quizDescription: { type: String, required: false },

  // Référence à la collection GoogleAuth si l'action est un avis Google
  googleAuthId: { type: mongoose.Schema.Types.ObjectId, ref: 'GoogleAuth', required: false }, // Référence au compte Google lié pour l'action

}, { timestamps: true });

const Action = mongoose.model('Action', actionSchema, 'actions');

module.exports = Action;

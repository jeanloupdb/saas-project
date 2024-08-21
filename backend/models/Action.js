const mongoose = require('mongoose');

const quizQuestionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  type: { type: String, required: true },
  options: { type: [{ value: String, isCorrect: Boolean }], required: false },
  correctAnswer: { type: String, required: false },
  min: { type: Number, required: false },
  max: { type: Number, required: false }
});

const actionDetailsSchema = new mongoose.Schema({
  description: { type: String, required: true },
});

const actionSchema = new mongoose.Schema({
  companyID: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  tokens_reward: { type: Number, required: true },
  type: { type: String, enum: ['click', 'quiz'], required: true },
  action_details: actionDetailsSchema,
  quizQuestions: [quizQuestionSchema], // Add this line
  quizDescription: { type: String, required: false } // Add this line
});

const Action = mongoose.model('Action', actionSchema, 'actions');

module.exports = Action;

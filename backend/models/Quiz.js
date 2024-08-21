// models/Quiz.js
const mongoose = require('mongoose');

const quizResponseSchema = new mongoose.Schema({
  question: { type: String, required: true },
  response: { type: mongoose.Schema.Types.Mixed, required: true }  // It can be string, number, array etc.
});

const quizSchema = new mongoose.Schema({
  actionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Action', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  responses: [quizResponseSchema]
});

const Quiz = mongoose.model('Quiz', quizSchema);

module.exports = Quiz;

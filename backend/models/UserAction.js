const mongoose = require('mongoose');
const { Schema } = mongoose;

const userActionSchema = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  actionId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Action'
  },
  completedAt: {
    type: Date,
    default: Date.now
  }
}, { collection: 'userActions' });

module.exports = mongoose.model('UserAction', userActionSchema);

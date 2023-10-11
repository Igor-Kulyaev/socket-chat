const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  conversationName: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }]
});

const Conversation = mongoose.model('Conversation', conversationSchema);

module.exports = {
  Conversation
}

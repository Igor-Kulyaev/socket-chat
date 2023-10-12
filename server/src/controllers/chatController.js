const jwt = require("jsonwebtoken");
const jwtConfig = require("../config/jwtConfig");
const User = require("../models/user");
const {Token} = require("../models/token");
const ApplicationError = require("../utils/error/ApplicationError");
const {Conversation} = require("../models/conversation");
const {Message} = require("../models/message");
const getChatMessages = async (req, res, next) => {
  try {
    const authorizationToken = req.headers.authorization;
    if (!authorizationToken) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const tokenParts = authorizationToken.split(' ');
    if (tokenParts.length !== 2 || tokenParts[0] !== 'Bearer') {
      return res.status(401).json({ message: 'Invalid token format' });
    }

    const accessToken = tokenParts[1];

    const {recipientId, lastMessageId} = req.query;

    const checkedToken = jwt.verify(accessToken, jwtConfig.jwtAccessSecret);
    const senderId = checkedToken._id;

    // Check if a conversation exists between sender and recipient
    const conversation = await Conversation.findOne({
      members: { $all: [senderId, recipientId] },
    });

    console.log('conversation', conversation);

    if (conversation) {
      // Conversation exists, retrieve messages
      const messages = await Message.find({
        conversationId: conversation._id,
      }).sort({ createdAt: 1 });

      res.status(200).json({ messages });
    } else {
      // Conversation doesn't exist, send an empty array of messages
      res.status(200).json({ messages: [] });
    }


    res.status(201).json({ });
  } catch (error) {
    console.error('Error during getting messages:', error);
    next(error);
  }
}

module.exports = {
  getChatMessages
}

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

    if (!conversation) {
      return res.status(200).json({ messages: [] });
    }

    // Prepare the query for fetching messages
    const messageQuery = { conversationId: conversation._id };

    // If lastMessageId is provided, fetch messages older than that message
    if (lastMessageId) {
      const lastMessage = await Message.findById(lastMessageId);
      if (lastMessage) {
        messageQuery.createdAt = { $lt: lastMessage.createdAt };
      }
    }

    // Fetch the messages with pagination
    // const messages = await Message.find(messageQuery)
    //   .sort({ createdAt: -1 })
    //   .limit(10)
    //   .sort({ createdAt: 1 }); // Re-sort the result in descending order

    const messages = await Message.aggregate([
      { $match: messageQuery },
      { $sort: { createdAt: -1 } }, // Sort in descending order
      { $limit: 10 },
      // { $sort: { createdAt: 1 } }, // Re-sort in ascending order
    ]);

    res.status(200).json({ messages });
  } catch (error) {
    console.error('Error during getting messages:', error);
    next(error);
  }
}

module.exports = {
  getChatMessages
}

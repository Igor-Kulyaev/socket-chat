const jwt = require("jsonwebtoken");
const jwtConfig = require("../config/jwtConfig");
const {getMessagesService} = require("../services/chatService");

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

    const {
      conversation,
      messages,
    } = await getMessagesService({senderId, recipientId, lastMessageId});

    if (!conversation) {
      return res.status(200).json({ messages: [] });
    }

    res.status(200).json({ messages });
  } catch (error) {
    console.error('Error during getting messages:', error);
    next(error);
  }
}

module.exports = {
  getChatMessages
}

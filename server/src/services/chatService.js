const {Conversation} = require("../models/conversation");
const {Message} = require("../models/message");
const User = require("../models/user");
const {validateData} = require("../utils/utils");
const {messageSchema} = require("../utils/validation/schemas");
const ApplicationError = require("../utils/error/ApplicationError");

const getMessagesService = async ({senderId, recipientId, lastMessageId}) => {
  try {
    // Check if a conversation exists between sender and recipient
    const conversation = await Conversation.findOne({
      members: { $all: [senderId, recipientId] },
    });

    if (!conversation) {
      return {
        conversation: null,
        messages: null,
      }
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
    const messages = await Message.aggregate([
      { $match: messageQuery },
      { $sort: { createdAt: -1 } },
      { $limit: 10 },
    ]);

    return {
      conversation,
      messages,
    }
  } catch (error) {
    throw new ApplicationError(error.status || 500, error.message);
  }
}

const createMessageService = async ({message, senderId, recipientId}) => {
  try {
    await validateData(messageSchema, {message});
    // Check that recipient exists
    const recipient = await User.findOne({ _id: recipientId });
    if (!recipient) {
      throw new ApplicationError(400, 'You send message to not existing user.');
    }
    // Check if there is a conversation with the specified members
    let conversation = await Conversation.findOne({
      members: {$all: [senderId, recipientId]},
    });

    if (!conversation) {
      // If no conversation is found, create a new conversation
      conversation = await Conversation.create({
        members: [senderId, recipientId],
      });
    }

    // Create a new message
    const createdMessage = await Message.create({
      userId: senderId,
      message,
      conversationId: conversation._id,
    });

    return {
      createdMessage
    }
  } catch (error) {
    throw new ApplicationError(error.status || 500, error.message);
  }
}

module.exports = {
  getMessagesService,
  createMessageService
}

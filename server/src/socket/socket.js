const jwt = require("jsonwebtoken");
const jwtConfig = require("../config/jwtConfig");
const User = require("../models/user");
const {registerUser} = require("../controllers/authController");
const {Token} = require("../models/token");
const {Conversation} = require("../models/conversation");
const {Message} = require("../models/message");

const activeSockets = {};
const setupSocket = (io) => {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      const checkToken = jwt.verify(token, jwtConfig.jwtAccessSecret);
      const allsockets = await io.fetchSockets();

      const newUser = await User.findOne({ _id: checkToken._id });
      socket.data.userData = newUser;

      if (!newUser) {
        socket.disconnect();
        return;
      }

      const presentUser = allsockets.find(item => item.data.userData._id === newUser._id);
      const presentUserInActiveSockets = activeSockets[checkToken._id];
      // if (presentUser) {
      //   presentUser.disconnect();
      // }
      if (presentUserInActiveSockets) {
        presentUserInActiveSockets.disconnect();
        delete activeSockets[presentUserInActiveSockets];
      }
      if (checkToken) {
        next();
      }
    } catch (error) {
      console.log('error at socket middleware', error);
    }
  });

  io.on("connection", async (socket) => {
    console.log(`User Connected: ${socket.id}`);

    activeSockets[socket.data.userData._id.toString()] = socket;
    const allsockets = await io.fetchSockets();
    console.log('allsockets', allsockets);
    console.log('allsockets.length', allsockets.length);

    const users = await User.find({}, 'username firstName lastName email _id').lean();
    const formattedUsers = users.map((user) => {
      return {...user, online: !!activeSockets[user._id]}
    })

    console.log('users', users);
    io.emit('users-list', formattedUsers);

    socket.on('message', async function (formData, callback) {
      console.log('message at backend', formData);
      try {
        // Check if there is a conversation with the specified members
        let conversation = await Conversation.findOne({
          members: {$all: [socket.data.userData._id, formData.to._id]},
        });

        if (!conversation) {
          // If no conversation is found, create a new conversation
          conversation = new Conversation({
            members: [socket.data.userData._id, formData.to._id],
          });
          await conversation.save();
        }
        console.log('Found or created conversation:', conversation);

        // Create a new message
        const message = new Message({
          userId: socket.data.userData._id,
          message: formData.message,
          conversationId: conversation._id,
        });

        await message.save();

        // Continue with your logic
        console.log('Message created:', message);

        const recipientSocket = activeSockets[formData.to._id];
        callback(message);
        if (recipientSocket) {
          recipientSocket.emit('message', message);
        }
      } catch (error) {
        console.error('Error handling conversation:', error);
      }
      // const foundSocket = activeSockets["6523f0684dcf928861788fc7"];
      // foundSocket.emit('message', 'response from backend');
    })

    socket.on('disconnect', () => {
      delete activeSockets[socket.data.userData._id];
      const formattedUsers = users.map((user) => {
        return {...user, online: !!activeSockets[user._id]}
      })
      console.log('activeSockets keys', Object.keys(activeSockets));
      io.emit('users-list', formattedUsers);
    })

    socket.on('logout', async () => {
      try {
        socket.disconnect();
        delete activeSockets[socket.data.userData._id];
        await Token.deleteOne({ userId: socket.data.userData._id });
        const formattedUsers = users.map((user) => {
          return {...user, online: !!activeSockets[user._id]}
        })
        io.emit('users-list', formattedUsers);
      } catch (error) {
        console.log('error at logout', error)
      }
    });



  });
}

module.exports = {
  setupSocket
}

const jwt = require("jsonwebtoken");
const jwtConfig = require("../config/jwtConfig");
const User = require("../models/user");
const {Token} = require("../models/token");
const {createMessageService} = require("../services/chatService");

// Record<userId, socket> contains one socket per user
const activeSockets = {};
const setupSocket = (io) => {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      const payload = jwt.verify(token, jwtConfig.jwtAccessSecret);
      const newUser = await User.findOne({ _id: payload._id });
      socket.data.userData = newUser;

      if (!newUser) {
        socket.disconnect();
        return;
      }

      const presentUserInActiveSockets = activeSockets[payload._id];

      if (presentUserInActiveSockets) {
        presentUserInActiveSockets.disconnect();
      }

      if (payload) {
        next();
      }
    } catch (error) {
      console.log('Error at socket middleware', error);
    }
  });

  io.on("connection", async (socket) => {
    activeSockets[socket.data.userData._id.toString()] = socket;

    const allUsers = await User.find({}, 'username firstName lastName email _id').lean();
    const allUsersWithOnlineStatus = allUsers.map((user) => {
      return {...user, online: !!activeSockets[user._id]}
    });

    io.emit('users-list', allUsersWithOnlineStatus);

    socket.on('message', async function (formData, callback) {
      try {
        const {createdMessage} = await createMessageService({
          message: formData.message,
          senderId: socket.data.userData._id,
          recipientId: formData.to._id
        });

        const recipientSocket = activeSockets[formData.to._id];
        callback(null, createdMessage);
        if (recipientSocket) {
          recipientSocket.emit('message', createdMessage);
        }
      } catch (error) {
        const responseError = typeof error === "string"
          ? error
          : (error?.message || "Error at sending message");
        callback(responseError);
        console.error('Error handling conversation:', error);
      }
    });

    socket.on('disconnect', () => {
      delete activeSockets[socket.data.userData._id];
      const allUsersWithOnlineStatus = allUsers.map((user) => {
        return {...user, online: !!activeSockets[user._id]}
      })
      io.emit('users-list', allUsersWithOnlineStatus);
    })

    socket.on('logout', async () => {
      try {
        socket.disconnect();
        delete activeSockets[socket.data.userData._id];
        await Token.deleteOne({ userId: socket.data.userData._id });
        const allUsersWithOnlineStatus = allUsers.map((user) => {
          return {...user, online: !!activeSockets[user._id]}
        })
        io.emit('users-list', allUsersWithOnlineStatus);
      } catch (error) {
        console.log('Error at logout', error)
      }
    });
  });
}

module.exports = {
  setupSocket
}

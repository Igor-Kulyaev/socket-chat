const jwt = require("jsonwebtoken");
const jwtConfig = require("../config/jwtConfig");
const User = require("../models/user");

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

    socket.on('message', async function (message) {
      console.log('message at backend', message);
      const foundSocket = activeSockets["6523f0684dcf928861788fc7"];
      foundSocket.emit('message', 'response from backend');
    })
  });
}

module.exports = {
  setupSocket
}

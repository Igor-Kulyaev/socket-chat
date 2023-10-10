const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const {connectDB} = require("./database/mongoose");
const passport = require('./utils/passportjs/passport');
const authRoutes = require('./router/authRoutes');
const ApplicationError = require("./utils/error/ApplicationError");
const { createServer } = require("http");
const { Server } = require("socket.io");
const jwt = require('jsonwebtoken');
const config = require("./config/config");
const User = require('./models/user');

const activeSockets = {};

const app = express();
const port = 5000;

const errorHandler = (error, req, res, next) => {
  console.log(`Status code: ${error.statusCode || 500}, Error message: ${error.message}, Url: ${req.url}, Method: ${req.method}`);
  res.status(error.statusCode || 500).json({message: error.message || 'Internal server error'});
}

const corsOptions = {
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowHeaders: 'Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers',
  credentials: true
}

app.use(passport.initialize());
app.use(express.json());
app.use(cookieParser());
app.use(cors(corsOptions));

app.use('/', authRoutes);

// Protected route example

app.get('/verify-token', passport.authenticate('jwt', {session: false}), (req, res) => {
  res.status(200).json({message: 'Verified'});
})
app.get('/protected', passport.authenticate('jwt', { session: false }), (req, res) => {
  res.json({ message: 'Protected route accessed successfully!' });
});

app.route("*").all((req, res, next) => {
  next(new ApplicationError(404, "Item not found"));
});

app.use(errorHandler);

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: true,
});

io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    const checkToken = jwt.verify(token, config.jwtAccessSecret);
    console.log('checkToken', checkToken)
    const allsockets = await io.fetchSockets();

    const newUser = await User.findOne({ _id: checkToken._id });
    console.log('newUser', newUser)
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

connectDB()
  .then(() => {
    httpServer.listen(port, () => {
      console.log(`Example app listening on port ${port}`)
    })
  })
  .catch(err => console.log(err));

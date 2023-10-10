const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { createServer } = require("http");
const { Server } = require("socket.io");
const passport = require('./utils/passportjs/passport');
const authRoutes = require('./router/authRoutes');
const ApplicationError = require("./utils/error/ApplicationError");
const {connectDB} = require("./database/mongoose");
const corsConfig = require("./config/corsConfig");
const {errorHandler} = require("./utils/middlewares/middlewares");
const {setupSocket} = require("./socket/socket");

const app = express();
const port = 5000;

app.use(passport.initialize());
app.use(express.json());
app.use(cookieParser());
app.use(cors(corsConfig));
app.use('/', authRoutes);

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

setupSocket(io);

connectDB()
  .then(() => {
    httpServer.listen(port, () => {
      console.log(`Example app listening on port ${port}`)
    })
  })
  .catch(err => console.log(err));

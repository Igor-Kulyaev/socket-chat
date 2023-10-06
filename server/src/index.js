const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const {connectDB} = require("./database/mongoose");
const passport = require('./utils/passportjs/passport');
const authRoutes = require('./router/authRoutes');
const ApplicationError = require("./utils/error/ApplicationError");

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
// app.use(cors(corsOptions));

app.use('/', authRoutes);

// Protected route example
app.get('/protected', passport.authenticate('jwt', { session: false }), (req, res) => {
  res.json({ message: 'Protected route accessed successfully!' });
});

app.route("*").all((req, res, next) => {
  next(new ApplicationError(404, "Item not found"));
});

app.use(errorHandler);

connectDB()
  .then(() => {
    app.listen(port, () => {
      console.log(`Example app listening on port ${port}`)
    })
  })
  .catch(err => console.log(err));

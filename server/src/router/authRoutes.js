const express = require('express');
const passport = require("../utils/passportjs/passport");
const {registerUser, loginUser, logoutUser, refreshToken} = require("../controllers/authController");
const jwt = require("jsonwebtoken");
const jwtConfig = require("../config/jwtConfig"); // Your JWT configuration file

const router = express.Router();

router.post('/register', registerUser);

router.post('/login', loginUser);

router.post('/logout', logoutUser);

router.get('/refresh', refreshToken);

router.get('/verify-token', passport.authenticate('jwt', {session: false}), (req, res) => {
  const authorizationHeader = req.header('Authorization');
  console.log('authorizationHeader', authorizationHeader);

  if (!authorizationHeader) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const tokenParts = authorizationHeader.split(' ');
  if (tokenParts.length !== 2 || tokenParts[0] !== 'Bearer') {
    return res.status(401).json({ message: 'Invalid token format' });
  }

  const token = tokenParts[1];

  try {
    const checkedToken = jwt.verify(token, jwtConfig.jwtAccessSecret);
    const userData = {
      username: checkedToken.username,
      _id: checkedToken._id,
      email: checkedToken.email,
      role: checkedToken.role
    }
    res.status(200).json({message: 'Verified', user: userData});
  } catch (error) {
    res.status(401).json({ message: 'Unauthorized', error: error.message });
  }
});

module.exports = router;
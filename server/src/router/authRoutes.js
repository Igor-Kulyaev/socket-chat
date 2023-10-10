const express = require('express');
const passport = require("../utils/passportjs/passport");
const {registerUser, loginUser, logoutUser, refreshToken} = require("../controllers/authController"); // Your JWT configuration file

const router = express.Router();

router.post('/register', registerUser);

router.post('/login', loginUser);

router.post('/logout', logoutUser);

router.get('/refresh', refreshToken);

router.get('/verify-token', passport.authenticate('jwt', {session: false}), (req, res) => {
  res.status(200).json({message: 'Verified'});
});

module.exports = router;
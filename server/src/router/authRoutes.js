const express = require('express');
const passport = require("../utils/passportjs/passport");
const {registerUser, loginUser, logoutUser, refreshToken, verifyToken} = require("../controllers/authController");

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/refresh', refreshToken);
router.get('/verify-token', passport.authenticate('jwt', {session: false}), verifyToken);

module.exports = router;

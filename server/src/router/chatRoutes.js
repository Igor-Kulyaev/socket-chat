const express = require('express');
const passport = require("../utils/passportjs/passport");
const {getChatMessages} = require("../controllers/chatController");

const router = express.Router();

router.get('/chat-messages', passport.authenticate('jwt', {session: false}), getChatMessages);

module.exports = router;

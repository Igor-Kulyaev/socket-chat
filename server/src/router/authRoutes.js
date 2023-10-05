const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user'); // Assuming your user model is in a separate file
const config = require('../config/config');
const {createJWTPayload} = require("../utils/utils");
const ApplicationError = require("../utils/error/ApplicationError"); // Your JWT configuration file

const router = express.Router();

router.post('/register', async (req, res, next) => {
  try {
    const existingUser = await User.findOne({ username: req.body.username });
    if (existingUser) {
      throw new ApplicationError(400, 'Username is taken');
      // return res.status(400).json({ message: 'Username is taken' });
    }

    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    const newUser = new User({
      username: req.body.username,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      password: hashedPassword,
      role: 'user',
      authType: 'internal',
    });

    const savedUser = await newUser.save();
    const payload = createJWTPayload(savedUser);

    const token = jwt.sign(payload, config.jwtSecret, {
      expiresIn: '10m',
    });

    res.status(201).json({ token });
  } catch (error) {
    console.error('Error during registration:', error);
    next(error);
    // res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const user = await User.findOne({ username: req.body.username });
    if (!user) {
      throw new ApplicationError(404, 'User not found');
      // return res.status(404).json({ message: 'User not found' });
    }

    const passwordMatch = await bcrypt.compare(req.body.password, user.password);
    if (!passwordMatch) {
      throw new ApplicationError(401, 'Incorrect password');
      // return res.status(401).json({ message: 'Incorrect password' });
    }

    const payload = createJWTPayload(user);

    const token = jwt.sign(payload, config.jwtSecret, {
      expiresIn: '1m',
    });

    res.status(200).json({ token });
  } catch (error) {
    console.error('Error during login:', error);
    next(error);
    // res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {createJWTPayload, validateRefreshToken} = require("../utils/utils");
const jwtConfig = require("../config/jwtConfig");
const User = require("../models/user");
const {Token} = require("../models/token");
const ApplicationError = require("../utils/error/ApplicationError");
const registerUser = async (req, res, next) => {
  try {
    const existingUser = await User.findOne({ username: req.body.username });
    if (existingUser) {
      throw new ApplicationError(400, 'Username is taken');
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

    const accessToken = jwt.sign(payload, jwtConfig.jwtAccessSecret, {
      expiresIn: '10m',
    });
    const refreshToken = jwt.sign(payload, jwtConfig.jwtRefreshSecret, {
      expiresIn: '15m',
    });

    const token = new Token({
      userId: savedUser._id,
      refreshToken: refreshToken,
    });

    // Save the token to the database
    const savedToken = await token.save();

    res.cookie('refreshToken', refreshToken, {maxAge: 720000, httpOnly: true});
    res.status(201).json({ token: accessToken, user: payload });
  } catch (error) {
    console.error('Error during registration:', error);
    next(error);
  }
}

const loginUser = async (req, res, next) => {
  try {
    const user = await User.findOne({ username: req.body.username });
    if (!user) {
      throw new ApplicationError(404, 'User not found');
    }

    const passwordMatch = await bcrypt.compare(req.body.password, user.password);
    if (!passwordMatch) {
      throw new ApplicationError(401, 'Incorrect password');
    }

    const payload = createJWTPayload(user);

    const accessToken = jwt.sign(payload, jwtConfig.jwtAccessSecret, {
      expiresIn: '10m',
    });
    const refreshToken = jwt.sign(payload, jwtConfig.jwtRefreshSecret, {
      expiresIn: '15m',
    });

    const updatedOrCreatedToken = await Token.findOneAndUpdate(
      { userId: user._id },
      {
        refreshToken: refreshToken,
        updatedAt: new Date(),
      },
      {
        upsert: true,
        new: true,
      }
    )

    console.log('refreshToken', refreshToken);

    res.cookie('refreshToken', refreshToken, {maxAge: 720000, httpOnly: true});
    res.status(200).json({ token: accessToken, user: payload });
  } catch (error) {
    console.error('Error during login:', error);
    next(error);
  }
}

const logoutUser = async (req, res, next) => {
  try {
    const {refreshToken} = req.cookies;
    const {_id} = validateRefreshToken(refreshToken);
    await Token.deleteOne({ userId: _id });
    res.clearCookie('refreshToken');
    res.status(200).json({message: 'User has logged out'});
  } catch (error) {
    console.error('Error during logout:', error);
    next(error);
  }
}

const refreshToken = async (req, res, next) => {
  try {
    const {refreshToken} = req.cookies;
    if (!refreshToken) {
      throw new ApplicationError(401, 'User is not authorized');
    }
    const tokenPayload = validateRefreshToken(refreshToken);
    const tokenFromDb = await Token.findOne({ userId: tokenPayload._id });

    console.log('tokenFromDb', tokenFromDb);

    if (!tokenFromDb) {
      throw new ApplicationError(401, 'User is not authorized');
    }

    const newAccessToken = jwt.sign(createJWTPayload(tokenPayload), jwtConfig.jwtAccessSecret, {
      expiresIn: '10m',
    });
    const newRefreshToken = jwt.sign(createJWTPayload(tokenPayload), jwtConfig.jwtRefreshSecret, {
      expiresIn: '15m',
    });

    const updatedToken = await Token.findOneAndUpdate(
      { userId: tokenPayload._id },
      {
        refreshToken: refreshToken,
        updatedAt: new Date(),
      },
      {
        upsert: false,
        new: true,
      }
    )

    res.cookie('refreshToken', newRefreshToken, {maxAge: 720000, httpOnly: true});
    res.status(200).json({ token: newAccessToken });
  } catch (error) {
    console.error('Error during refresh:', error);
    next(error);
  }
}

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  refreshToken,
}

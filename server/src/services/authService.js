const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {createJWTPayload, validateRefreshToken, validateData} = require("../utils/utils");
const jwtConfig = require("../config/jwtConfig");
const User = require("../models/user");
const {Token} = require("../models/token");
const ApplicationError = require("../utils/error/ApplicationError");
const {registrationSchema, loginSchema} = require("../utils/validation/schemas");

const registerUserService = async (bodyData) => {
  try {
    await validateData(registrationSchema, bodyData);
    const existingUser = await User.findOne({ username: bodyData.username });
    if (existingUser) {
      throw new ApplicationError(400, 'Username is taken');
    }

    const hashedPassword = await bcrypt.hash(bodyData.password, 10);

    const savedUser = await User.create({
      username: bodyData.username,
      firstName: bodyData.firstName,
      lastName: bodyData.lastName,
      email: bodyData.email,
      password: hashedPassword,
      role: 'user',
      authType: 'internal',
    });
    const payload = createJWTPayload(savedUser);

    const accessToken = jwt.sign(payload, jwtConfig.jwtAccessSecret, {
      expiresIn: jwtConfig.jwtAccessExpiration,
    });
    const refreshToken = jwt.sign(payload, jwtConfig.jwtRefreshSecret, {
      expiresIn: jwtConfig.jwtRefreshExpiration,
    });

    await Token.create({
      userId: savedUser._id,
      refreshToken: refreshToken,
    });

    return {
      refreshToken,
      accessToken,
      payload,
    }
  } catch (error) {
    throw new ApplicationError(error.status || 500, error.message);
  }
}

const loginUserService = async (bodyData) => {
  try {
    await validateData(loginSchema, bodyData);
    const user = await User.findOne({ username: bodyData.username });
    if (!user) {
      throw new ApplicationError(404, 'User not found');
    }

    const passwordMatch = await bcrypt.compare(bodyData.password, user.password);
    if (!passwordMatch) {
      throw new ApplicationError(401, 'Incorrect password');
    }

    const payload = createJWTPayload(user);

    const accessToken = jwt.sign(payload, jwtConfig.jwtAccessSecret, {
      expiresIn: jwtConfig.jwtAccessExpiration,
    });
    const refreshToken = jwt.sign(payload, jwtConfig.jwtRefreshSecret, {
      expiresIn: jwtConfig.jwtRefreshExpiration,
    });

    await Token.findOneAndUpdate(
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

    return {
      refreshToken,
      accessToken,
      payload,
    }
  } catch (error) {
    throw new ApplicationError(error.status || 500, error.message);
  }
}

const logoutUserService = async (refreshToken) => {
  try {
    const {_id} = validateRefreshToken(refreshToken);
    await Token.deleteOne({ userId: _id });
  } catch (error) {
    throw new ApplicationError(error.status || 500, error.message);
  }
}

const refreshTokenService = async (refreshToken) => {
  try {
    if (!refreshToken) {
      throw new ApplicationError(401, 'User is not authorized');
    }
    const tokenPayload = validateRefreshToken(refreshToken);
    const tokenFromDb = await Token.findOne({ userId: tokenPayload._id });

    if (!tokenFromDb) {
      throw new ApplicationError(401, 'User is not authorized');
    }

    const refreshedPayload = createJWTPayload(tokenPayload);

    const newAccessToken = jwt.sign(refreshedPayload, jwtConfig.jwtAccessSecret, {
      expiresIn: jwtConfig.jwtAccessExpiration,
    });
    const newRefreshToken = jwt.sign(refreshedPayload, jwtConfig.jwtRefreshSecret, {
      expiresIn: jwtConfig.jwtRefreshExpiration,
    });

    await Token.findOneAndUpdate(
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

    return {
      newRefreshToken,
      newAccessToken,
      refreshedPayload
    }
  } catch (error) {
    throw new ApplicationError(error.status || 500, error.message);
  }
}

module.exports = {
  registerUserService,
  loginUserService,
  logoutUserService,
  refreshTokenService,
}
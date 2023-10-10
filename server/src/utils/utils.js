const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwtConfig');
const ApplicationError = require("./error/ApplicationError");
const createJWTPayload = (data) => {
  return {
    username: data.username,
    _id: data._id.toString(),
    email: data.email,
    role: data.role
  }
}

const validateRefreshToken = (token) => {
  try {
    return jwt.verify(token, jwtConfig.jwtRefreshSecret);
  } catch (error) {
    throw new ApplicationError(500, 'Refresh token is not valid');
  }
}

module.exports = {
  createJWTPayload,
  validateRefreshToken,
}

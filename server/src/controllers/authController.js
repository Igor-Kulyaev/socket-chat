const jwt = require("jsonwebtoken");
const jwtConfig = require("../config/jwtConfig");
const {registerUserService, loginUserService, logoutUserService, refreshTokenService} = require("../services/authService");
const FIFTEEN_MINUTES = 15 * 60 * 1000;

const registerUser = async (req, res, next) => {
  try {
    const {
      refreshToken,
      accessToken,
      payload,
    } = await registerUserService(req.body);

    res.cookie('refreshToken', refreshToken, {maxAge: FIFTEEN_MINUTES, httpOnly: true});
    res.status(201).json({ token: accessToken, user: payload });
  } catch (error) {
    console.error('Error during registration:', error);
    next(error);
  }
}

const loginUser = async (req, res, next) => {
  try {
    const {
      refreshToken,
      accessToken,
      payload,
    } = await loginUserService(req.body);

    res.cookie('refreshToken', refreshToken, {maxAge: FIFTEEN_MINUTES, httpOnly: true});
    res.status(200).json({ token: accessToken, user: payload });
  } catch (error) {
    console.error('Error during login:', error);
    next(error);
  }
}

const refreshToken = async (req, res, next) => {
  try {
    const {refreshToken} = req.cookies;
    const {
      newRefreshToken,
      newAccessToken,
      refreshedPayload
    } = await refreshTokenService(refreshToken);

    res.cookie('refreshToken', newRefreshToken, {maxAge: FIFTEEN_MINUTES, httpOnly: true});
    res.status(200).json({ token: newAccessToken, user: refreshedPayload });
  } catch (error) {
    console.error('Error during refresh:', error);
    next(error);
  }
}

const verifyToken = async (req, res) => {
  const authorizationHeader = req.header('Authorization');
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
}

module.exports = {
  registerUser,
  loginUser,
  refreshToken,
  verifyToken,
}

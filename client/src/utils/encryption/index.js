const CryptoJS = require('crypto-js');

export const USER_IP = {
  IP_ADDRESS: "",
};

export const FAILED_DECRYPTION = 'Failed decryption';

export const encryptToken = (jwtToken, secretKey) => {
  return CryptoJS.AES.encrypt(jwtToken, secretKey).toString();
}

export const decryptToken = (encryptedToken, secretKey) => {
  try {
    const decryptedBytes = CryptoJS.AES.decrypt(encryptedToken, secretKey);
    return decryptedBytes.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    return FAILED_DECRYPTION;
  }
}

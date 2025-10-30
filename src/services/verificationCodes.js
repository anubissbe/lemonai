const { randomInt } = require('crypto');

const CODE_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes

const emailCodes = new Map();
const smsCodes = new Map();

const createEntry = (code) => ({
  code,
  expiresAt: Date.now() + CODE_EXPIRY_MS,
});

const generateCode = () => randomInt(100000, 1000000).toString();

const setCode = (map, key) => {
  const code = generateCode();
  map.set(key, createEntry(code));
  return code;
};

const verifyCode = (map, key, code, { consume } = { consume: false }) => {
  const entry = map.get(key);
  if (!entry) {
    return false;
  }

  if (entry.expiresAt < Date.now()) {
    map.delete(key);
    return false;
  }

  const isValid = entry.code === code;
  if (isValid && consume) {
    map.delete(key);
  }

  return isValid;
};

module.exports = {
  createEmailCode(email) {
    return setCode(emailCodes, email.toLowerCase());
  },
  verifyEmailCode(email, code, options = { consume: false }) {
    return verifyCode(emailCodes, email.toLowerCase(), code, options);
  },
  createSmsCode(phone) {
    return setCode(smsCodes, phone);
  },
  verifySmsCode(phone, code, options = { consume: false }) {
    return verifyCode(smsCodes, phone, code, options);
  },
  CODE_EXPIRY_MS,
};

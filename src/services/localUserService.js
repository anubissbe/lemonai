const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const SysUser = require('@src/models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'lemonai-local-secret';
const TOKEN_EXPIRES_IN = '7d';

const sanitizeUser = (user) => ({
  id: user.id,
  name: user.user_name,
  email: user.user_email,
  phone: user.mobile,
  nickname: user.user_nickname,
});

const findUser = async ({ email, phone }) => {
  if (!email && !phone) {
    return null;
  }

  const where = email
    ? { user_email: email.toLowerCase() }
    : { mobile: phone };

  return SysUser.findOne({ where });
};

const passwordMatches = (user, password) => {
  return user.user_password === password;
};

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: TOKEN_EXPIRES_IN });
};

const ensureEmailAndPhoneUnique = async (email, phone) => {
  if (!email && !phone) {
    throw new Error('Email or phone is required');
  }

  const where = [];
  if (email) {
    where.push({ user_email: email.toLowerCase() });
  }
  if (phone) {
    where.push({ mobile: phone });
  }

  if (where.length === 0) {
    return;
  }

  const existingUser = await SysUser.findOne({
    where: {
      [Op.or]: where,
    },
  });

  if (existingUser) {
    throw new Error('User already exists');
  }
};

const createUser = async ({ name, email, password, phone }) => {
  await ensureEmailAndPhoneUnique(email, phone);

  const now = new Date();
  const user = await SysUser.create({
    user_name: name || email || phone || 'User',
    user_nickname: name || '',
    user_email: email ? email.toLowerCase() : '',
    mobile: phone || '',
    user_password: password,
    user_salt: 'local',
    user_status: 1,
    created_at: now,
    updated_at: now,
  });

  return user;
};

const buildLoginResponse = (user) => {
  const sanitized = sanitizeUser(user);
  const token = generateToken(user.id);

  return {
    access_token: token,
    userInfo: sanitized,
  };
};

const updatePassword = async (user, password) => {
  user.user_password = password;
  user.updated_at = new Date();
  await user.save();
};

module.exports = {
  async registerUser({ name, email, password, phone }) {
    const user = await createUser({ name, email, password, phone });
    return sanitizeUser(user);
  },

  async loginUser({ email, phone, password }) {
    const user = await findUser({ email, phone });
    if (!user) {
      throw new Error('User not found');
    }

    if (!passwordMatches(user, password)) {
      throw new Error('Invalid credentials');
    }

    user.last_login_time = new Date();
    await user.save();

    return buildLoginResponse(user);
  },

  async loginWithSms({ phone }) {
    const user = await findUser({ phone });
    if (!user) {
      throw new Error('User not found');
    }

    user.last_login_time = new Date();
    await user.save();

    return buildLoginResponse(user);
  },

  async resetPassword({ email, phone, password }) {
    const user = await findUser({ email, phone });
    if (!user) {
      throw new Error('User not found');
    }

    await updatePassword(user, password);
    return sanitizeUser(user);
  },

  async getUserById(id) {
    const user = await SysUser.findByPk(id);
    if (!user) {
      throw new Error('User not found');
    }
    return sanitizeUser(user);
  },
};

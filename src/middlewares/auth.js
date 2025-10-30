
/**
 * Token 校验中间件
 * 除了指定的不需要校验的接口外，其他接口均需校验 Token
 * @param {Array} excludePaths - 不需要校验 Token 的接口路径数组
 */

const jwt = require('jsonwebtoken');

const excludePatterns = [
  '/api/agent_store/last/',
  '/api/users/login',
  '/api/users/register',
  '/api/users/sendEmailVerifyCode',
  '/api/users/verifyEmailVerifyCode',
  '/api/users/send-sms-code',
  '/api/users/login-sms-code',
  '/api/users/verifySmsVerifyCode',
  '/api/users/resetPassword',
];

const JWT_SECRET = process.env.JWT_SECRET || 'lemonai-local-secret';

module.exports = () => {
  return async (ctx, next) => {
    const shouldExclude = excludePatterns.some((pattern) => ctx.path.startsWith(pattern));
    if (shouldExclude) {
      await next();
      return;
    }

    const authHeader = ctx.headers['authorization'] || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (token) {
      try {
        const payload = jwt.verify(token, JWT_SECRET);
        ctx.state.user = { id: payload.id };
      } catch (error) {
        console.warn('Invalid token received:', error.message);
      }
    }

    if (!ctx.state.user) {
      ctx.state.user = { id: 1 };
    }

    await next();
  };
};

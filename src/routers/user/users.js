const router = require("koa-router")();

const {
  registerUser,
  loginUser,
  loginWithSms,
  resetPassword,
  getUserById,
} = require('@src/services/localUserService');
const verificationCodes = require('@src/services/verificationCodes');

const buildSuccessResponse = (message, data) => ({
  code: 200,
  message,
  data: data === undefined ? null : data,
});

const buildErrorResponse = (message, status = 400) => ({
  code: status,
  message,
  data: null,
});

router.get("/userinfo", async (ctx) => {
  try {
    const userId = ctx.state.user?.id;
    if (!userId) {
      ctx.body = buildErrorResponse('Unauthorized', 401);
      return;
    }
    const user = await getUserById(userId);
    ctx.body = buildSuccessResponse('User info fetched', { userInfo: user });
  } catch (error) {
    ctx.body = buildErrorResponse(error.message);
  }
});

router.post("/register", async (ctx) => {
  const { fullname, email, password, phone } = ctx.request.body || {};
  try {
    const user = await registerUser({
      name: fullname,
      email,
      password,
      phone,
    });
    ctx.body = buildSuccessResponse('Registration successful', { user });
  } catch (error) {
    ctx.body = buildErrorResponse(error.message);
  }
});

router.post("/login", async (ctx) => {
  const { email, phone, password } = ctx.request.body || {};
  if (!password || (!email && !phone)) {
    ctx.body = buildErrorResponse('Email or phone and password are required');
    return;
  }
  try {
    const data = await loginUser({ email, phone, password });
    ctx.body = buildSuccessResponse('Login successful', data);
  } catch (error) {
    ctx.body = buildErrorResponse(error.message);
  }
});

router.post("/sendEmailVerifyCode", async (ctx) => {
  const { email } = ctx.request.body || {};
  if (!email) {
    ctx.body = buildErrorResponse('Email is required');
    return;
  }

  const code = verificationCodes.createEmailCode(email);
  console.log(`Verification code for ${email}: ${code}`);
  ctx.body = buildSuccessResponse('Verification code sent', {
    expiresIn: verificationCodes.CODE_EXPIRY_MS,
  });
});

router.post("/verifyEmailVerifyCode", async (ctx) => {
  const { email, code } = ctx.request.body || {};
  if (!email || !code) {
    ctx.body = buildErrorResponse('Email and code are required');
    return;
  }

  const valid = verificationCodes.verifyEmailCode(email, code, { consume: false });
  if (!valid) {
    ctx.body = buildErrorResponse('Invalid verification code');
    return;
  }

  ctx.body = buildSuccessResponse('Verification successful');
});

router.post("/send-sms-code", async (ctx) => {
  const { phone } = ctx.request.body || {};
  if (!phone) {
    ctx.body = buildErrorResponse('Phone number is required');
    return;
  }

  const code = verificationCodes.createSmsCode(phone);
  console.log(`SMS code for ${phone}: ${code}`);
  ctx.body = buildSuccessResponse('SMS code sent', {
    expiresIn: verificationCodes.CODE_EXPIRY_MS,
  });
});

router.post("/verifySmsVerifyCode", async (ctx) => {
  const { phone, smsCode } = ctx.request.body || {};
  if (!phone || !smsCode) {
    ctx.body = buildErrorResponse('Phone and code are required');
    return;
  }

  const valid = verificationCodes.verifySmsCode(phone, smsCode, { consume: false });
  if (!valid) {
    ctx.body = buildErrorResponse('Invalid verification code');
    return;
  }

  ctx.body = buildSuccessResponse('Verification successful');
});

router.post("/login-sms-code", async (ctx) => {
  const { phone, smsCode } = ctx.request.body || {};
  if (!phone || !smsCode) {
    ctx.body = buildErrorResponse('Phone and code are required');
    return;
  }

  const valid = verificationCodes.verifySmsCode(phone, smsCode, { consume: true });
  if (!valid) {
    ctx.body = buildErrorResponse('Invalid verification code');
    return;
  }

  try {
    const data = await loginWithSms({ phone });
    ctx.body = buildSuccessResponse('Login successful', data);
  } catch (error) {
    ctx.body = buildErrorResponse(error.message);
  }
});

router.post("/resetPassword", async (ctx) => {
  const { email, phone, password } = ctx.request.body || {};
  if (!password) {
    ctx.body = buildErrorResponse('Password is required');
    return;
  }
  if (!email && !phone) {
    ctx.body = buildErrorResponse('Email or phone is required');
    return;
  }

  try {
    await resetPassword({ email, phone, password });
    ctx.body = buildSuccessResponse('Password reset successful');
  } catch (error) {
    ctx.body = buildErrorResponse(error.message);
  }
});

router.post("/updateUsername", async (ctx) => {
  ctx.body = buildErrorResponse('Not implemented', 501);
});

module.exports = router.routes();

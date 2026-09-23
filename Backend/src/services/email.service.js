import nodemailer from 'nodemailer';

let transporter = null;

/**
 * Initialize or retrieve the nodemailer transporter.
 * Supports explicit SMTP settings, Gmail service, or JSON test fallback.
 */
export const getTransporter = () => {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT, 10) || 587;
  const user = process.env.SMTP_USER || process.env.EMAIL_USER;
  const pass = process.env.SMTP_PASS || process.env.EMAIL_PASS;
  const secure = process.env.SMTP_SECURE === 'true' || port === 465;

  if (user && pass) {
    if (host) {
      transporter = nodemailer.createTransport({
        host,
        port,
        secure,
        auth: { user, pass }
      });
    } else {
      // Default to service-based (e.g. Gmail)
      transporter = nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE || 'gmail',
        auth: { user, pass }
      });
    }
  } else {
    // Development / Test fallback: create transport that logs to console or suppresses
    transporter = nodemailer.createTransport({
      streamTransport: true,
      newline: 'windows',
      buffer: true
    });
  }

  return transporter;
};

/**
 * Send an email notification alerting the user about their login time and details.
 *
 * @param {Object} params
 * @param {Object} params.user - The user object { name, email, role }
 * @param {Date} params.loginTime - The login timestamp
 * @param {string} [params.ipAddress] - IP address of the client
 * @param {string} [params.userAgent] - Browser/Device user-agent string
 */
export const sendLoginAlertEmail = async ({ user, loginTime = new Date(), ipAddress = 'Unknown', userAgent = 'Unknown' }) => {
  try {
    const transport = getTransporter();
    const fromAddress = process.env.EMAIL_FROM || '"GitSphere Security" <no-reply@gitsphere.com>';
    const formattedTimeUTC = loginTime.toUTCString();
    const formattedTimeLocal = loginTime.toLocaleString();

    const subject = '🔐 GitSphere: New Login Detected on Your Account';

    const textContent = `Hello ${user.name},\n\nA new login was detected on your GitSphere account.\n\n` +
      `Login Details:\n` +
      `- Role: ${user.role}\n` +
      `If this was you, no action is needed.\n` +
      `If you did not log in, please reset your password immediately and notify your administrator.\n\n` +
      `Best regards,\nGitSphere Security Team`;

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0f172a; color: #e2e8f0; margin: 0; padding: 24px; }
    .card { max-width: 560px; margin: 0 auto; background: #1e293b; border-radius: 12px; border: 1px solid #334155; padding: 32px; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
    .header { text-align: center; margin-bottom: 24px; }
    .logo { font-size: 24px; font-weight: 700; color: #38bdf8; letter-spacing: -0.5px; }
    .title { font-size: 18px; font-weight: 600; color: #f8fafc; margin-top: 8px; }
    .details { background: #0f172a; border-radius: 8px; border: 1px solid #334155; padding: 16px; margin: 20px 0; }
    .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #1e293b; font-size: 14px; }
    .row:last-child { border-bottom: none; }
    .label { color: #94a3b8; font-weight: 500; }
    .val { color: #f8fafc; font-weight: 600; text-align: right; }
    .time-badge { color: #38bdf8; font-weight: 700; }
    .warning { font-size: 13px; color: #f59e0b; background: rgba(245, 158, 11, 0.1); border-left: 4px solid #f59e0b; padding: 12px; border-radius: 4px; margin-top: 20px; }
    .footer { text-align: center; font-size: 12px; color: #64748b; margin-top: 28px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <div class="logo">⚡ GitSphere</div>
      <div class="title">New Login Notification</div>
    </div>
    <p>Hello <strong>${user.name}</strong>,</p>
    <p>We detected a new successful sign-in to your GitSphere account.</p>
    
    <div class="details">
      <div class="row">
        <span class="label">🛡️ Role:</span>
        <span class="val">${user.role}</span>
      </div>

    </div>

    <div class="warning">
      <strong>Didn't log in?</strong> If this was not you, someone else may have gained access to your account. Please change your password immediately.
    </div>

    <div class="footer">
      This is an automated security notice from GitSphere. Please do not reply directly to this email.
    </div>
  </div>
</body>
</html>
    `;

    const mailOptions = {
      from: fromAddress,
      to: user.email,
      subject,
      text: textContent,
      html: htmlContent
    };

    const info = await transport.sendMail(mailOptions);
    console.log(`[Nodemailer] Login notification email dispatched to ${user.email} (Time: ${formattedTimeLocal})`);
    return info;
  } catch (error) {
    console.error(`[Nodemailer] Error sending login notification email to ${user.email}:`, error.message);
    // Non-blocking: We do not fail the user login if the email transport fails
    return null;
  }
};

/**
 * Send an OTP verification code email to a user.
 */
export const sendOtpEmail = async ({ email, name = 'Developer', otp }) => {
  try {
    const transport = getTransporter();
    const fromAddress = process.env.EMAIL_FROM || '"GitSphere Security" <no-reply@gitsphere.com>';
    const subject = `🔐 Your GitSphere Verification Code: ${otp}`;

    const textContent = `Hello ${name},\n\n` +
      `Your 6-digit GitSphere email verification code is: ${otp}\n\n` +
      `This code is valid for 10 minutes. Please enter it on the verification page to complete your registration.\n\n` +
      `If you did not request this, please disregard this email.\n\n` +
      `Best regards,\nGitSphere Team`;

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #111214; color: #FFFFFF; margin: 0; padding: 24px; }
    .card { max-width: 500px; margin: 0 auto; background: #0B0C0E; border-radius: 16px; border: 1px solid #282A2E; padding: 36px; }
    .logo { font-size: 22px; font-weight: 700; color: #FFFFFF; text-align: center; margin-bottom: 20px; }
    .title { font-size: 20px; font-weight: 600; color: #FFFFFF; text-align: center; margin-bottom: 8px; }
    .subtitle { font-size: 14px; color: #9699A1; text-align: center; margin-bottom: 28px; }
    .code-box { background: #151619; border: 1px solid #303238; border-radius: 12px; padding: 18px; text-align: center; font-family: monospace; font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #FFFFFF; margin: 24px 0; }
    .footer { text-align: center; font-size: 12px; color: #5F626A; margin-top: 28px; line-height: 1.5; }
  </style>
</head>
<body>
  <div class="card">
    <div class="logo">⚡ GitSphere</div>
    <div class="title">Verify your email</div>
    <div class="subtitle">Use the verification code below to complete your registration.</div>
    <div class="code-box">${otp}</div>
    <div class="subtitle" style="font-size: 13px;">This code will expire in <strong>10 minutes</strong>.</div>
    <div class="footer">
      If you did not create a GitSphere account, you can safely ignore this email.<br>
      © GitSphere Collaboration Platform
    </div>
  </div>
</body>
</html>
    `;

    const mailOptions = {
      from: fromAddress,
      to: email,
      subject,
      text: textContent,
      html: htmlContent
    };

    const info = await transport.sendMail(mailOptions);
    console.log(`[Nodemailer] OTP verification code (${otp}) dispatched to ${email}`);
    return info;
  } catch (error) {
    console.error(`[Nodemailer] Error sending OTP verification email to ${email}:`, error.message);
    return null;
  }
};


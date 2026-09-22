import nodemailer from 'nodemailer';

/**
 * Configure Nodemailer Transporter
 */
const createTransporter = () => {
  const user = process.env.SMTP_USER || process.env.EMAIL_USER;
  const pass = process.env.SMTP_PASS || process.env.EMAIL_PASS;

  if (user && pass) {
    if (process.env.SMTP_HOST) {
      return nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT, 10) || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: { user, pass }
      });
    }

    return nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || 'gmail',
      auth: { user, pass }
    });
  }

  // Fallback stream for testing & local development without credentials
  return nodemailer.createTransport({
    streamTransport: true,
    buffer: true
  });
};

const transporter = createTransporter();

/**
 * Send OTP Verification Email
 * @param {string|Object} emailOrOptions - Recipient email address or options object
 * @param {string|number} [otpCode] - The OTP code
 */
export const sendOTP = async (emailOrOptions, otpCode) => {
  try {
    const email = typeof emailOrOptions === 'object' ? emailOrOptions.email : emailOrOptions;
    const otp = typeof emailOrOptions === 'object' ? emailOrOptions.otp : otpCode;

    if (!email || !otp) {
      console.warn('[Email] Recipient email and OTP are required');
      return null;
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.SMTP_USER || '"GitSphere" <no-reply@gitsphere.com>',
      to: email,
      subject: `Your GitSphere OTP: ${otp}`,
      text: `Your GitSphere verification OTP code is: ${otp}. It is valid for 10 minutes.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 8px;">
          <h2 style="color: #2563eb; margin-top: 0;">GitSphere Verification</h2>
          <p style="color: #475569; font-size: 15px;">Your One-Time Password (OTP) is:</p>
          <div style="background: #f1f5f9; padding: 16px; border-radius: 6px; text-align: center; margin: 20px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #1e293b;">${otp}</span>
          </div>
          <p style="color: #64748b; font-size: 13px;">This code is valid for 10 minutes. Please do not share it with anyone.</p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[Email] OTP sent successfully to ${email}`);
    return info;
  } catch (error) {
    console.error('[Email Error] Failed to send OTP:', error.message);
    return null;
  }
};

// Aliases for compatibility
export const sendOTPEmail = sendOTP;
export const sendLoginAlertEmail = async ({ user } = {}) => {
  if (user?.email) {
    return sendOTP(user.email, 'LOGIN');
  }
  return null;
};

export default {
  sendOTP,
  sendOTPEmail,
  sendLoginAlertEmail
};

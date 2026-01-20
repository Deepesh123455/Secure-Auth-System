import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();


const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});


if (process.env.NODE_ENV !== "test") {
  transporter
    .verify()
    .then(() => console.log("✅ Connected to Email Server"))
    .catch((err) => console.log("❌ Email Server Connection Error:", err));
}

/**

 * @param {string} to
 * @param {string} subject
 * @param {string} text
 * @param {string} html (Optional)
 */
const sendEmail = async (to, subject, text, html) => {
  const msg = {
    from: process.env.EMAIL_FROM,
    to,
    subject,
    text, 
    html: html || text, 
  };

  await transporter.sendMail(msg);
};

/**
 
 * @param {string} to - User's email
 * @param {string} token - The verification token
 */
const sendVerificationEmail = async (to, token) => {
  const subject = "Email Verification";

 
  const verificationUrl = `${process.env.CLIENT_URL}/verify-email?token=${token}`;

  const text = `Dear user,
To verify your email, click on this link: ${verificationUrl}
If you did not request this, please ignore this email.`;

  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h2>Verify your email</h2>
      <p>Click the button below to verify your email address.</p>
      <a href="${verificationUrl}" style="background: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Verify Email</a>
      <p>Or copy this link: ${verificationUrl}</p>
    </div>
  `;

  await sendEmail(to, subject, text, html);
};

/**
 
 * @param {string} to
 * @param {string} token
 */
const sendResetPasswordEmail = async (to, token) => {
  const subject = "Reset Password";
  const resetPasswordUrl = `${process.env.CLIENT_URL}/reset-password?token=${token}`;

  const text = `Dear user,
To reset your password, click on this link: ${resetPasswordUrl}
If you did not request any password resets, then ignore this email.`;

  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h2>Reset Password</h2>
      <p>Click the button below to reset your password.</p>
      <a href="${resetPasswordUrl}" style="background: #FF5722; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a>
      <p>Link expires in 10 minutes.</p>
    </div>
  `;

  await sendEmail(to, subject, text, html);
};

export default {
  sendEmail,
  sendVerificationEmail,
  sendResetPasswordEmail,
};

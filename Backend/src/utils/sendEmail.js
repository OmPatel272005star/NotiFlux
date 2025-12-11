import nodemailer from "nodemailer";

/**
 * Send email using Nodemailer
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email address
 * @param {string} options.subject - Email subject
 * @param {string} options.html - HTML content
 * @param {string} options.text - Plain text content (optional)
 * @returns {Promise<Object>} - Result object
 */
export default async function sendEmail({ to, subject, html, text }) {
  console.log(`📧 [Email] Sending to ${to}`);

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  try {
    const result = await transporter.sendMail({
      from: `"${process.env.SMTP_FROM_NAME || 'Notification Service'}" <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`,
      to,
      subject: subject || "Notification",
      text: text || html.replace(/<[^>]*>/g, ''), // Strip HTML for plain text
      html: html
    });

    console.log(`✅ [Email] Sent successfully: ${result.messageId}`);
    return { success: true, messageId: result.messageId };

  } catch (error) {
    console.error(`❌ [Email] Failed to send:`, error.message);
    throw error;
  }
}
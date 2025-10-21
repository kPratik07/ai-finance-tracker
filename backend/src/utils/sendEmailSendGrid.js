import sgMail from "@sendgrid/mail";

const sendEmailSendGrid = async (options) => {
  // Set SendGrid API key
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);

  const msg = {
    to: options.email,
    from: process.env.SENDGRID_FROM_EMAIL || process.env.EMAIL_USER,
    subject: options.subject,
    html: options.html,
  };

  try {
    await sgMail.send(msg);
    console.log("Email sent successfully via SendGrid");
  } catch (error) {
    console.error("SendGrid error:", error);
    throw error;
  }
};

export default sendEmailSendGrid;

import nodemailer from "nodemailer";

const sendEmail = async (options) => {
  try {
    // Validate required environment variables
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      throw new Error("EMAIL_USER and EMAIL_PASS environment variables are required");
    }

    console.log("Attempting to send email via SMTP...");
    console.log("SMTP Host:", process.env.EMAIL_HOST || "smtp.gmail.com");
    console.log("SMTP Port:", process.env.EMAIL_PORT || 587);
    console.log("From Email:", process.env.EMAIL_USER);

    // Create transporter with improved Gmail configuration
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || "smtp.gmail.com",
      port: parseInt(process.env.EMAIL_PORT || "587"),
      secure: process.env.EMAIL_PORT === "465", // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: true, // Enforce certificate validation in production
        minVersion: "TLSv1.2"
      },
      pool: true, // Use connection pooling
      maxConnections: 5,
      maxMessages: 10,
      rateDelta: 1000,
      rateLimit: 5,
      debug: process.env.NODE_ENV === "development", // Enable debug in development
      logger: process.env.NODE_ENV === "development" // Enable logging in development
    });

    // Verify transporter configuration
    await transporter.verify();
    console.log("SMTP connection verified successfully");

    // Email options
    const mailOptions = {
      from: `${process.env.EMAIL_FROM_NAME || "AI Finance Tracker"} <${process.env.EMAIL_USER}>`,
      to: options.email,
      subject: options.subject,
      html: options.html,
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);

    console.log("✅ Email sent successfully");
    console.log("Message ID:", info.messageId);
    console.log("Response:", info.response);
    
    return info;
  } catch (error) {
    console.error("❌ Email sending failed:");
    console.error("Error name:", error.name);
    console.error("Error message:", error.message);
    console.error("Error code:", error.code);
    
    // Provide helpful error messages
    if (error.code === "EAUTH") {
      console.error("Authentication failed. Make sure you're using a Gmail App Password, not your regular password.");
      console.error("Generate an App Password at: https://myaccount.google.com/apppasswords");
    } else if (error.code === "ESOCKET" || error.code === "ETIMEDOUT") {
      console.error("Connection timeout. Check your network/firewall settings.");
    } else if (error.code === "ECONNECTION") {
      console.error("Cannot connect to SMTP server. Verify host and port settings.");
    }
    
    throw error;
  }
};

export default sendEmail;

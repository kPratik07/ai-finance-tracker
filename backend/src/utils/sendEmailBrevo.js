import SibApiV3Sdk from "@sendinblue/client";

const sendEmailBrevo = async (options) => {
  const apiKey = process.env.BREVO_API_KEY;
  
  if (!apiKey) {
    throw new Error("BREVO_API_KEY is not set in environment variables");
  }
  
  console.log("Using Brevo API key:", apiKey.substring(0, 20) + "...");
  
  const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
  
  // Set API key
  apiInstance.setApiKey(
    SibApiV3Sdk.TransactionalEmailsApiApiKeys.apiKey,
    apiKey.trim()
  );

  const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
  
  sendSmtpEmail.sender = {
    name: process.env.EMAIL_FROM_NAME || "AI Finance Tracker",
    email: process.env.BREVO_FROM_EMAIL || "noreply@yourdomain.com"
  };
  
  sendSmtpEmail.to = [{ email: options.email }];
  sendSmtpEmail.subject = options.subject;
  sendSmtpEmail.htmlContent = options.html;

  try {
    const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log("Email sent successfully via Brevo:", data);
    return data;
  } catch (error) {
    console.error("Brevo error:", error);
    throw error;
  }
};

export default sendEmailBrevo;

import { Resend } from "resend";

const sendEmailResend = async (options) => {
  const resend = new Resend(process.env.RESEND_API_KEY);

  try {
    const data = await resend.emails.send({
      from: `${process.env.EMAIL_FROM_NAME || "AI Finance Tracker"} <onboarding@resend.dev>`,
      to: options.email,
      subject: options.subject,
      html: options.html,
    });

    console.log("Email sent successfully via Resend:", data);
    return data;
  } catch (error) {
    console.error("Resend error:", error);
    throw error;
  }
};

export default sendEmailResend;

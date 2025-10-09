import sgMail from "@sendgrid/mail";
import { EmailMessage, EmailResult } from "../types";

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const EMAIL_FROM = process.env.EMAIL_FROM;

if (!SENDGRID_API_KEY) {
  throw new Error("SENDGRID_API_KEY is not set");
}

if (!EMAIL_FROM) {
  throw new Error("EMAIL_FROM is not set");
}

export const initializeEmailService = (): void => {
  sgMail.setApiKey(SENDGRID_API_KEY);
};

export const sendMail = async (message: EmailMessage): Promise<EmailResult> => {
  try {
    console.log("Sending email to:", message.to);

    const result = await sgMail.send({
      to: message.to,
      from: EMAIL_FROM,
      subject: message.subject,
      text: message.text,
      html: message.html,
    });

    console.log("Email sent successfully");

    return {
      success: true,
      messageId: result[0].headers["x-message-id"] || "unknown",
    };
  } catch (error) {
    console.error("Email sending failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

import { Transporter, createTransport } from "nodemailer";
import { EmailMessage, EmailResult } from "../types";

let transporter: Transporter | null = null;

export const initializeEmailService = (): void => {
  transporter = createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    requireTLS: true,
    tls: {
      rejectUnauthorized: false,
      ciphers: "SSLv3",
    },
    auth: {
      user: process.env.EMAIL_USER || "",
      pass: process.env.EMAIL_PASS || "",
    },
  });
};

export const sendMail = async (message: EmailMessage): Promise<EmailResult> => {
  if (!transporter) {
    throw new Error("Email service not initialized");
  }

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: message.to,
      subject: message.subject,
      text: message.text,
      html: message.html,
    });

    return {
      success: true,
      messageId: `msg_${Date.now()}`,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

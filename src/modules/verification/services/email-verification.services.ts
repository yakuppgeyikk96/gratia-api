import { sendMail } from "../../../shared/services";
import { EmailResult } from "../../../shared/types";

export const sendVerificationCodeByEmail = async (
  email: string,
  verificationCode: string,
  expiresAt: Date
): Promise<EmailResult> => {
  try {
    console.log("================================================");
    console.log("Email:", email);
    console.log("Verification code:", verificationCode);
    console.log("Expires at:", expiresAt);
    console.log("================================================");
    const emailResult = await sendMail({
      to: email,
      subject: "Email Verification",
      text: `Your verification code is: ${verificationCode}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Email Verification</h2>
          <p>Your verification code is:</p>
          <div style="background: #f4f4f4; padding: 20px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 2px; color: #007bff;">
            ${verificationCode}
          </div>
          <p>This code will expire in ${expiresAt.getTime() - Date.now()}</p>
          <p>If you didn't request this verification, please ignore this email.</p>
        </div>
      `,
    });

    if (!emailResult.success) {
      return {
        success: false,
        error: emailResult.error || "Failed to send email",
      };
    }

    return {
      success: true,
      messageId: "1234567890",
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

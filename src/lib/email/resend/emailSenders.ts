import { resend } from "./config";
import VerificationEmail from "@/components/email/VerificationEmail";
import { APIResponse } from "@/lib/helpers/responses";

export async function sendVerificationEmail(
  email: string,
  username: string,
  verificationCode: string
): Promise<APIResponse> {
  try {
    await resend.emails.send({
      from: "Acme <onboarding@resend.dev>",
      to: "adithyasridharprasad@gmail.com",
      subject: "Verification Code",
      react: VerificationEmail({
        username,
        verificationCode: verificationCode,
      }),
    });

    return { success: true, message: "Verification email sent successfully." };
  } catch (error) {
    console.error(error);

    return { success: false, message: "Failed to send verification email." };
  }
}

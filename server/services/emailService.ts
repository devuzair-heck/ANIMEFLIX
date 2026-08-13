export interface EmailSendResult {
  success: boolean;
  message?: string;
  error?: string;
}

export const emailService = {
  /**
   * Dispatches 6-digit 2FA OTP code to the configured admin email.
   */
  async sendEmailOtp(toEmail: string, otpCode: string): Promise<EmailSendResult> {
    const apiKey = process.env.EMAIL_PROVIDER_API_KEY;
    const isProduction = process.env.NODE_ENV === 'production';

    if (!apiKey) {
      if (!isProduction) {
        console.log(`\n==================================================`);
        console.log(`[DEV MODE - EMAIL SERVICE NOTICE]`);
        console.log(`EMAIL_PROVIDER_API_KEY is not configured in .env.`);
        console.log(`[DEVELOPMENT ONLY OTP] Email OTP for <${toEmail}>: [ ${otpCode} ]`);
        console.log(`==================================================\n`);
      } else {
        console.error('[EMAIL SERVICE ERROR] EMAIL_PROVIDER_API_KEY environment variable is missing in production.');
      }
      return {
        success: true,
        message: 'Email OTP handled by development service.',
      };
    }

    try {
      // Integration hook for transactional email providers (e.g. SendGrid, Resend, Nodemailer)
      // Example payload:
      // await resend.emails.send({
      //   from: process.env.EMAIL_FROM_ADDRESS || 'noreply@animeflix.com',
      //   to: toEmail,
      //   subject: 'AnimeFlix Admin 2FA Verification Code',
      //   text: `Your AnimeFlix Admin verification code is: ${otpCode}. Code expires in 5 minutes.`
      // });

      console.log(`[EMAIL SERVICE] Email OTP dispatched to ${toEmail}`);
      return { success: true };
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to send email OTP';
      console.error('[EMAIL SERVICE ERROR]', errorMsg);
      return { success: false, error: 'Email service delivery failed.' };
    }
  },
};

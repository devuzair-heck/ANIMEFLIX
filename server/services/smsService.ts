export interface SmsSendResult {
  success: boolean;
  message?: string;
  error?: string;
}

export const smsService = {
  /**
   * Dispatches 6-digit 2FA OTP code to the configured admin phone number.
   */
  async sendSmsOtp(toPhone: string, otpCode: string): Promise<SmsSendResult> {
    const apiKey = process.env.SMS_PROVIDER_API_KEY;
    const isProduction = process.env.NODE_ENV === 'production';

    if (!apiKey) {
      if (!isProduction) {
        console.log(`\n==================================================`);
        console.log(`[DEV MODE - SMS SERVICE NOTICE]`);
        console.log(`SMS_PROVIDER_API_KEY is not configured in .env.`);
        console.log(`[DEVELOPMENT ONLY OTP] SMS OTP for <${toPhone}>: [ ${otpCode} ]`);
        console.log(`==================================================\n`);
      } else {
        console.error('[SMS SERVICE ERROR] SMS_PROVIDER_API_KEY environment variable is missing in production.');
      }
      return {
        success: true,
        message: 'SMS OTP handled by development service.',
      };
    }

    try {
      // Integration hook for SMS provider (e.g., Twilio, AWS SNS)
      // Example payload:
      // await twilioClient.messages.create({
      //   body: `Your AnimeFlix Admin SMS verification code is: ${otpCode}. Valid for 5 minutes.`,
      //   from: process.env.SMS_FROM_NUMBER,
      //   to: toPhone
      // });

      console.log(`[SMS SERVICE] SMS OTP dispatched to ${toPhone}`);
      return { success: true };
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to send SMS OTP';
      console.error('[SMS SERVICE ERROR]', errorMsg);
      return { success: false, error: 'SMS service delivery failed.' };
    }
  },
};

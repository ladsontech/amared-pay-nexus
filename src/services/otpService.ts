import { API_CONFIG } from './api-config';
import { apiClient } from './apiClient';

export interface EmailOtpPayload { email: string }
export interface SmsOtpPayload { phone_number: string }
export interface VerifyEmailPayload { email: string; code: string }
export interface VerifyPhonePayload { phone_number: string; code: string }
export interface ResetPasswordEmailPayload { email: string; code: string; new_password: string }
export interface ResetPasswordSmsPayload { phone_number: string; code: string; new_password: string }

class OTPService {
  // Email
  sendEmailOtp<T = any>(payload: EmailOtpPayload) {
    return apiClient.post<T>(API_CONFIG.endpoints.otp.email.send, payload);
  }
  resendEmailOtp<T = any>(payload: EmailOtpPayload) {
    return apiClient.post<T>(API_CONFIG.endpoints.otp.email.resend, payload);
  }
  verifyEmail<T = any>(payload: VerifyEmailPayload) {
    return apiClient.post<T>(API_CONFIG.endpoints.otp.email.verify, payload);
  }
  resetPasswordWithEmailCode<T = any>(payload: ResetPasswordEmailPayload) {
    return apiClient.post<T>(API_CONFIG.endpoints.otp.email.resetPassword, payload);
  }

  // SMS
  sendSmsOtp<T = any>(payload: SmsOtpPayload) {
    return apiClient.post<T>(API_CONFIG.endpoints.otp.sms.send, payload);
  }
  resendSmsOtp<T = any>(payload: SmsOtpPayload) {
    return apiClient.post<T>(API_CONFIG.endpoints.otp.sms.resend, payload);
  }
  verifyPhone<T = any>(payload: VerifyPhonePayload) {
    return apiClient.post<T>(API_CONFIG.endpoints.otp.sms.verify, payload);
  }
  resetPasswordWithSmsCode<T = any>(payload: ResetPasswordSmsPayload) {
    return apiClient.post<T>(API_CONFIG.endpoints.otp.sms.resetPassword, payload);
  }
}

export const otpService = new OTPService();


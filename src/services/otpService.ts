const API_BASE_URL = "https://bulksrv.almaredagencyuganda.com";

// OTP Types
export interface OTPResponse {
  success: boolean;
  message: string;
  data?: {
    user: any;
    access_token: string;
    refresh_token: string;
  };
}

export interface ForgotPasswordRequest {
  email?: string;
  phone_number?: string;
}

export interface ResetPasswordRequest {
  email_code?: string;
  sms_code?: string;
  new_password: string;
}

export interface VerifyOTPRequest {
  email_code?: string;
  sms_code?: string;
  email?: string;
  phone_number?: string;
}

class OTPService {
  private getAuthHeaders() {
    const accessToken = localStorage.getItem("access_token");
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (accessToken) {
      headers["Authorization"] = `Bearer ${accessToken}`;
    }
    return headers;
  }

  // Forgot Password - Email
  async forgotPasswordEmail(request: { email: string }): Promise<OTPResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/otp/forgot_password/email/`, {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Forgot password email error:", error);
      throw error;
    }
  }

  // Forgot Password - SMS
  async forgotPasswordSMS(request: { phone_number: string }): Promise<OTPResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/otp/forgot_password/sms/`, {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Forgot password SMS error:", error);
      throw error;
    }
  }

  // Resend OTP - Email
  async resendEmailOTP(request: { email: string }): Promise<OTPResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/otp/resend/email/`, {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Resend email OTP error:", error);
      throw error;
    }
  }

  // Resend OTP - SMS
  async resendSMSOTP(request: { phone_number: string }): Promise<OTPResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/otp/resend/sms/`, {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Resend SMS OTP error:", error);
      throw error;
    }
  }

  // Reset Password - Email Code
  async resetPasswordEmailCode(request: { email_code: string; new_password: string }): Promise<OTPResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/otp/reset_password/email_code/`, {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Reset password email code error:", error);
      throw error;
    }
  }

  // Reset Password - SMS Code
  async resetPasswordSMSCode(request: { sms_code: string; new_password: string }): Promise<OTPResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/otp/reset_password/sms_code/`, {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Reset password SMS code error:", error);
      throw error;
    }
  }

  // Verify Email Address
  async verifyEmailAddress(request: { email_code: string; email: string }): Promise<OTPResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/otp/verify/email_address/`, {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Verify email address error:", error);
      throw error;
    }
  }

  // Verify Phone Number
  async verifyPhoneNumber(request: { sms_code: string; phone_number: string }): Promise<OTPResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/otp/verify/phone_number/`, {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Verify phone number error:", error);
      throw error;
    }
  }
}

export const otpService = new OTPService();
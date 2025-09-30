const API_BASE_URL = "https://bulksrv.almaredagencyuganda.com";

// Types based on the API documentation
export interface OtpResponse {
  success: boolean;
  message: string;
  data?: {
    user: any;
    access_token: string;
    refresh_token: string;
  };
}

export interface ForgotPasswordEmailRequest {
  email: string;
}

export interface ForgotPasswordSmsRequest {
  phone_number: string;
}

export interface ResendEmailRequest {
  email: string;
}

export interface ResendSmsRequest {
  phone_number: string;
}

export interface ResetPasswordEmailRequest {
  email_code: string;
  new_password: string;
}

export interface ResetPasswordSmsRequest {
  sms_code: string;
  new_password: string;
}

export interface VerifyEmailRequest {
  email_code: string;
  email: string;
}

export interface VerifyPhoneRequest {
  sms_code: string;
  phone_number: string;
}

class OtpService {
  private getAuthHeaders() {
    const accessToken = localStorage.getItem("access_token");
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (accessToken) {
      headers["Authorization"] = `Bearer ${accessToken}`;
    }
    return headers;
  }

  // Forgot Password - Email
  async forgotPasswordEmail(data: ForgotPasswordEmailRequest): Promise<OtpResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/otp/forgot_password/email/`, {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data),
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
  async forgotPasswordSms(data: ForgotPasswordSmsRequest): Promise<OtpResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/otp/forgot_password/sms/`, {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data),
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

  // Resend Email OTP
  async resendEmailOtp(data: ResendEmailRequest): Promise<OtpResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/otp/resend/email/`, {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data),
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

  // Resend SMS OTP
  async resendSmsOtp(data: ResendSmsRequest): Promise<OtpResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/otp/resend/sms/`, {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data),
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

  // Reset Password with Email Code
  async resetPasswordWithEmailCode(data: ResetPasswordEmailRequest): Promise<OtpResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/otp/reset_password/email_code/`, {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Reset password with email code error:", error);
      throw error;
    }
  }

  // Reset Password with SMS Code
  async resetPasswordWithSmsCode(data: ResetPasswordSmsRequest): Promise<OtpResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/otp/reset_password/sms_code/`, {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Reset password with SMS code error:", error);
      throw error;
    }
  }

  // Verify Email Address
  async verifyEmailAddress(data: VerifyEmailRequest): Promise<OtpResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/otp/verify/email_address/`, {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      // Store tokens if verification is successful
      if (result.success && result.data) {
        if (result.data.access_token) {
          localStorage.setItem("access_token", result.data.access_token);
        }
        if (result.data.refresh_token) {
          localStorage.setItem("refresh_token", result.data.refresh_token);
        }
        if (result.data.user) {
          localStorage.setItem("user", JSON.stringify(result.data.user));
        }
      }

      return result;
    } catch (error) {
      console.error("Verify email address error:", error);
      throw error;
    }
  }

  // Verify Phone Number
  async verifyPhoneNumber(data: VerifyPhoneRequest): Promise<OtpResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/otp/verify/phone_number/`, {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      // Store tokens if verification is successful
      if (result.success && result.data) {
        if (result.data.access_token) {
          localStorage.setItem("access_token", result.data.access_token);
        }
        if (result.data.refresh_token) {
          localStorage.setItem("refresh_token", result.data.refresh_token);
        }
        if (result.data.user) {
          localStorage.setItem("user", JSON.stringify(result.data.user));
        }
      }

      return result;
    } catch (error) {
      console.error("Verify phone number error:", error);
      throw error;
    }
  }
}

export const otpService = new OtpService();

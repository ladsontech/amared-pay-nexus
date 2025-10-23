import { API_BASE_URL } from './api';

export interface OTPResponse {
  success: boolean;
  message: string;
  data?: {
    user: any;
    access_token: string;
    refresh_token: string;
  };
}

export interface VerifyEmailRequest {
  email_code: string;
  email: string;
}

export interface VerifyPhoneRequest {
  sms_code: string;
  phone_number: string;
}

export interface ResendEmailRequest {
  email: string;
}

export interface ResendSMSRequest {
  phone_number: string;
}

export interface ResetPasswordEmailRequest {
  email_code: string;
  new_password: string;
}

export interface ResetPasswordSMSRequest {
  sms_code: string;
  new_password: string;
}

class OTPService {
  private getAuthHeaders() {
    const token = localStorage.getItem("auth_token");
    return {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  }

  // Verify email address with OTP code
  async verifyEmailAddress(data: VerifyEmailRequest): Promise<OTPResponse> {
    try {
      console.log('Verifying email address with OTP:', data.email);
      const response = await fetch(`${API_BASE_URL}/otp/verify/email_address/`, {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Email verification error:', {
          status: response.status,
          statusText: response.statusText,
          errorText: errorText.substring(0, 500)
        });

        let errorMessage = "Email verification failed";
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorData.detail || errorText;
        } catch {
          if (response.status === 400) {
            errorMessage = "Invalid OTP code. Please check your email and try again.";
          } else if (response.status === 401) {
            errorMessage = "Unauthorized. Please try again.";
          } else if (response.status === 404) {
            errorMessage = "Email not found. Please check your email address.";
          } else {
            errorMessage = `Server error (${response.status}): ${errorText.substring(0, 200)}`;
          }
        }

        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log('Email verified successfully:', result);
      return result;
    } catch (error: unknown) {
      console.error("Email verification error:", error);
      throw error;
    }
  }

  // Verify phone number with OTP code
  async verifyPhoneNumber(data: VerifyPhoneRequest): Promise<OTPResponse> {
    try {
      console.log('Verifying phone number with OTP:', data.phone_number);
      const response = await fetch(`${API_BASE_URL}/otp/verify/phone_number/`, {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Phone verification error:', {
          status: response.status,
          statusText: response.statusText,
          errorText: errorText.substring(0, 500)
        });

        let errorMessage = "Phone verification failed";
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorData.detail || errorText;
        } catch {
          if (response.status === 400) {
            errorMessage = "Invalid OTP code. Please check your SMS and try again.";
          } else if (response.status === 401) {
            errorMessage = "Unauthorized. Please try again.";
          } else if (response.status === 404) {
            errorMessage = "Phone number not found. Please check your phone number.";
          } else {
            errorMessage = `Server error (${response.status}): ${errorText.substring(0, 200)}`;
          }
        }

        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log('Phone verified successfully:', result);
      return result;
    } catch (error: unknown) {
      console.error("Phone verification error:", error);
      throw error;
    }
  }

  // Resend email OTP
  async resendEmailOTP(data: ResendEmailRequest): Promise<OTPResponse> {
    try {
      console.log('Resending email OTP to:', data.email);
      const response = await fetch(`${API_BASE_URL}/otp/resend/email/`, {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Resend email OTP error:', {
          status: response.status,
          statusText: response.statusText,
          errorText: errorText.substring(0, 500)
        });

        let errorMessage = "Failed to resend email OTP";
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorData.detail || errorText;
        } catch {
          if (response.status === 400) {
            errorMessage = "Invalid email address. Please check and try again.";
          } else if (response.status === 429) {
            errorMessage = "Too many requests. Please wait before requesting another OTP.";
          } else {
            errorMessage = `Server error (${response.status}): ${errorText.substring(0, 200)}`;
          }
        }

        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log('Email OTP resent successfully:', result);
      return result;
    } catch (error: unknown) {
      console.error("Resend email OTP error:", error);
      throw error;
    }
  }

  // Resend SMS OTP
  async resendSMSOTP(data: ResendSMSRequest): Promise<OTPResponse> {
    try {
      console.log('Resending SMS OTP to:', data.phone_number);
      const response = await fetch(`${API_BASE_URL}/otp/resend/sms/`, {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Resend SMS OTP error:', {
          status: response.status,
          statusText: response.statusText,
          errorText: errorText.substring(0, 500)
        });

        let errorMessage = "Failed to resend SMS OTP";
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorData.detail || errorText;
        } catch {
          if (response.status === 400) {
            errorMessage = "Invalid phone number. Please check and try again.";
          } else if (response.status === 429) {
            errorMessage = "Too many requests. Please wait before requesting another OTP.";
          } else {
            errorMessage = `Server error (${response.status}): ${errorText.substring(0, 200)}`;
          }
        }

        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log('SMS OTP resent successfully:', result);
      return result;
    } catch (error: unknown) {
      console.error("Resend SMS OTP error:", error);
      throw error;
    }
  }

  // Reset password with email OTP
  async resetPasswordWithEmail(data: ResetPasswordEmailRequest): Promise<OTPResponse> {
    try {
      console.log('Resetting password with email OTP');
      const response = await fetch(`${API_BASE_URL}/otp/reset_password/email_code/`, {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Reset password with email error:', {
          status: response.status,
          statusText: response.statusText,
          errorText: errorText.substring(0, 500)
        });

        let errorMessage = "Password reset failed";
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorData.detail || errorText;
        } catch {
          if (response.status === 400) {
            errorMessage = "Invalid OTP code or password. Please check and try again.";
          } else {
            errorMessage = `Server error (${response.status}): ${errorText.substring(0, 200)}`;
          }
        }

        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log('Password reset with email successful:', result);
      return result;
    } catch (error: unknown) {
      console.error("Reset password with email error:", error);
      throw error;
    }
  }

  // Reset password with SMS OTP
  async resetPasswordWithSMS(data: ResetPasswordSMSRequest): Promise<OTPResponse> {
    try {
      console.log('Resetting password with SMS OTP');
      const response = await fetch(`${API_BASE_URL}/otp/reset_password/sms_code/`, {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Reset password with SMS error:', {
          status: response.status,
          statusText: response.statusText,
          errorText: errorText.substring(0, 500)
        });

        let errorMessage = "Password reset failed";
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorData.detail || errorText;
        } catch {
          if (response.status === 400) {
            errorMessage = "Invalid OTP code or password. Please check and try again.";
          } else {
            errorMessage = `Server error (${response.status}): ${errorText.substring(0, 200)}`;
          }
        }

        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log('Password reset with SMS successful:', result);
      return result;
    } catch (error: unknown) {
      console.error("Reset password with SMS error:", error);
      throw error;
    }
  }
}

export const otpService = new OTPService();
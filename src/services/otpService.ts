import { API_CONFIG } from './api-config';

const API_BASE_URL = API_CONFIG.baseURL.replace(/\/$/, '');

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
    // Try legacy endpoint first (/otp/), then modern (/users/otp/)
    try {
      return await this.verifyEmailAddressLegacy(data);
    } catch (legacyError) {
      console.log('Legacy endpoint failed, trying modern endpoint:', legacyError);
      // Try modern endpoint as fallback
      console.log('Verifying email address with OTP (modern endpoint):', data.email);
      const response = await fetch(`${API_BASE_URL}/${API_CONFIG.endpoints.otp.email.verify}`, {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          email_code: data.email_code,
          email: data.email,
        }),
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
      
      // Handle response structure: { success: true, message: "...", data: { user, access_token, refresh_token } }
      if (result.data && result.data.access_token) {
        // Store tokens if provided
        localStorage.setItem("access_token", result.data.access_token);
        localStorage.setItem("auth_token", result.data.access_token);
        if (result.data.refresh_token) {
          localStorage.setItem("refresh_token", result.data.refresh_token);
        }
      }
      
      return result;
    }
  }

  // Verify phone number with OTP code
  async verifyPhoneNumber(data: VerifyPhoneRequest): Promise<OTPResponse> {
    // Try legacy endpoint first (/otp/), then modern (/users/otp/)
    try {
      return await this.verifyPhoneNumberLegacy(data);
    } catch (legacyError) {
      console.log('Legacy endpoint failed, trying modern endpoint:', legacyError);
      // Try modern endpoint as fallback
      console.log('Verifying phone number with OTP (modern endpoint):', data.phone_number);
      const response = await fetch(`${API_BASE_URL}/${API_CONFIG.endpoints.otp.sms.verify}`, {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          sms_code: data.sms_code,
          phone_number: data.phone_number,
        }),
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
      
      // Handle response structure: { success: true, message: "...", data: { user, access_token, refresh_token } }
      if (result.data && result.data.access_token) {
        // Store tokens if provided
        localStorage.setItem("access_token", result.data.access_token);
        localStorage.setItem("auth_token", result.data.access_token);
        if (result.data.refresh_token) {
          localStorage.setItem("refresh_token", result.data.refresh_token);
        }
      }
      
      return result;
    }
  }

  // Resend email OTP
  async resendEmailOTP(data: ResendEmailRequest): Promise<OTPResponse> {
    // Try legacy endpoint first (/otp/), then modern (/users/otp/)
    try {
      return await this.resendEmailOTPLegacy(data);
    } catch (legacyError) {
      console.log('Legacy endpoint failed, trying modern endpoint:', legacyError);
      // Try modern endpoint as fallback
      console.log('Resending email OTP (modern endpoint):', data.email);
      const response = await fetch(`${API_BASE_URL}/${API_CONFIG.endpoints.otp.email.resend}`, {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ email: data.email }),
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
    }
  }

  // Resend SMS OTP
  async resendSMSOTP(data: ResendSMSRequest): Promise<OTPResponse> {
    // Try legacy endpoint first (/otp/), then modern (/users/otp/)
    try {
      return await this.resendSMSOTPLegacy(data);
    } catch (legacyError) {
      console.log('Legacy endpoint failed, trying modern endpoint:', legacyError);
      // Try modern endpoint as fallback
      console.log('Resending SMS OTP (modern endpoint):', data.phone_number);
      const response = await fetch(`${API_BASE_URL}/${API_CONFIG.endpoints.otp.sms.resend}`, {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ phone_number: data.phone_number }),
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
    }
  }

  // Reset password with email OTP
  async resetPasswordWithEmail(data: ResetPasswordEmailRequest): Promise<OTPResponse> {
    // Try legacy endpoint first (/otp/), then modern (/users/otp/)
    try {
      return await this.resetPasswordWithEmailLegacy(data);
    } catch (legacyError) {
      console.log('Legacy endpoint failed, trying modern endpoint:', legacyError);
      // Try modern endpoint as fallback
      console.log('Resetting password with email OTP (modern endpoint)');
      
      // Validate password length per API docs
      if (data.new_password.length < 8 || data.new_password.length > 40) {
        throw new Error("New password must be between 8 and 40 characters");
      }
      
      // Validate email code length (should be 6 characters)
      if (data.email_code.length !== 6) {
        throw new Error("Email code must be 6 characters");
      }
      
      const response = await fetch(`${API_BASE_URL}/${API_CONFIG.endpoints.otp.email.resetPassword}`, {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          email_code: data.email_code,
          new_password: data.new_password,
        }),
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
    }
  }

  // Reset password with SMS OTP
  async resetPasswordWithSMS(data: ResetPasswordSMSRequest): Promise<OTPResponse> {
    // Try legacy endpoint first (/otp/), then modern (/users/otp/)
    try {
      return await this.resetPasswordWithSMSLegacy(data);
    } catch (legacyError) {
      console.log('Legacy endpoint failed, trying modern endpoint:', legacyError);
      // Try modern endpoint as fallback
      console.log('Resetting password with SMS OTP (modern endpoint)');
      
      // Validate password length per API docs
      if (data.new_password.length < 8 || data.new_password.length > 40) {
        throw new Error("New password must be between 8 and 40 characters");
      }
      
      // Validate SMS code length (should be 6 characters)
      if (data.sms_code.length !== 6) {
        throw new Error("SMS code must be 6 characters");
      }
      
      const response = await fetch(`${API_BASE_URL}/${API_CONFIG.endpoints.otp.sms.resetPassword}`, {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          sms_code: data.sms_code,
          new_password: data.new_password,
        }),
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
    }
  }

  // Forgot password - email
  async forgotPasswordEmail(data: { email: string }): Promise<OTPResponse> {
    // Try legacy endpoint first (/otp/), then modern (/users/otp/)
    try {
      return await this.forgotPasswordEmailLegacy(data);
    } catch (legacyError) {
      console.log('Legacy endpoint failed, trying modern endpoint:', legacyError);
      // Try modern endpoint as fallback
      console.log('Sending forgot password email (modern endpoint):', data.email);
      
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email)) {
        throw new Error("Please provide a valid email address");
      }
      
      const response = await fetch(`${API_BASE_URL}/${API_CONFIG.endpoints.otp.email.send}`, {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ email: data.email }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to send password reset email: ${errorText}`);
      }

      return await response.json();
    }
  }

  // Forgot password - SMS
  async forgotPasswordSms(data: { phone_number: string }): Promise<OTPResponse> {
    // Try legacy endpoint first (/otp/), then modern (/users/otp/)
    try {
      return await this.forgotPasswordSmsLegacy(data);
    } catch (legacyError) {
      console.log('Legacy endpoint failed, trying modern endpoint:', legacyError);
      // Try modern endpoint as fallback
      console.log('Sending forgot password SMS (modern endpoint):', data.phone_number);
      
      // Validate phone number is not empty
      if (!data.phone_number || data.phone_number.trim() === '') {
        throw new Error("Phone number is required");
      }
      
      const response = await fetch(`${API_BASE_URL}/${API_CONFIG.endpoints.otp.sms.send}`, {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ phone_number: data.phone_number }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to send password reset SMS: ${errorText}`);
      }

      return await response.json();
    }
  }

  // Alias methods for backward compatibility
  async resendEmailOtp(data: ResendEmailRequest): Promise<OTPResponse> {
    return this.resendEmailOTP(data);
  }

  async resendSmsOtp(data: ResendSMSRequest): Promise<OTPResponse> {
    return this.resendSMSOTP(data);
  }

  async resetPasswordWithEmailCode(data: ResetPasswordEmailRequest): Promise<OTPResponse> {
    return this.resetPasswordWithEmail(data);
  }

  async resetPasswordWithSmsCode(data: ResetPasswordSMSRequest): Promise<OTPResponse> {
    return this.resetPasswordWithSMS(data);
  }

  // Legacy OTP endpoints (without /users/ prefix) - try these if modern endpoints fail
  async forgotPasswordEmailLegacy(data: { email: string }): Promise<OTPResponse> {
    try {
      console.log('Sending forgot password email (legacy endpoint):', data.email);
      
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email)) {
        throw new Error("Please provide a valid email address");
      }
      
      const response = await fetch(`${API_BASE_URL}/${API_CONFIG.endpoints._otp.forgotPasswordEmail}`, {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ email: data.email }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to send password reset email: ${errorText}`);
      }

      return await response.json();
    } catch (error: unknown) {
      console.error("Forgot password email error (legacy):", error);
      throw error;
    }
  }

  async forgotPasswordSmsLegacy(data: { phone_number: string }): Promise<OTPResponse> {
    try {
      console.log('Sending forgot password SMS (legacy endpoint):', data.phone_number);
      
      if (!data.phone_number || data.phone_number.trim() === '') {
        throw new Error("Phone number is required");
      }
      
      const response = await fetch(`${API_BASE_URL}/${API_CONFIG.endpoints._otp.forgotPasswordSMS}`, {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ phone_number: data.phone_number }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to send password reset SMS: ${errorText}`);
      }

      return await response.json();
    } catch (error: unknown) {
      console.error("Forgot password SMS error (legacy):", error);
      throw error;
    }
  }

  async resendEmailOTPLegacy(data: ResendEmailRequest): Promise<OTPResponse> {
    try {
      console.log('Resending email OTP (legacy endpoint):', data.email);
      const response = await fetch(`${API_BASE_URL}/${API_CONFIG.endpoints._otp.resendEmail}`, {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ email: data.email }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Resend email OTP error (legacy):', {
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
      console.log('Email OTP resent successfully (legacy):', result);
      return result;
    } catch (error: unknown) {
      console.error("Resend email OTP error (legacy):", error);
      throw error;
    }
  }

  async resendSMSOTPLegacy(data: ResendSMSRequest): Promise<OTPResponse> {
    try {
      console.log('Resending SMS OTP (legacy endpoint):', data.phone_number);
      const response = await fetch(`${API_BASE_URL}/${API_CONFIG.endpoints._otp.resendSMS}`, {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ phone_number: data.phone_number }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Resend SMS OTP error (legacy):', {
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
      console.log('SMS OTP resent successfully (legacy):', result);
      return result;
    } catch (error: unknown) {
      console.error("Resend SMS OTP error (legacy):", error);
      throw error;
    }
  }

  async resetPasswordWithEmailLegacy(data: ResetPasswordEmailRequest): Promise<OTPResponse> {
    try {
      console.log('Resetting password with email OTP (legacy endpoint)');
      
      if (data.new_password.length < 8 || data.new_password.length > 40) {
        throw new Error("New password must be between 8 and 40 characters");
      }
      
      if (data.email_code.length !== 6) {
        throw new Error("Email code must be 6 characters");
      }
      
      const response = await fetch(`${API_BASE_URL}/${API_CONFIG.endpoints._otp.resetPasswordEmailCode}`, {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          email_code: data.email_code,
          new_password: data.new_password,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Reset password with email error (legacy):', {
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
      console.log('Password reset with email successful (legacy):', result);
      return result;
    } catch (error: unknown) {
      console.error("Reset password with email error (legacy):", error);
      throw error;
    }
  }

  async resetPasswordWithSMSLegacy(data: ResetPasswordSMSRequest): Promise<OTPResponse> {
    try {
      console.log('Resetting password with SMS OTP (legacy endpoint)');
      
      if (data.new_password.length < 8 || data.new_password.length > 40) {
        throw new Error("New password must be between 8 and 40 characters");
      }
      
      if (data.sms_code.length !== 6) {
        throw new Error("SMS code must be 6 characters");
      }
      
      const response = await fetch(`${API_BASE_URL}/${API_CONFIG.endpoints._otp.resetPasswordSMSCode}`, {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          sms_code: data.sms_code,
          new_password: data.new_password,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Reset password with SMS error (legacy):', {
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
      console.log('Password reset with SMS successful (legacy):', result);
      return result;
    } catch (error: unknown) {
      console.error("Reset password with SMS error (legacy):", error);
      throw error;
    }
  }

  async verifyEmailAddressLegacy(data: VerifyEmailRequest): Promise<OTPResponse> {
    try {
      console.log('Verifying email address with OTP (legacy endpoint):', data.email);
      
      if (data.email_code.length !== 6) {
        throw new Error("Email code must be 6 characters");
      }
      
      const response = await fetch(`${API_BASE_URL}/${API_CONFIG.endpoints._otp.verifyEmailAddress}`, {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          email_code: data.email_code,
          email: data.email,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Email verification error (legacy):', {
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
      console.log('Email verified successfully (legacy):', result);
      
      // Handle response structure: { success: true, message: "...", data: { user, access_token, refresh_token } }
      if (result.data && result.data.access_token) {
        localStorage.setItem("access_token", result.data.access_token);
        localStorage.setItem("auth_token", result.data.access_token);
        if (result.data.refresh_token) {
          localStorage.setItem("refresh_token", result.data.refresh_token);
        }
      }
      
      return result;
    } catch (error: unknown) {
      console.error("Email verification error (legacy):", error);
      throw error;
    }
  }

  async verifyPhoneNumberLegacy(data: VerifyPhoneRequest): Promise<OTPResponse> {
    try {
      console.log('Verifying phone number with OTP (legacy endpoint):', data.phone_number);
      
      if (data.sms_code.length !== 6) {
        throw new Error("SMS code must be 6 characters");
      }
      
      const response = await fetch(`${API_BASE_URL}/${API_CONFIG.endpoints._otp.verifyPhoneNumber}`, {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          sms_code: data.sms_code,
          phone_number: data.phone_number,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Phone verification error (legacy):', {
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
      console.log('Phone verified successfully (legacy):', result);
      
      // Handle response structure: { success: true, message: "...", data: { user, access_token, refresh_token } }
      if (result.data && result.data.access_token) {
        localStorage.setItem("access_token", result.data.access_token);
        localStorage.setItem("auth_token", result.data.access_token);
        if (result.data.refresh_token) {
          localStorage.setItem("refresh_token", result.data.refresh_token);
        }
      }
      
      return result;
    } catch (error: unknown) {
      console.error("Phone verification error (legacy):", error);
      throw error;
    }
  }
}

export const otpService = new OTPService();
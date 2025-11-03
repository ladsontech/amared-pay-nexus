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

export interface ForgotPasswordEmailRequest {
  email: string;
}

export interface ForgotPasswordSMSRequest {
  phone_number: string;
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
  /**
   * Get Basic headers (no Bearer token) for OTP endpoints
   * These endpoints use Basic authorization per API spec
   */
  private getBasicHeaders() {
    return {
      "Content-Type": "application/json",
      "Accept": "application/json",
    };
  }

  /**
   * Get Auth headers with Bearer token (for endpoints that require authentication)
   */
  private getAuthHeaders() {
    const token = localStorage.getItem("auth_token") || localStorage.getItem("access_token");
    return {
      "Authorization": token ? `Bearer ${token}` : "",
      "Content-Type": "application/json",
      "Accept": "application/json",
    };
  }

  /**
   * POST /otp/forgot_password/email/
   * Send OTP for forgot password via email
   */
  async forgotPasswordEmail(data: ForgotPasswordEmailRequest): Promise<OTPResponse> {
    console.log('Sending forgot password email OTP:', data.email);
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      throw new Error("Please provide a valid email address");
    }
    
    const response = await fetch(`${API_BASE_URL}${API_CONFIG.endpoints._otp.forgotPasswordEmail}`, {
      method: "POST",
      headers: this.getBasicHeaders(),
      body: JSON.stringify({ email: data.email }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Forgot password email error:', {
        status: response.status,
        statusText: response.statusText,
        errorText: errorText.substring(0, 500)
      });

      let errorMessage = "Failed to send password reset email";
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.message || errorData.detail || errorText;
      } catch {
        if (response.status === 400) {
          errorMessage = "Invalid email address. Please check and try again.";
        } else {
          errorMessage = `Server error (${response.status}): ${errorText.substring(0, 200)}`;
        }
      }

      throw new Error(errorMessage);
    }

    const result = await response.json();
    console.log('Forgot password email sent successfully:', result);
    return result;
  }

  /**
   * POST /otp/forgot_password/sms/
   * Send OTP for forgot password via SMS
   */
  async forgotPasswordSms(data: ForgotPasswordSMSRequest): Promise<OTPResponse> {
    console.log('Sending forgot password SMS OTP:', data.phone_number);
    
    // Validate phone number is not empty
    if (!data.phone_number || data.phone_number.trim() === '') {
      throw new Error("Phone number is required");
    }
    
    const response = await fetch(`${API_BASE_URL}${API_CONFIG.endpoints._otp.forgotPasswordSMS}`, {
      method: "POST",
      headers: this.getBasicHeaders(),
      body: JSON.stringify({ phone_number: data.phone_number }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Forgot password SMS error:', {
        status: response.status,
        statusText: response.statusText,
        errorText: errorText.substring(0, 500)
      });

      let errorMessage = "Failed to send password reset SMS";
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.message || errorData.detail || errorText;
      } catch {
        if (response.status === 400) {
          errorMessage = "Invalid phone number. Please check and try again.";
        } else {
          errorMessage = `Server error (${response.status}): ${errorText.substring(0, 200)}`;
        }
      }

      throw new Error(errorMessage);
    }

    const result = await response.json();
    console.log('Forgot password SMS sent successfully:', result);
    return result;
  }

  /**
   * POST /otp/resend/email/
   * Resend email OTP
   */
  async resendEmailOTP(data: ResendEmailRequest): Promise<OTPResponse> {
    console.log('Resending email OTP:', data.email);
    
    const response = await fetch(`${API_BASE_URL}${API_CONFIG.endpoints._otp.resendEmail}`, {
      method: "POST",
      headers: this.getBasicHeaders(),
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

  /**
   * POST /otp/resend/sms/
   * Resend SMS OTP
   */
  async resendSMSOTP(data: ResendSMSRequest): Promise<OTPResponse> {
    console.log('Resending SMS OTP:', data.phone_number);
    
    const response = await fetch(`${API_BASE_URL}${API_CONFIG.endpoints._otp.resendSMS}`, {
      method: "POST",
      headers: this.getBasicHeaders(),
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

  /**
   * POST /otp/reset_password/email_code/
   * Reset password using email OTP code
   */
  async resetPasswordWithEmail(data: ResetPasswordEmailRequest): Promise<OTPResponse> {
    console.log('Resetting password with email OTP code');
    
    // Validate password length per API docs (8-40 characters)
    if (data.new_password.length < 8 || data.new_password.length > 40) {
      throw new Error("New password must be between 8 and 40 characters");
    }
    
    // Validate email code length (should be 6 characters)
    if (data.email_code.length !== 6) {
      throw new Error("Email code must be 6 characters");
    }
    
    const response = await fetch(`${API_BASE_URL}${API_CONFIG.endpoints._otp.resetPasswordEmailCode}`, {
      method: "POST",
      headers: this.getBasicHeaders(),
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

  /**
   * POST /otp/reset_password/sms_code/
   * Reset password using SMS OTP code
   */
  async resetPasswordWithSMS(data: ResetPasswordSMSRequest): Promise<OTPResponse> {
    console.log('Resetting password with SMS OTP code');
    
    // Validate password length per API docs (8-40 characters)
    if (data.new_password.length < 8 || data.new_password.length > 40) {
      throw new Error("New password must be between 8 and 40 characters");
    }
    
    // Validate SMS code length (should be 6 characters)
    if (data.sms_code.length !== 6) {
      throw new Error("SMS code must be 6 characters");
    }
    
    const response = await fetch(`${API_BASE_URL}${API_CONFIG.endpoints._otp.resetPasswordSMSCode}`, {
      method: "POST",
      headers: this.getBasicHeaders(),
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

  /**
   * POST /otp/verify/email_address/
   * Verify email address using OTP code
   */
  async verifyEmailAddress(data: VerifyEmailRequest): Promise<OTPResponse> {
    console.log('Verifying email address with OTP:', data.email);
    
    // Validate email code length (should be 6 characters)
    if (data.email_code.length !== 6) {
      throw new Error("Email code must be 6 characters");
    }
    
    const response = await fetch(`${API_BASE_URL}${API_CONFIG.endpoints._otp.verifyEmailAddress}`, {
      method: "POST",
      headers: this.getBasicHeaders(),
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

  /**
   * POST /otp/verify/phone_number/
   * Verify phone number using OTP code
   */
  async verifyPhoneNumber(data: VerifyPhoneRequest): Promise<OTPResponse> {
    console.log('Verifying phone number with OTP:', data.phone_number);
    
    // Validate SMS code length (should be 6 characters)
    if (data.sms_code.length !== 6) {
      throw new Error("SMS code must be 6 characters");
    }
    
    const response = await fetch(`${API_BASE_URL}${API_CONFIG.endpoints._otp.verifyPhoneNumber}`, {
      method: "POST",
      headers: this.getBasicHeaders(),
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
}

export const otpService = new OTPService();
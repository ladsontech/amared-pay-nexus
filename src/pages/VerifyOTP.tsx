import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { otpService } from "@/services/otpService";
import { Mail, Shield, ArrowLeft, Loader2 } from "lucide-react";

const VerifyOTP = () => {
  const [otpCode, setOtpCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [email, setEmail] = useState("");
  const [verifyType, setVerifyType] = useState<"organization" | "login">("login");
  const [organizationName, setOrganizationName] = useState("");
  
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  useEffect(() => {
    // Get email and type from URL params or localStorage
    const emailParam = searchParams.get("email");
    const typeParam = searchParams.get("type") as "organization" | "login" | null;
    const orgNameParam = searchParams.get("orgName");
    
    // Also check localStorage for organization creation flow
    const storedOrgData = localStorage.getItem("pendingOrganization");
    
    if (emailParam) {
      setEmail(emailParam);
    } else if (storedOrgData) {
      try {
        const orgData = JSON.parse(storedOrgData);
        setEmail(orgData.email || "");
        setOrganizationName(orgData.org_name || "");
        setVerifyType("organization");
      } catch (e) {
        console.error("Error parsing stored organization data:", e);
      }
    }
    
    if (typeParam) {
      setVerifyType(typeParam);
    }
    
    if (orgNameParam) {
      setOrganizationName(orgNameParam);
    }

    // If no email found, redirect to login
    if (!emailParam && !storedOrgData) {
      toast({
        title: "Missing Information",
        description: "Email not found. Please try again.",
        variant: "destructive",
      });
      navigate("/login");
    }
  }, [searchParams, navigate, toast]);

  const handleVerify = async () => {
    if (!otpCode || otpCode.length !== 6) {
      toast({
        title: "Invalid Code",
        description: "Please enter a 6-digit verification code",
        variant: "destructive",
      });
      return;
    }

    if (!email) {
      toast({
        title: "Missing Email",
        description: "Email address not found. Please try again.",
        variant: "destructive",
      });
      return;
    }

    setIsVerifying(true);

    try {
      const result = await otpService.verifyEmailAddress({
        email_code: otpCode,
        email: email,
      });

      console.log("Email verified successfully:", result);

      // Store tokens if provided
      if (result.data?.access_token) {
        localStorage.setItem("access_token", result.data.access_token);
        if (result.data.refresh_token) {
          localStorage.setItem("refresh_token", result.data.refresh_token);
        }
      }

      // Clear pending organization data if it exists
      localStorage.removeItem("pendingOrganization");

      toast({
        title: "Email Verified Successfully",
        description: verifyType === "organization" 
          ? `Organization "${organizationName}" is now fully set up!`
          : "Your email has been verified. Redirecting...",
        duration: 3000,
      });

      // Redirect based on verification type
      setTimeout(() => {
        if (verifyType === "organization") {
          // Redirect to login or system admin page
          navigate("/login");
        } else {
          // For login verification, redirect to dashboard
          const userStr = localStorage.getItem("user");
          if (userStr) {
            try {
              const user = JSON.parse(userStr);
              if (user.isSuperuser === true || user.role === "admin") {
                navigate("/system/organizations");
              } else {
                navigate("/org/dashboard");
              }
            } catch (e) {
              navigate("/org/dashboard");
            }
          } else {
            navigate("/org/dashboard");
          }
        }
      }, 1500);
    } catch (error: any) {
      console.error("OTP verification error:", error);
      toast({
        title: "Verification Failed",
        description: error.message || "Failed to verify email. Please check the code and try again.",
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      toast({
        title: "Missing Email",
        description: "Email address not found. Please try again.",
        variant: "destructive",
      });
      return;
    }

    setIsResending(true);

    try {
      await otpService.resendEmailOTP({ email });
      toast({
        title: "Code Resent",
        description: `A new verification code has been sent to ${email}`,
        duration: 5000,
      });
      setOtpCode(""); // Clear the input
    } catch (error: any) {
      console.error("Resend OTP error:", error);
      toast({
        title: "Resend Failed",
        description: error.message || "Failed to resend verification code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsResending(false);
    }
  };

  const handleOtpChange = (value: string) => {
    // Only allow digits and limit to 6 characters
    const digitsOnly = value.replace(/\D/g, "").slice(0, 6);
    setOtpCode(digitsOnly);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 via-white to-slate-50">
      <Card className="relative w-full max-w-md shadow-xl border border-gray-200 bg-white">
        <CardHeader className="text-center space-y-4 pb-6">
          <div className="flex items-center justify-center">
            <div className="p-4 rounded-2xl bg-blue-100">
              <Shield className="h-12 w-12 sm:h-16 sm:w-16 text-blue-600" />
            </div>
          </div>
          <div className="space-y-2">
            <CardTitle className="text-2xl sm:text-3xl font-bold text-gray-900">
              Verify Your Email
            </CardTitle>
            <CardDescription className="text-sm sm:text-base text-gray-600">
              {verifyType === "organization" 
                ? `We've sent a verification code to ${email}. Please enter it below to complete your organization setup.`
                : `We've sent a verification code to ${email}. Please enter it below to complete your login.`}
            </CardDescription>
            {organizationName && (
              <div className="pt-2">
                <p className="text-xs sm:text-sm text-blue-600 font-medium">
                  Organization: {organizationName}
                </p>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="otp" className="text-sm font-medium text-gray-900">
              Verification Code
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400 w-5 h-5" />
              <Input
                id="otp"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="Enter 6-digit code"
                value={otpCode}
                onChange={(e) => handleOtpChange(e.target.value)}
                className="pl-10 text-center text-2xl font-bold tracking-widest bg-white border-blue-200 focus:border-blue-400 focus:ring-blue-400 h-14"
                maxLength={6}
                autoFocus
                autoComplete="one-time-code"
              />
            </div>
            <p className="text-xs text-gray-500 text-center">
              Enter the 6-digit code sent to your email
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <Button
              onClick={handleVerify}
              disabled={isVerifying || otpCode.length !== 6}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-6 text-base shadow-lg hover:shadow-xl transition-all duration-200"
            >
              {isVerifying ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying...</span>
                </div>
              ) : (
                "Verify Email"
              )}
            </Button>

            <Button
              variant="outline"
              onClick={handleResend}
              disabled={isResending}
              className="w-full text-sm"
            >
              {isResending ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Sending...</span>
                </div>
              ) : (
                "Resend Code"
              )}
            </Button>

            <Button
              variant="ghost"
              onClick={() => navigate("/login")}
              className="w-full text-sm text-gray-600"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Login
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VerifyOTP;


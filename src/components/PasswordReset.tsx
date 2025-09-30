import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { otpService } from "@/services/otpService";
import { Mail, Phone, Lock, Loader2, ArrowLeft, CheckCircle } from "lucide-react";

interface PasswordResetProps {
  onBack?: () => void;
  onSuccess?: () => void;
}

const PasswordReset = ({ onBack, onSuccess }: PasswordResetProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'request' | 'verify' | 'reset'>('request');
  const [method, setMethod] = useState<'email' | 'sms'>('email');
  const [contactInfo, setContactInfo] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleRequestOtp = async () => {
    if (!contactInfo.trim()) {
      toast({
        title: "Missing Information",
        description: `Please enter your ${method === 'email' ? 'email address' : 'phone number'}`,
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      if (method === 'email') {
        await otpService.forgotPasswordEmail({ email: contactInfo });
      } else {
        await otpService.forgotPasswordSms({ phone_number: contactInfo });
      }
      
      toast({
        title: "OTP Sent",
        description: `A verification code has been sent to your ${method === 'email' ? 'email' : 'phone'}`,
      });
      setStep('verify');
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send OTP",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setLoading(true);
    try {
      if (method === 'email') {
        await otpService.resendEmailOtp({ email: contactInfo });
      } else {
        await otpService.resendSmsOtp({ phone_number: contactInfo });
      }
      
      toast({
        title: "OTP Resent",
        description: "A new verification code has been sent",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to resend OTP",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpCode.trim() || otpCode.length !== 6) {
      toast({
        title: "Invalid Code",
        description: "Please enter a valid 6-digit verification code",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      if (method === 'email') {
        await otpService.verifyEmailAddress({ 
          email_code: otpCode, 
          email: contactInfo 
        });
      } else {
        await otpService.verifyPhoneNumber({ 
          sms_code: otpCode, 
          phone_number: contactInfo 
        });
      }
      
      toast({
        title: "Verification Successful",
        description: "Your account has been verified successfully",
      });
      setStep('reset');
    } catch (error) {
      toast({
        title: "Verification Failed",
        description: error instanceof Error ? error.message : "Invalid verification code",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword.trim() || newPassword.length < 8) {
      toast({
        title: "Invalid Password",
        description: "Password must be at least 8 characters long",
        variant: "destructive"
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      if (method === 'email') {
        await otpService.resetPasswordWithEmailCode({ 
          email_code: otpCode, 
          new_password: newPassword 
        });
      } else {
        await otpService.resetPasswordWithSmsCode({ 
          sms_code: otpCode, 
          new_password: newPassword 
        });
      }
      
      toast({
        title: "Password Reset Successful",
        description: "Your password has been reset successfully. You can now log in with your new password.",
      });
      onSuccess?.();
    } catch (error) {
      toast({
        title: "Reset Failed",
        description: error instanceof Error ? error.message : "Failed to reset password",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (step === 'verify') {
      setStep('request');
      setOtpCode('');
    } else if (step === 'reset') {
      setStep('verify');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      onBack?.();
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <Card>
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 rounded-full bg-blue-100">
              <Lock className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <CardTitle className="text-xl">Reset Password</CardTitle>
          <p className="text-sm text-slate-600">
            {step === 'request' && 'Choose how you\'d like to reset your password'}
            {step === 'verify' && 'Enter the verification code sent to you'}
            {step === 'reset' && 'Create your new password'}
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Step 1: Request OTP */}
          {step === 'request' && (
            <>
              <Tabs value={method} onValueChange={(value: 'email' | 'sms') => setMethod(value)}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="email" className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email
                  </TabsTrigger>
                  <TabsTrigger value="sms" className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    SMS
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="email" className="space-y-4 mt-6">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={contactInfo}
                      onChange={(e) => setContactInfo(e.target.value)}
                      placeholder="Enter your email address"
                    />
                  </div>
                </TabsContent>
                
                <TabsContent value="sms" className="space-y-4 mt-6">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={contactInfo}
                      onChange={(e) => setContactInfo(e.target.value)}
                      placeholder="Enter your phone number"
                    />
                  </div>
                </TabsContent>
              </Tabs>
              
              <Button onClick={handleRequestOtp} className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sending OTP...
                  </>
                ) : (
                  "Send Verification Code"
                )}
              </Button>
            </>
          )}

          {/* Step 2: Verify OTP */}
          {step === 'verify' && (
            <>
              <div className="text-center space-y-2">
                <div className="flex items-center justify-center">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <p className="text-sm text-slate-600">
                  We've sent a 6-digit code to your {method === 'email' ? 'email' : 'phone'}
                </p>
                <p className="text-sm font-medium text-slate-900">{contactInfo}</p>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="otp">Verification Code</Label>
                  <Input
                    id="otp"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="Enter 6-digit code"
                    className="text-center text-lg tracking-widest"
                    maxLength={6}
                  />
                </div>
                
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleResendOtp} disabled={loading} className="flex-1">
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Resend Code"
                    )}
                  </Button>
                  <Button onClick={handleVerifyOtp} disabled={loading || otpCode.length !== 6} className="flex-1">
                    {loading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      "Verify"
                    )}
                  </Button>
                </div>
              </div>
            </>
          )}

          {/* Step 3: Reset Password */}
          {step === 'reset' && (
            <>
              <div className="text-center space-y-2">
                <div className="flex items-center justify-center">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <p className="text-sm text-slate-600">
                  Verification successful! Now create your new password
                </p>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password (min 8 characters)"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                  />
                </div>
                
                <Button onClick={handleResetPassword} className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Resetting Password...
                    </>
                  ) : (
                    "Reset Password"
                  )}
                </Button>
              </div>
            </>
          )}

          {/* Back Button */}
          <div className="flex justify-center">
            <Button variant="ghost" onClick={handleBack} className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PasswordReset;

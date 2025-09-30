import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { otpService } from "@/services/otpService";
import { Mail, Phone, CheckCircle, Loader2, ArrowLeft, RefreshCw } from "lucide-react";

interface EmailPhoneVerificationProps {
  onBack?: () => void;
  onSuccess?: () => void;
  initialMethod?: 'email' | 'phone';
  initialContact?: string;
}

const EmailPhoneVerification = ({ 
  onBack, 
  onSuccess, 
  initialMethod = 'email',
  initialContact = ''
}: EmailPhoneVerificationProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'request' | 'verify'>('request');
  const [method, setMethod] = useState<'email' | 'phone'>(initialMethod);
  const [contactInfo, setContactInfo] = useState(initialContact);
  const [otpCode, setOtpCode] = useState('');
  const [countdown, setCountdown] = useState(0);

  // Countdown timer for resend button
  const startCountdown = () => {
    setCountdown(60);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

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
        await otpService.resendEmailOtp({ email: contactInfo });
      } else {
        await otpService.resendSmsOtp({ phone_number: contactInfo });
      }
      
      toast({
        title: "Verification Code Sent",
        description: `A verification code has been sent to your ${method === 'email' ? 'email' : 'phone'}`,
      });
      setStep('verify');
      startCountdown();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send verification code",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (countdown > 0) return;
    
    setLoading(true);
    try {
      if (method === 'email') {
        await otpService.resendEmailOtp({ email: contactInfo });
      } else {
        await otpService.resendSmsOtp({ phone_number: contactInfo });
      }
      
      toast({
        title: "Code Resent",
        description: "A new verification code has been sent",
      });
      startCountdown();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to resend verification code",
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
      let result;
      if (method === 'email') {
        result = await otpService.verifyEmailAddress({ 
          email_code: otpCode, 
          email: contactInfo 
        });
      } else {
        result = await otpService.verifyPhoneNumber({ 
          sms_code: otpCode, 
          phone_number: contactInfo 
        });
      }
      
      toast({
        title: "Verification Successful",
        description: `Your ${method === 'email' ? 'email address' : 'phone number'} has been verified successfully`,
      });
      
      // If tokens are returned, the user is now logged in
      if (result.data?.access_token) {
        toast({
          title: "Welcome Back!",
          description: "You have been logged in successfully",
        });
      }
      
      onSuccess?.();
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

  const handleBack = () => {
    if (step === 'verify') {
      setStep('request');
      setOtpCode('');
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
              {method === 'email' ? (
                <Mail className="h-6 w-6 text-blue-600" />
              ) : (
                <Phone className="h-6 w-6 text-blue-600" />
              )}
            </div>
          </div>
          <CardTitle className="text-xl">
            Verify {method === 'email' ? 'Email Address' : 'Phone Number'}
          </CardTitle>
          <p className="text-sm text-slate-600">
            {step === 'request' && `Enter your ${method === 'email' ? 'email address' : 'phone number'} to receive a verification code`}
            {step === 'verify' && 'Enter the verification code sent to you'}
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Step 1: Request OTP */}
          {step === 'request' && (
            <>
              <Tabs value={method} onValueChange={(value: 'email' | 'phone') => setMethod(value)}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="email" className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email
                  </TabsTrigger>
                  <TabsTrigger value="phone" className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Phone
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
                
                <TabsContent value="phone" className="space-y-4 mt-6">
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
                    Sending Code...
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
                  <Button 
                    variant="outline" 
                    onClick={handleResendOtp} 
                    disabled={loading || countdown > 0} 
                    className="flex-1"
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : countdown > 0 ? (
                      `Resend in ${countdown}s`
                    ) : (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Resend Code
                      </>
                    )}
                  </Button>
                  <Button 
                    onClick={handleVerifyOtp} 
                    disabled={loading || otpCode.length !== 6} 
                    className="flex-1"
                  >
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

export default EmailPhoneVerification;

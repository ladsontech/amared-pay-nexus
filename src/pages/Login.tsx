import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, EyeOff, Mail, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

const Login = () => {
  const [identity, setIdentity] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setAttemptCount(prev => prev + 1);

    try {
      // Get email from identity (could be email or username)
      const isEmail = identity.includes('@');
      const email = isEmail ? identity : '';
      
      // If identity is username, we'll need to get email from login response
      await login(identity, password);
      
      // Get user email from stored user data
      const userStr = localStorage.getItem('user');
      let userEmail = email;
      
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          userEmail = user.email || email;
        } catch (e) {
          console.error('Error parsing user data:', e);
        }
      }

      // If we don't have email yet, try to get it from identity or show error
      if (!userEmail) {
        toast({
          title: "Email Required",
          description: "Email address is required for verification. Please use your email to login.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Send OTP email for verification (using resend email OTP which is appropriate for verification)
      const { otpService } = await import('@/services/otpService');
      try {
        // First try to send verification OTP via resend email OTP
        // This endpoint is typically used for email verification scenarios
        await otpService.resendEmailOTP({ email: userEmail });
        toast({
          title: "Verification Code Sent",
          description: `Please check your email (${userEmail}) for the verification code to complete your login.`,
          duration: 8000,
        });
        
        // Redirect to OTP verification page
        navigate(`/verify-otp?email=${encodeURIComponent(userEmail)}&type=login`);
      } catch (otpError: any) {
        console.error("Error sending OTP:", otpError);
        // If OTP sending fails, still allow login but warn user
        toast({
          title: "Verification Code Not Sent",
          description: otpError.message || "Could not send verification code. You may proceed but email verification is recommended.",
          variant: "destructive",
          duration: 5000,
        });
        
        // Still redirect to dashboard but note that verification wasn't completed
        setTimeout(() => {
          const userStr = localStorage.getItem('user');
          if (userStr) {
            const user = JSON.parse(userStr);
            if (user.isSuperuser === true || user.role === 'admin') {
              navigate('/system/organizations');
            } else {
              navigate('/org/dashboard');
            }
          } else {
            navigate('/org/dashboard');
          }
        }, 1000);
      }
    } catch (error) {
      console.error("Login error:", error);
      const errorMsg = error instanceof Error ? error.message : "Authentication failed. Please check your credentials.";
      
      toast({
        title: "Login Failed",
        description: `${errorMsg} ${attemptCount >= 3 ? "(Consider checking your connection)" : ""}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Single login flow only; test/dummy buttons removed

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-white">
      <Card className="relative w-full max-w-md shadow-xl border border-gray-200 bg-white">
        <CardHeader className="text-center space-y-6 pb-6">
          <div className="flex items-center justify-center">
            <div className="p-4 rounded-2xl bg-white">
              <img 
                src="/Almapay_appbar_logo.png" 
                alt="Alma Pay Logo" 
                className="w-48 h-24 sm:w-64 sm:h-32 md:w-80 md:h-40 object-contain"
              />
            </div>
          </div>
          <div className="space-y-2">
            <CardTitle className="text-2xl sm:text-3xl font-bold text-gray-900">
              Welcome Back
            </CardTitle>
            <CardDescription className="text-sm sm:text-base text-gray-600">
              Sign in to access your Alma Pay account
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="identity" className="text-sm font-medium text-blue-900">Email or Username</Label>
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400 w-4 h-4 transition-colors group-focus-within:text-blue-600" />
                <Input
                  id="identity"
                  type="text"
                  placeholder="Enter your email or username"
                  value={identity}
                  onChange={(e) => setIdentity(e.target.value)}
                  className="pl-10 bg-white border-blue-200 focus:border-blue-400 focus:ring-blue-400 transition-all duration-200"
                  autoComplete="username"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-blue-900">Password</Label>
              <div className="relative group">
                <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400 w-4 h-4 transition-colors group-focus-within:text-blue-600" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 bg-white border-blue-200 focus:border-blue-400 focus:ring-blue-400 transition-all duration-200"
                  autoComplete="current-password"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-blue-400 hover:text-blue-600 transition-colors" />
                  ) : (
                    <Eye className="h-4 w-4 text-blue-400 hover:text-blue-600 transition-colors" />
                  )}
                </Button>
              </div>
            </div>
            <Button 
              type="submit" 
              className="w-full bg-[#0000FF] hover:bg-[#0000CC] text-white font-medium py-6 text-base shadow-lg hover:shadow-xl transition-all duration-200" 
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Signing in...</span>
                </div>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
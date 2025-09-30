import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { authService } from "@/services/authService";
import { Mail, Lock, Loader2, ArrowLeft, RefreshCw } from "lucide-react";
import PasswordReset from "@/components/PasswordReset";
import EmailPhoneVerification from "@/components/EmailPhoneVerification";

const LoginWithReset = () => {
  const { login } = useAuth();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'login' | 'reset' | 'verify'>('login');
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      await login(formData.email, formData.password);
      toast({
        title: "Login Successful",
        description: "Welcome back!",
      });
    } catch (error) {
      toast({
        title: "Login Failed",
        description: error instanceof Error ? error.message : "Invalid credentials",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    setMode('login');
    setFormData({ email: "", password: "" });
  };

  const handlePasswordResetSuccess = () => {
    toast({
      title: "Password Reset Complete",
      description: "You can now log in with your new password",
    });
    setMode('login');
  };

  const handleVerificationSuccess = () => {
    toast({
      title: "Verification Complete",
      description: "Your account has been verified successfully",
    });
    setMode('login');
  };

  if (mode === 'reset') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100/50 flex items-center justify-center p-4">
        <PasswordReset onBack={handleBackToLogin} onSuccess={handlePasswordResetSuccess} />
      </div>
    );
  }

  if (mode === 'verify') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100/50 flex items-center justify-center p-4">
        <EmailPhoneVerification onBack={handleBackToLogin} onSuccess={handleVerificationSuccess} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100/50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 rounded-full bg-blue-100">
                <Lock className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <CardTitle className="text-2xl">Welcome Back</CardTitle>
            <p className="text-sm text-slate-600">Sign in to your account to continue</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Enter your email"
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Enter your password"
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Signing In...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>
            
            <div className="mt-6 space-y-3">
              <div className="text-center">
                <Button
                  variant="link"
                  onClick={() => setMode('reset')}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Forgot your password?
                </Button>
              </div>
              
              <div className="text-center">
                <Button
                  variant="link"
                  onClick={() => setMode('verify')}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Verify email or phone number
                </Button>
              </div>
            </div>
            
            <div className="mt-6 pt-6 border-t border-slate-200">
              <div className="text-center text-sm text-slate-600">
                <p>Don't have an account?</p>
                <Button variant="link" className="text-sm text-blue-600 hover:text-blue-700 p-0 h-auto">
                  Contact your administrator
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoginWithReset;

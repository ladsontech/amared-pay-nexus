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
      await login(identity, password);
      toast({
        title: "Welcome Back! 🎉",
        description: "Login successful. Redirecting to your dashboard...",
        className: "border-green-200 bg-green-50 text-green-800",
      });
      
      // Smooth transition to dashboard - check user role
      setTimeout(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const user = JSON.parse(userStr);
          // Super admin (is_superuser = true) goes to system dashboard
          if (user.isSuperuser === true || user.role === 'admin') {
            console.log('Redirecting superuser to system dashboard');
            navigate('/system/organizations');
          } else {
            // Regular organization users go to organization dashboard
            console.log('Redirecting regular user to org dashboard');
            navigate('/org/dashboard');
          }
        } else {
          navigate('/org/dashboard');
        }
      }, 1000);
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
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 via-blue-100/30 to-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-blue-100/20 via-transparent to-transparent"></div>
      <Card className="relative w-full max-w-md shadow-xl border border-blue-100/50 bg-white/95 backdrop-blur-sm">
        <CardHeader className="text-center space-y-6 pb-6">
          <div className="flex items-center justify-center">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-500/10 to-blue-400/5">
              <img 
                src="/images/Almaredpay_logo.png" 
                alt="Alma Pay Logo" 
                className="w-24 h-12 sm:w-32 sm:h-16 object-contain"
              />
            </div>
          </div>
          <div className="space-y-2">
            <CardTitle className="text-2xl sm:text-3xl font-bold text-blue-900">
              Welcome Back
            </CardTitle>
            <CardDescription className="text-sm sm:text-base text-blue-600/70">
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
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-6 text-base shadow-lg hover:shadow-xl transition-all duration-200" 
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
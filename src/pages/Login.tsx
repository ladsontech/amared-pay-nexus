import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
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
          // Super admin / system admin goes to admin dashboard
          if (user.role === 'admin' || user.permissions?.includes('system_admin')) {
            navigate('/system/organizations');
          } else {
            // Regular users go to organization dashboard
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
    <div className="min-h-screen trust-gradient flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5"></div>
      <Card className="relative w-full max-w-sm sm:max-w-md shadow-2xl border-0 glass-gradient backdrop-blur-sm">
        <div className="absolute inset-0 bg-gradient-to-br from-white/80 to-white/60 rounded-lg"></div>
        <CardHeader className="relative text-center space-y-6">
          <div className="flex items-center justify-center">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 backdrop-blur-sm">
              <img 
                src="/images/Almaredpay_logo.png" 
                alt="Alma Pay Logo" 
                className="w-20 h-10 sm:w-28 sm:h-14 object-contain"
              />
            </div>
          </div>
          <div className="space-y-2">
            <CardTitle className="text-xl sm:text-2xl bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent font-bold">
              Welcome Back
            </CardTitle>
            <CardDescription className="text-sm sm:text-base text-muted-foreground">
              Sign in to access your Alma Pay account
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="relative space-y-6">
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-3">
              <Label htmlFor="identity" className="text-sm font-medium">Email or Username</Label>
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4 transition-colors group-focus-within:text-primary" />
                <Input
                  id="identity"
                  type="text"
                  placeholder="Enter your email or username"
                  value={identity}
                  onChange={(e) => setIdentity(e.target.value)}
                  className="pl-10 bg-white/50 border-border/50 focus:bg-white/80 transition-all duration-200"
                  required
                />
              </div>
            </div>
            <div className="space-y-3">
              <Label htmlFor="password" className="text-sm font-medium">Password</Label>
              <div className="relative group">
                <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4 transition-colors group-focus-within:text-primary" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 bg-white/50 border-border/50 focus:bg-white/80 transition-all duration-200"
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
                    <EyeOff className="h-4 w-4 text-muted-foreground hover:text-primary transition-colors" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground hover:text-primary transition-colors" />
                  )}
                </Button>
              </div>
            </div>
            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white font-medium py-3 transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-xl" 
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Signing in...</span>
                </div>
              ) : (
                "Sign In to Dashboard"
              )}
            </Button>
          </form>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent"></div>
              <span className="text-xs text-muted-foreground">or</span>
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent"></div>
            </div>
            <div className="flex flex-col gap-2 text-center text-sm">
              <Link 
                to="/" 
                className="text-primary hover:text-primary/80 underline-offset-4 hover:underline transition-colors"
              >
                Explore the demo
              </Link>
              <Link 
                to="/auth-test" 
                className="text-muted-foreground hover:text-primary underline-offset-4 hover:underline transition-colors"
              >
                API Testing Interface
              </Link>
              <p className="text-gray-600 mt-2">
                Want to see the demo?{' '}
                <Link to="/demo" className="text-blue-600 hover:text-blue-500 font-medium">
                  View Demo Organizations
                </Link>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
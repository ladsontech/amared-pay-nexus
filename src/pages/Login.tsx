
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, EyeOff, Mail, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { authService } from "@/services/authService";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(email, password);
      const currentUser = authService.getCurrentUser();
      const role = currentUser?.role;
      const redirectPath = role === 'admin' ? '/admin/dashboard' : role === 'manager' ? '/manager/dashboard' : '/staff/dashboard';
      toast({
        title: "Login Successful",
        description: "Welcome to Amared Pay!",
      });
      navigate(redirectPath);
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Login Failed",
        description: error instanceof Error ? error.message : "Invalid credentials. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Single login flow only; test/dummy buttons removed

  return (
    <div className="min-h-screen trust-gradient flex items-center justify-center p-4">
      <Card className="w-full max-w-sm sm:max-w-md shadow-xl">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-6">
            <img 
              src="/images/Almaredpay_logo.png" 
              alt="Amared Pay Logo" 
              className="w-24 h-12 sm:w-32 sm:h-16 md:w-40 md:h-20 object-contain"
            />
          </div>
          <CardTitle className="text-xl sm:text-2xl text-primary">Welcome Back</CardTitle>
          <CardDescription className="text-sm sm:text-base">
            Sign in to your account to access the bulk payment system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10"
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
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <Link
                to="/forgot-password"
                className="text-sm text-primary hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
          
          {/* Single login only - role-based redirect after login */}

          <div className="mt-6 text-center space-y-3">
            <Button 
              onClick={() => navigate('/')} 
              variant="secondary" 
              className="w-full"
            >
              Try Demo Organizations
            </Button>
            <p className="text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link to="/register" className="text-primary hover:underline">
                Contact admin to create account
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;

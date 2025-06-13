
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "@/services/authService";
import SplashScreen from "../components/SplashScreen";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const isAuthenticated = authService.isAuthenticated();
      
      if (isAuthenticated) {
        // Verify token is still valid
        const token = localStorage.getItem("auth_token") || localStorage.getItem("access_token");
        if (token) {
          const isValid = await authService.verifyToken(token);
          if (isValid) {
            navigate("/dashboard");
            return;
          }
        }
      }
      
      navigate("/login");
    };

    const timer = setTimeout(checkAuth, 3000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return <SplashScreen />;
};

export default Index;

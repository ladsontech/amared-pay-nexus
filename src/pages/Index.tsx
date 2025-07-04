
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SplashScreen from "../components/SplashScreen";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Skip authentication and go directly to dashboard for demo purposes
    const timer = setTimeout(() => {
      navigate("/dashboard");
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [navigate]);

  return <SplashScreen />;
};

export default Index;


import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SplashScreen from "../components/SplashScreen";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      const token = localStorage.getItem("auth_token");
      if (token) {
        navigate("/dashboard");
      } else {
        navigate("/login");
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return <SplashScreen />;
};

export default Index;


import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to role testing page for demo purposes
    navigate("/role-testing");
  }, [navigate]);

  return null;
};

export default Index;

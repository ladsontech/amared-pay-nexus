
import { Link, useLocation } from "react-router-dom";
import { Home, CreditCard, Coins, Users, Settings } from "lucide-react";

const MobileBottomNav = () => {
  const location = useLocation();

  const navItems = [
    { icon: Home, label: "Home", path: "/dashboard" },
    { icon: CreditCard, label: "Payments", path: "/bulk-payments" },
    { icon: Coins, label: "Collections", path: "/collections" },
    { icon: Users, label: "Orgs", path: "/organizations" },
    { icon: Settings, label: "Settings", path: "/settings" },
  ];

  return (
    <nav className="mobile-nav">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`mobile-nav-item ${
              location.pathname === item.path ? "active" : ""
            }`}
          >
            <item.icon className="h-5 w-5 mb-1" />
            <span>{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default MobileBottomNav;

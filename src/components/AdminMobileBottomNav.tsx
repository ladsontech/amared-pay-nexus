import { Building2, Users, Crown, Settings } from "lucide-react";
import MobileBottomNav from "./MobileBottomNav";
import { useNavigate } from "react-router-dom";
import { authService } from "@/services/authService";

const AdminMobileBottomNav = () => {
  const navigate = useNavigate();

  return (
    <MobileBottomNav
      items={[
        { path: "/system/organizations", icon: Building2, label: "Orgs" },
        { path: "/system/users", icon: Users, label: "Users" },
        { path: "/system/sub-admins", icon: Crown, label: "Admins" },
      ]}
      onLogout={async () => {
        await authService.logout();
      }}
      extraActions={
        <div className="grid grid-cols-2 gap-3">
          <button 
            className="bg-red-50 border border-red-100 rounded-xl p-4 text-left"
            onClick={(e) => {
              const drawer = e.currentTarget.closest('.drawer-content')?.parentElement;
              navigate("/system/users");
            }}
          >
            <Users className="h-5 w-5 text-red-600 mb-2" />
            <p className="text-sm font-medium text-black">Manage Users</p>
            <p className="text-xs text-gray-500">Create, edit, disable</p>
          </button>
          <button 
            className="bg-red-50 border border-red-100 rounded-xl p-4 text-left"
            onClick={(e) => {
              navigate("/system/settings");
            }}
          >
            <Settings className="h-5 w-5 text-red-600 mb-2" />
            <p className="text-sm font-medium text-black">System Settings</p>
            <p className="text-xs text-gray-500">Branding, security</p>
          </button>
        </div>
      }
    />
  );
};

export default AdminMobileBottomNav;



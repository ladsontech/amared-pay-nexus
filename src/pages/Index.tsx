
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";
import { Shield, Building, User, Crown, Users, Settings, BarChart3 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { demoOrganizations, demoUsers } from "@/data/demoData";
import { DemoUser, Permission } from "@/types/auth";

const Index = () => {
  const navigate = useNavigate();
  const { loginAsUser } = useAuth();

  const handleUserLogin = (user: DemoUser) => {
    loginAsUser(user.id);
    navigate('/org/dashboard');
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'manager':
        return <Crown className="h-4 w-4" />;
      case 'staff':
        return <User className="h-4 w-4" />;
      default:
        return <Shield className="h-4 w-4" />;
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'manager':
        return 'default';
      case 'staff':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <div className="min-h-screen bg-background p-2 sm:p-4">
      <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8">
        <div className="text-center space-y-4 px-2">
          <div className="flex items-center justify-center mb-6">
            <img src="/images/Almaredpay_logo.png" alt="Almared Pay Logo" className="h-16 w-auto object-contain" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
            Almared Pay Nexus
          </h1>
          <p className="text-muted-foreground text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed">
            Advanced Bulk Payment System Demo - Experience role-based access and comprehensive financial management
          </p>
        </div>

        {/* Admin Access */}
        <Card className="bg-gradient-to-br from-red-50 via-red-50/80 to-red-100/60 border-red-200/60 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-3 rounded-xl bg-gradient-to-br from-red-100 to-red-200 shadow-md">
                  <Shield className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold text-red-800">System Administrator</CardTitle>
                  <CardDescription className="text-red-700 font-medium">
                    Complete platform control and oversight
                  </CardDescription>
                </div>
              </div>
              <Badge className="bg-red-100 text-red-800 border-red-300 px-3 py-1 text-sm font-semibold">
                ADMIN ACCESS
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-red-700 leading-relaxed">
                Access comprehensive platform management, real-time analytics, organization oversight, and system administration tools.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="flex items-center gap-2 p-2 rounded-lg bg-red-100/50">
                  <BarChart3 className="h-4 w-4 text-red-600" />
                  <span className="text-xs font-medium text-red-700">Analytics</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-lg bg-red-100/50">
                  <Building className="h-4 w-4 text-red-600" />
                  <span className="text-xs font-medium text-red-700">Organizations</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-lg bg-red-100/50">
                  <Users className="h-4 w-4 text-red-600" />
                  <span className="text-xs font-medium text-red-700">Users</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-lg bg-red-100/50">
                  <Settings className="h-4 w-4 text-red-600" />
                  <span className="text-xs font-medium text-red-700">Settings</span>
                </div>
              </div>
              <Button 
                onClick={() => {
                  // Create a demo admin user for testing
                  const demoAdmin = {
                    id: 'demo-admin',
                    name: 'Demo Admin',
                    email: 'admin@demo.com',
                    role: 'admin' as const,
                    organizationId: 'system',
                    organization: {
                      id: 'system',
                      name: 'System Administration',
                      description: 'System level administration',
                      industry: 'Technology'
                    },
                    permissions: [
                      'system_admin',
                      'manage_organizations', 
                      'manage_system_users',
                      'view_system_analytics'
                    ] as Permission[],
                    position: 'System Administrator'
                  };
                  
                  // Store demo admin in localStorage for authentication
                  localStorage.setItem('user', JSON.stringify(demoAdmin));
                  localStorage.setItem('auth_token', 'demo-admin-token');
                  
                  // Navigate to admin dashboard
                  navigate('/system/analytics');
                }} 
                className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 shadow-lg hover:shadow-xl text-white font-semibold py-3 transform hover:scale-[1.02] transition-all duration-200"
              >
                <Shield className="h-4 w-4 mr-2" />
                Access System Admin Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Organizations */}
        <div className="space-y-4 sm:space-y-6">
          <div className="text-center px-2 space-y-3">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-800">Demo Organizations</h2>
            <p className="text-base sm:text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Experience role-based access control by selecting different user types. Each role has specific permissions and dashboard views.
            </p>
          </div>

          {demoOrganizations.map((org) => {
            const orgUsers = demoUsers.filter(user => user.organizationId === org.id);
            const manager = orgUsers.find(user => user.role === 'manager');
            const staff = orgUsers.filter(user => user.role === 'staff');

            return (
              <Card key={org.id} className="overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-slate-50/50">
                <CardHeader className="bg-gradient-to-r from-slate-100/80 to-slate-200/60 border-b border-slate-200/60">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 shadow-md">
                        <Building className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <CardTitle className="text-2xl font-bold text-slate-800">{org.name}</CardTitle>
                        <CardDescription className="text-slate-600 font-medium text-base">{org.description}</CardDescription>
                      </div>
                    </div>
                    <Badge className="bg-blue-100 text-blue-800 border-blue-300 px-3 py-1 text-sm font-semibold capitalize">
                      {org.industry}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-6 pb-6">
                  <div className="grid gap-6">
                    {/* Manager */}
                    {manager && (
                      <div>
                        <h4 className="font-bold text-base text-slate-700 mb-4 flex items-center gap-2 border-b border-slate-200 pb-2">
                          <Crown className="h-5 w-5 text-orange-600" />
                          Organization Manager
                        </h4>
                        <Card className="border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100/60 hover:from-orange-100 hover:to-orange-200/80 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                              onClick={() => handleUserLogin(manager)}>
                          <CardContent className="p-5">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                              <div className="flex items-center space-x-4">
                                <Avatar className="h-12 w-12 shadow-lg">
                                  <AvatarFallback className="bg-gradient-to-br from-orange-200 to-orange-300 text-orange-800 font-bold text-lg">
                                    {manager.name.charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="min-w-0 flex-1">
                                  <div className="flex flex-wrap items-center gap-2 mb-2">
                                    <h5 className="font-bold text-lg text-slate-800 truncate">{manager.name}</h5>
                                    <Badge className="bg-orange-200 text-orange-800 border-orange-300 capitalize text-xs font-semibold">
                                      <Crown className="h-3 w-3 mr-1" />
                                      {manager.role}
                                    </Badge>
                                  </div>
                                  <p className="text-sm font-medium text-orange-700 truncate">{manager.position}</p>
                                  <p className="text-xs text-orange-600 mt-1 line-clamp-2">{manager.description}</p>
                                </div>
                              </div>
                              <Button className="bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white font-semibold shadow-lg hover:shadow-xl w-full sm:w-auto transform hover:scale-105 transition-all duration-200">
                                Login as {manager.name.split(' ')[0]}
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    )}

                    {/* Staff */}
                    <div>
                      <h4 className="font-bold text-base text-slate-700 mb-4 flex items-center gap-2 border-b border-slate-200 pb-2">
                        <Users className="h-5 w-5 text-blue-600" />
                        Staff Members ({staff.length})
                      </h4>
                      <div className="grid gap-3 sm:gap-4">
                        {staff.map((user) => (
                          <Card key={user.id} 
                                className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100/60 hover:from-blue-100 hover:to-blue-200/80 transition-all duration-300 cursor-pointer shadow-md hover:shadow-lg transform hover:scale-[1.01]"
                                onClick={() => handleUserLogin(user)}>
                            <CardContent className="p-4">
                              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                <div className="flex items-center space-x-4">
                                  <Avatar className="h-10 w-10 shadow-md">
                                    <AvatarFallback className="bg-gradient-to-br from-blue-200 to-blue-300 text-blue-800 font-bold">
                                      {user.name.charAt(0)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center gap-2 mb-1">
                                      <h5 className="font-semibold text-base text-slate-800 truncate">{user.name}</h5>
                                      <Badge className="bg-blue-200 text-blue-800 border-blue-300 capitalize text-xs font-semibold">
                                        <User className="h-3 w-3 mr-1" />
                                        {user.role}
                                      </Badge>
                                    </div>
                                    <p className="text-sm font-medium text-blue-700 truncate">{user.position}</p>
                                    <p className="text-xs text-blue-600 mt-1 line-clamp-2">{user.description}</p>
                                  </div>
                                </div>
                                <Button variant="outline" className="border-blue-300 hover:bg-blue-200 text-blue-700 font-semibold w-full sm:w-auto transform hover:scale-105 transition-all duration-200">
                                  Login as {user.name.split(' ')[0]}
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="text-center pt-6 px-2 border-t border-slate-200">
          <div className="bg-slate-50 rounded-xl p-4 max-w-2xl mx-auto">
            <p className="text-sm text-slate-600 font-medium mb-2">
              🔒 Demo Environment Information
            </p>
            <p className="text-xs text-slate-500 leading-relaxed">
              This is a demonstration environment. Each user role provides different access levels and permissions. 
              Experience the complete financial management system with role-based security.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;

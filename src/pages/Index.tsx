
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";
import { Shield, Building, User, Crown, Users } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { demoOrganizations, demoUsers } from "@/data/demoData";
import { DemoUser } from "@/types/auth";

const Index = () => {
  const navigate = useNavigate();
  const { loginAsUser } = useAuth();

  const handleUserLogin = (user: DemoUser) => {
    loginAsUser(user.id);
    if (user.role === 'admin') {
      navigate('/system/analytics');
    } else {
      navigate('/org/dashboard');
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Shield className="h-4 w-4" />;
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
      case 'admin':
        return 'destructive';
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
        <div className="text-center space-y-3 sm:space-y-4 px-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-primary">Almared Pay Nexus</h1>
          <p className="text-muted-foreground text-base sm:text-lg px-2">
            Demo Platform - Choose an organization and user to test the system
          </p>
        </div>

        {/* Admin Access */}
        <Card className="bg-gradient-to-r from-red-50 to-red-100 border-red-200">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Shield className="h-6 w-6 text-red-600" />
              <CardTitle className="text-xl text-red-800">System Administrator</CardTitle>
            </div>
            <CardDescription className="text-red-700">
              Access the main admin dashboard for system-wide management and analytics.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {(() => {
              const adminUser = demoUsers.find(user => user.role === 'admin');
              return adminUser ? (
                <Card className="border-2 border-red-300 bg-red-50 hover:bg-red-100 transition-colors cursor-pointer"
                      onClick={() => handleUserLogin(adminUser)}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-red-100 text-red-700">
                            {adminUser.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <h5 className="font-medium text-base">{adminUser.name}</h5>
                            <Badge variant={getRoleBadgeVariant(adminUser.role)} className="capitalize text-xs">
                              {getRoleIcon(adminUser.role)}
                              <span className="ml-1">{adminUser.role}</span>
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{adminUser.position}</p>
                          <p className="text-xs text-muted-foreground mt-1">{adminUser.description}</p>
                        </div>
                      </div>
                      <Button size="sm" className="bg-red-600 hover:bg-red-700 text-sm">
                        Login as Admin
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Button 
                  onClick={() => navigate('/system/analytics')} 
                  className="w-full"
                >
                  Go to Admin Dashboard (Demo)
                </Button>
              );
            })()}
          </CardContent>
        </Card>

        {/* Organizations */}
        <div className="space-y-4 sm:space-y-6">
          <div className="text-center px-2">
            <h2 className="text-xl sm:text-2xl font-semibold mb-2">Demo Organizations</h2>
            <p className="text-sm sm:text-base text-muted-foreground">
              Select a user from any organization to test role-based access
            </p>
          </div>

          {demoOrganizations.map((org) => {
            const orgUsers = demoUsers.filter(user => user.organizationId === org.id);
            const manager = orgUsers.find(user => user.role === 'manager');
            const staff = orgUsers.filter(user => user.role === 'staff');

            return (
              <Card key={org.id} className="overflow-hidden">
                <CardHeader className="bg-muted/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Building className="h-6 w-6 text-primary" />
                      <div>
                        <CardTitle className="text-xl">{org.name}</CardTitle>
                        <CardDescription>{org.description}</CardDescription>
                      </div>
                    </div>
                    <Badge variant="outline" className="capitalize">
                      {org.industry}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-4 sm:pt-6">
                  <div className="grid gap-4 sm:gap-6">
                    {/* Manager */}
                    {manager && (
                      <div>
                        <h4 className="font-medium text-sm text-muted-foreground mb-3 flex items-center gap-2">
                          <Crown className="h-4 w-4" />
                          Manager
                        </h4>
                        <Card className="border-2 border-orange-200 bg-orange-50 hover:bg-orange-100 transition-colors cursor-pointer"
                              onClick={() => handleUserLogin(manager)}>
                          <CardContent className="p-3 sm:p-4">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                              <div className="flex items-center space-x-3">
                                <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
                                  <AvatarFallback className="bg-orange-100 text-orange-700">
                                    {manager.name.charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="min-w-0 flex-1">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <h5 className="font-medium text-sm sm:text-base truncate">{manager.name}</h5>
                                    <Badge variant={getRoleBadgeVariant(manager.role)} className="w-fit capitalize text-xs">
                                      {getRoleIcon(manager.role)}
                                      <span className="ml-1">{manager.role}</span>
                                    </Badge>
                                  </div>
                                  <p className="text-xs sm:text-sm text-muted-foreground truncate">{manager.position}</p>
                                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2 sm:line-clamp-1">{manager.description}</p>
                                </div>
                              </div>
                              <Button size="sm" className="bg-orange-600 hover:bg-orange-700 text-xs sm:text-sm w-full sm:w-auto">
                                Login as {manager.name.split(' ')[0]}
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    )}

                    {/* Staff */}
                    <div>
                      <h4 className="font-medium text-sm text-muted-foreground mb-3 flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Staff Members
                      </h4>
                      <div className="grid gap-2 sm:gap-3">
                        {staff.map((user) => (
                          <Card key={user.id} 
                                className="border-2 border-blue-200 bg-blue-50 hover:bg-blue-100 transition-colors cursor-pointer"
                                onClick={() => handleUserLogin(user)}>
                            <CardContent className="p-3 sm:p-4">
                              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                <div className="flex items-center space-x-3">
                                  <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
                                    <AvatarFallback className="bg-blue-100 text-blue-700">
                                      {user.name.charAt(0)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                      <h5 className="font-medium text-sm sm:text-base truncate">{user.name}</h5>
                                      <Badge variant={getRoleBadgeVariant(user.role)} className="w-fit capitalize text-xs">
                                        {getRoleIcon(user.role)}
                                        <span className="ml-1">{user.role}</span>
                                      </Badge>
                                    </div>
                                    <p className="text-xs sm:text-sm text-muted-foreground truncate">{user.position}</p>
                                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2 sm:line-clamp-1">{user.description}</p>
                                  </div>
                                </div>
                                <Button size="sm" variant="outline" className="border-blue-300 hover:bg-blue-200 text-xs sm:text-sm w-full sm:w-auto">
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

        <div className="text-center pt-4 px-2 space-y-2">
          <p className="text-xs text-muted-foreground">
            This is a demo environment. All users have the password "password" for testing purposes.
          </p>
          <Button 
            onClick={() => navigate('/admin-test')} 
            variant="outline" 
            size="sm"
            className="text-xs"
          >
            Admin Access Test
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;

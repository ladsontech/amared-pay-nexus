
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
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-primary">Almared Pay Nexus</h1>
          <p className="text-muted-foreground text-lg">
            Demo Platform - Choose an organization and user to test the system
          </p>
        </div>

        {/* Admin Access */}
        <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Shield className="h-6 w-6 text-primary" />
              <CardTitle className="text-xl">System Administrator</CardTitle>
            </div>
            <CardDescription>
              Access the main admin dashboard for system-wide management and analytics.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => navigate('/admin-dashboard')} 
              className="w-full"
            >
              Go to Admin Dashboard
            </Button>
          </CardContent>
        </Card>

        {/* Organizations */}
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-2">Demo Organizations</h2>
            <p className="text-muted-foreground">
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
                
                <CardContent className="pt-6">
                  <div className="grid gap-6">
                    {/* Manager */}
                    {manager && (
                      <div>
                        <h4 className="font-medium text-sm text-muted-foreground mb-3 flex items-center gap-2">
                          <Crown className="h-4 w-4" />
                          Manager
                        </h4>
                        <Card className="border-2 border-orange-200 bg-orange-50 hover:bg-orange-100 transition-colors cursor-pointer"
                              onClick={() => handleUserLogin(manager)}>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <Avatar className="h-10 w-10">
                                  <AvatarFallback className="bg-orange-100 text-orange-700">
                                    {manager.name.charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <h5 className="font-medium">{manager.name}</h5>
                                    <Badge variant={getRoleBadgeVariant(manager.role)} className="capitalize">
                                      {getRoleIcon(manager.role)}
                                      <span className="ml-1">{manager.role}</span>
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-muted-foreground">{manager.position}</p>
                                  <p className="text-xs text-muted-foreground mt-1">{manager.description}</p>
                                </div>
                              </div>
                              <Button size="sm" className="bg-orange-600 hover:bg-orange-700">
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
                      <div className="grid gap-3">
                        {staff.map((user) => (
                          <Card key={user.id} 
                                className="border-2 border-blue-200 bg-blue-50 hover:bg-blue-100 transition-colors cursor-pointer"
                                onClick={() => handleUserLogin(user)}>
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  <Avatar className="h-10 w-10">
                                    <AvatarFallback className="bg-blue-100 text-blue-700">
                                      {user.name.charAt(0)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <h5 className="font-medium">{user.name}</h5>
                                      <Badge variant={getRoleBadgeVariant(user.role)} className="capitalize">
                                        {getRoleIcon(user.role)}
                                        <span className="ml-1">{user.role}</span>
                                      </Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground">{user.position}</p>
                                    <p className="text-xs text-muted-foreground mt-1">{user.description}</p>
                                  </div>
                                </div>
                                <Button size="sm" variant="outline" className="border-blue-300 hover:bg-blue-200">
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

        <div className="text-center pt-4">
          <p className="text-xs text-muted-foreground">
            This is a demo environment. All users have the password "password" for testing purposes.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;

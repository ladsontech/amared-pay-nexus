
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Shield, Building, Users } from "lucide-react";

const RoleTesting = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-4xl w-full space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Role Testing Dashboard</h1>
          <p className="text-muted-foreground">Choose a role to test the application</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Shield className="h-6 w-6 text-primary" />
                <CardTitle>Main Admin</CardTitle>
              </div>
              <CardDescription>
                Access the main admin dashboard to manage all organizations, view system-wide analytics, and oversee platform operations.
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

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Building className="h-6 w-6 text-blue-600" />
                <CardTitle>Organization</CardTitle>
              </div>
              <CardDescription>
                Access the organization dashboard to manage bulk payments, petty cash, collections, and sub-admins within your organization.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => navigate('/org-dashboard')} 
                className="w-full"
                variant="outline"
              >
                Go to Organization Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            This is a testing interface. In production, role-based navigation will be handled by authentication.
          </p>
        </div>
      </div>
    </div>
  );
};

export default RoleTesting;


import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Shield, Building } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-4xl w-full space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold">Welcome to Almared Pay Nexus</h1>
          <p className="text-muted-foreground text-sm sm:text-base">Choose your role to access the appropriate dashboard</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                <CardTitle className="text-lg sm:text-xl">Main Admin</CardTitle>
              </div>
              <CardDescription className="text-sm">
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
                <Building className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                <CardTitle className="text-lg sm:text-xl">Organization</CardTitle>
              </div>
              <CardDescription className="text-sm">
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
          <p className="text-xs sm:text-sm text-muted-foreground">
            This is a testing interface. In production, role-based navigation will be handled by authentication.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;

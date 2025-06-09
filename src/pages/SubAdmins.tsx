
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Plus, Search, Filter, UserCircle, Mail, Phone, Edit, X } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { useToast } from "@/hooks/use-toast";

interface SubAdmin {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "admin" | "manager" | "operator";
  status: "active" | "inactive";
  organization: string;
  createdAt: string;
}

const SubAdmins = () => {
  const [subAdmins, setSubAdmins] = useState<SubAdmin[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Simulate fetching sub-admins from /sub-admin-list/
    const fetchSubAdmins = async () => {
      try {
        setIsLoading(true);
        setTimeout(() => {
          setSubAdmins([
            {
              id: "SA001",
              name: "John Doe",
              email: "john.doe@techsolutions.com",
              phone: "+256701234567",
              role: "admin",
              status: "active",
              organization: "Tech Solutions Ltd",
              createdAt: "2024-01-10T10:30:00Z",
            },
            {
              id: "SA002",
              name: "Jane Smith",
              email: "jane.smith@digitalagency.com",
              phone: "+256789012345",
              role: "manager",
              status: "active",
              organization: "Digital Agency Inc",
              createdAt: "2024-01-08T14:20:00Z",
            },
            {
              id: "SA003",
              name: "Mike Johnson",
              email: "mike.johnson@startuphub.com",
              phone: "+256712345678",
              role: "operator",
              status: "inactive",
              organization: "Startup Hub",
              createdAt: "2024-01-05T09:15:00Z",
            },
          ]);
          setIsLoading(false);
        }, 1000);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load sub-admins",
          variant: "destructive",
        });
        setIsLoading(false);
      }
    };

    fetchSubAdmins();
  }, [toast]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "inactive":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-purple-100 text-purple-800";
      case "manager":
        return "bg-blue-100 text-blue-800";
      case "operator":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filteredSubAdmins = subAdmins.filter(
    (admin) =>
      admin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.organization.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteSubAdmin = (id: string) => {
    setSubAdmins(prev => prev.filter(admin => admin.id !== id));
    toast({
      title: "Sub-Admin Deleted",
      description: "Sub-admin has been successfully removed.",
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Sub-Admins</h1>
            <p className="text-muted-foreground">
              Manage sub-administrators and their permissions
            </p>
          </div>
          <Button className="flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>Add Sub-Admin</span>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Total Sub-Admins</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{subAdmins.length}</div>
              <p className="text-sm text-muted-foreground">Registered</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Active Sub-Admins</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {subAdmins.filter(admin => admin.status === "active").length}
              </div>
              <p className="text-sm text-muted-foreground">Currently active</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Admin Roles</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {subAdmins.filter(admin => admin.role === "admin").length}
              </div>
              <p className="text-sm text-muted-foreground">Full admin access</p>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search sub-admins..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-muted rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-muted rounded w-1/4"></div>
                      <div className="h-3 bg-muted rounded w-1/2"></div>
                    </div>
                    <div className="h-6 bg-muted rounded w-20"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredSubAdmins.map((admin) => (
              <Card key={admin.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                        <UserCircle className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-semibold">{admin.name}</h3>
                          <Badge className={getStatusColor(admin.status)}>
                            {admin.status}
                          </Badge>
                          <Badge className={getRoleColor(admin.role)}>
                            {admin.role}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <Mail className="h-3 w-3" />
                            <span>{admin.email}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Phone className="h-3 w-3" />
                            <span>{admin.phone}</span>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {admin.organization} • Created {new Date(admin.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleDeleteSubAdmin(admin.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {filteredSubAdmins.length === 0 && !isLoading && (
          <Card>
            <CardContent className="text-center py-12">
              <div className="text-muted-foreground">
                <UserCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">No sub-admins found</h3>
                <p>Add your first sub-admin to get started.</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default SubAdmins;

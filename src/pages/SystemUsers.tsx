
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Plus, Search, Filter, UserCircle, Mail, Phone, Building, Shield, Wallet } from "lucide-react";
import SystemAdminLayout from "@/components/SystemAdminLayout";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface SystemUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "super_admin" | "admin" | "manager" | "operator";
  status: "active" | "inactive";
  organization: string;
  lastLogin: string;
  createdAt: string;
}

const AdminSystemUsers = () => {
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user: currentUser } = useAuth();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        setTimeout(() => {
          setUsers([
            {
              id: "USR001",
              name: "Super Admin",
              email: "superadmin@almaredpay.com",
              phone: "+256700000000",
              role: "super_admin",
              status: "active",
              organization: "System",
              lastLogin: "2024-01-15T08:30:00Z",
              createdAt: "2024-01-01T00:00:00Z"
            },
            {
              id: "USR002",
              name: "John Doe",
              email: "john.doe@techsolutions.com",
              phone: "+256701234567",
              role: "admin",
              status: "active",
              organization: "Tech Solutions Ltd",
              lastLogin: "2024-01-14T16:45:00Z",
              createdAt: "2024-01-10T10:30:00Z"
            },
            {
              id: "USR003",
              name: "Jane Smith",
              email: "jane.smith@digitalagency.com",
              phone: "+256789012345",
              role: "admin",
              status: "active",
              organization: "Digital Agency Inc",
              lastLogin: "2024-01-14T14:20:00Z",
              createdAt: "2024-01-08T14:20:00Z"
            },
            {
              id: "USR004",
              name: "Mike Johnson",
              email: "mike.johnson@startuphub.com",
              phone: "+256712345678",
              role: "manager",
              status: "inactive",
              organization: "Startup Hub",
              lastLogin: "2024-01-10T09:15:00Z",
              createdAt: "2024-01-05T09:15:00Z"
            },
            {
              id: "USR005",
              name: "Sarah Wilson",
              email: "sarah.wilson@creativestudios.com",
              phone: "+256734567890",
              role: "admin",
              status: "inactive",
              organization: "Creative Studios",
              lastLogin: "2024-01-12T11:30:00Z",
              createdAt: "2024-01-03T15:45:00Z"
            },
            {
              id: "USR006",
              name: "David Brown",
              email: "david.brown@techsolutions.com",
              phone: "+256745678901",
              role: "operator",
              status: "active",
              organization: "Tech Solutions Ltd",
              lastLogin: "2024-01-14T13:15:00Z",
              createdAt: "2024-01-12T09:00:00Z"
            }
          ]);
          setIsLoading(false);
        }, 1000);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load system users",
          variant: "destructive",
        });
        setIsLoading(false);
      }
    };

    fetchUsers();
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
      case "super_admin":
        return "bg-red-100 text-red-800";
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

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "super_admin":
        return "Super Admin";
      case "admin":
        return "Admin";
      case "manager":
        return "Manager";
      case "operator":
        return "Operator";
      default:
        return role;
    }
  };

  const handleDeposit = (userId: string) => {
    toast({
      title: "Deposit Initiated",
      description: `Deposit of UGX 50,000 has been successfully added to user ${userId}`,
    });
  };

  const handleFunding = () => {
    toast({
      title: "Funding Request",
      description: "UGX 100,000 funding request has been submitted for approval",
    });
  };

  // Filter users based on current user's role
  const getFilteredUsers = () => {
    let baseFilteredUsers = users.filter(
      (user) =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.organization.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.role.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // If current user is a manager, only show users from their organization
    if (currentUser?.role === 'manager') {
      baseFilteredUsers = baseFilteredUsers.filter(
        user => user.organization === currentUser.organizationId || user.organization === "Tech Solutions Ltd"
      );
    }

    return baseFilteredUsers;
  };

  const filteredUsers = getFilteredUsers();

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-semibold text-slate-900">System Users</h1>
            <p className="text-sm text-muted-foreground">Manage all users across the system</p>
          </div>
          <div className="flex gap-2">
            <Button className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Add User</span>
            </Button>
            <Button 
              variant="outline" 
              onClick={handleFunding}
              className="flex items-center space-x-2"
            >
              <Wallet className="h-4 w-4" />
              <span>Request Funding</span>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card className="border border-slate-100 bg-white">
            <CardHeader>
              <CardTitle className="text-lg">Total Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users.length}</div>
              <p className="text-sm text-muted-foreground">System wide</p>
            </CardContent>
          </Card>
          <Card className="border border-slate-100 bg-white">
            <CardHeader>
              <CardTitle className="text-lg">Active Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {users.filter(user => user.status === "active").length}
              </div>
              <p className="text-sm text-muted-foreground">Currently active</p>
            </CardContent>
          </Card>
          <Card className="border border-slate-100 bg-white">
            <CardHeader>
              <CardTitle className="text-lg">Admins</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {users.filter(user => user.role === "admin" || user.role === "super_admin").length}
              </div>
              <p className="text-sm text-muted-foreground">Admin level access</p>
            </CardContent>
          </Card>
          <Card className="border border-slate-100 bg-white">
            <CardHeader>
              <CardTitle className="text-lg">Organizations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {new Set(users.filter(u => u.organization !== "System").map(u => u.organization)).size}
              </div>
              <p className="text-sm text-muted-foreground">With users</p>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search users..."
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
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredUsers.map((user) => (
              <Card key={user.id} className="border border-slate-100 bg-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                        <UserCircle className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-semibold text-lg">{user.name}</h3>
                          <Badge className={getStatusColor(user.status)}>
                            {user.status}
                          </Badge>
                          <Badge className={getRoleColor(user.role)}>
                            {getRoleLabel(user.role)}
                          </Badge>
                          {user.role === "super_admin" && (
                            <Badge variant="outline" className="border-red-200">
                              <Shield className="h-3 w-3 mr-1" />
                              System
                            </Badge>
                          )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                          <div>
                            <div className="flex items-center space-x-1 mb-1">
                              <Mail className="h-3 w-3" />
                              <span>{user.email}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Phone className="h-3 w-3" />
                              <span>{user.phone}</span>
                            </div>
                          </div>
                          <div>
                            <div className="flex items-center space-x-1 mb-1">
                              <Building className="h-3 w-3" />
                              <span>{user.organization}</span>
                            </div>
                            <p><strong>User ID:</strong> {user.id}</p>
                          </div>
                          <div>
                            <p><strong>Last Login:</strong> {new Date(user.lastLogin).toLocaleDateString()}</p>
                            <p><strong>Created:</strong> {new Date(user.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                     <div className="flex items-center space-x-2">
                       <Button variant="outline" size="sm">
                         Edit
                       </Button>
                       <Button 
                         variant="outline" 
                         size="sm" 
                         onClick={() => handleDeposit(user.id)}
                         className="text-green-600 hover:text-green-700"
                       >
                         <Wallet className="h-3 w-3 mr-1" />
                         Deposit
                       </Button>
                       <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                         Suspend
                       </Button>
                     </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default AdminSystemUsers;

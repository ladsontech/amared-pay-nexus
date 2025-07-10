
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Plus, Search, Filter, Users, Building, Wallet, Edit, MoreHorizontal } from "lucide-react";
import AdminDashboardLayout from "@/components/AdminDashboardLayout";
import { useToast } from "@/hooks/use-toast";

interface Organization {
  id: string;
  name: string;
  email: string;
  status: "active" | "inactive" | "suspended";
  walletBalance: number;
  members: number;
  createdAt: string;
  adminName: string;
  phone: string;
}

const AdminOrganizations = () => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        setIsLoading(true);
        setTimeout(() => {
          setOrganizations([
            {
              id: "ORG001",
              name: "Tech Solutions Ltd",
              email: "admin@techsolutions.com",
              status: "active",
              walletBalance: 125000,
              members: 45,
              createdAt: "2024-01-10T10:30:00Z",
              adminName: "John Doe",
              phone: "+256701234567"
            },
            {
              id: "ORG002",
              name: "Digital Agency Inc",
              email: "contact@digitalagency.com",
              status: "active",
              walletBalance: 85000,
              members: 28,
              createdAt: "2024-01-08T14:20:00Z",
              adminName: "Jane Smith",
              phone: "+256789012345"
            },
            {
              id: "ORG003",
              name: "Startup Hub",
              email: "info@startuphub.com",
              status: "inactive",
              walletBalance: 15000,
              members: 12,
              createdAt: "2024-01-05T09:15:00Z",
              adminName: "Mike Johnson",
              phone: "+256712345678"
            },
            {
              id: "ORG004",
              name: "Creative Studios",
              email: "hello@creativestudios.com",
              status: "suspended",
              walletBalance: 0,
              members: 8,
              createdAt: "2024-01-03T15:45:00Z",
              adminName: "Sarah Wilson",
              phone: "+256734567890"
            }
          ]);
          setIsLoading(false);
        }, 1000);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load organizations",
          variant: "destructive",
        });
        setIsLoading(false);
      }
    };

    fetchOrganizations();
  }, [toast]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "inactive":
        return "bg-yellow-100 text-yellow-800";
      case "suspended":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filteredOrganizations = organizations.filter(
    (org) =>
      org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      org.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      org.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      org.adminName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminDashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">System Organizations</h1>
            <p className="text-muted-foreground">
              Manage all organizations in the system
            </p>
          </div>
          <Button className="flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>Add Organization</span>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Total Organizations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{organizations.length}</div>
              <p className="text-sm text-muted-foreground">Registered</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Active</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {organizations.filter(org => org.status === "active").length}
              </div>
              <p className="text-sm text-muted-foreground">Currently active</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Total Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                UGX {organizations.reduce((sum, org) => sum + org.walletBalance, 0).toLocaleString()}
              </div>
              <p className="text-sm text-muted-foreground">System wide</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Total Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {organizations.reduce((sum, org) => sum + org.members, 0)}
              </div>
              <p className="text-sm text-muted-foreground">All organizations</p>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search organizations..."
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
          <div className="grid grid-cols-1 gap-4">
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
            {filteredOrganizations.map((org) => (
              <Card key={org.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                        <Building className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-semibold text-lg">{org.name}</h3>
                          <Badge className={getStatusColor(org.status)}>
                            {org.status}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                          <div>
                            <p><strong>ID:</strong> {org.id}</p>
                            <p><strong>Email:</strong> {org.email}</p>
                          </div>
                          <div>
                            <p><strong>Admin:</strong> {org.adminName}</p>
                            <p><strong>Phone:</strong> {org.phone}</p>
                          </div>
                          <div>
                            <p><strong>Created:</strong> {new Date(org.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-6 mt-3">
                          <div className="flex items-center space-x-1">
                            <Wallet className="h-4 w-4 text-green-600" />
                            <span className="font-medium">UGX {org.walletBalance.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Users className="h-4 w-4 text-blue-600" />
                            <span className="font-medium">{org.members} members</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-1" />
                        Manage
                      </Button>
                      <Button variant="outline" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AdminDashboardLayout>
  );
};

export default AdminOrganizations;

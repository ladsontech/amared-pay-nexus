import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Filter, UserCircle, Mail, Phone, Building, Edit, Trash2, ChevronDown, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { userService, UserResponse } from "@/services/userService";

const SystemUsers = () => {
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);
  const { toast } = useToast();
  const { user: currentUser } = useAuth();

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const data = await userService.listUsers();
      setUsers(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(
    (user) =>
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.first_name && user.first_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.last_name && user.last_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-slate-900">System Users</h1>
          <p className="text-sm text-muted-foreground">View all users across the system</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6">
        <Card className="border border-slate-100 bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-base sm:text-lg">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{users.length}</div>
            <p className="text-xs sm:text-sm text-muted-foreground">System wide</p>
          </CardContent>
        </Card>
        <Card className="border border-slate-100 bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-base sm:text-lg">Active Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-green-600">
              {users.filter(user => user.is_active).length}
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground">Currently active</p>
          </CardContent>
        </Card>
        <Card className="border border-slate-100 bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-base sm:text-lg">Organizations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-blue-600">
              {new Set(users.filter(u => u.organization).map(u => u.organization?.id)).size}
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground">With users</p>
          </CardContent>
        </Card>
        <Card className="border border-slate-100 bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-base sm:text-lg">Inactive</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-yellow-600">
              {users.filter(user => !user.is_active).length}
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground">Inactive accounts</p>
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
        <Button variant="outline" size="sm">
          <Filter className="h-4 w-4 mr-2" />
          Filter
        </Button>
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
        <div className="space-y-2">
          {filteredUsers.map((user) => {
            const isExpanded = expandedUserId === user.id;
            const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username;
            
            return (
              <Card 
                key={user.id} 
                className="border border-gray-200 bg-white hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setExpandedUserId(isExpanded ? null : user.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="flex-shrink-0">
                        {isExpanded ? (
                          <ChevronDown className="h-5 w-5 text-gray-400" />
                        ) : (
                          <ChevronRight className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                      <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center flex-shrink-0">
                        <UserCircle className="h-4 w-4 text-blue-600" />
                      </div>
                      <h3 className="font-semibold text-base text-gray-900 truncate">{fullName || user.username}</h3>
                      <Badge 
                        className={`${user.is_active ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"} flex-shrink-0`} 
                        variant="outline"
                      >
                        {user.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2 text-gray-700">
                            <Mail className="h-4 w-4 text-gray-400 flex-shrink-0" />
                            <span className="break-all">{user.email}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-gray-700">
                            <Phone className="h-4 w-4 text-gray-400 flex-shrink-0" />
                            <span>{user.phone_number || "N/A"}</span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-start space-x-2 text-gray-700">
                            <Building className="h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5" />
                            <span className="break-words">{user.organization?.name || "No Organization"}</span>
                          </div>
                          <p className="text-gray-700"><strong>Username:</strong> <span className="break-all">{user.username}</span></p>
                        </div>
                        <div className="space-y-2">
                          <p className="text-gray-700"><strong>Last Login:</strong> {user.last_login ? new Date(user.last_login).toLocaleDateString() : "Never"}</p>
                          <p className="text-gray-700"><strong>Joined:</strong> {new Date(user.date_joined).toLocaleDateString()}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            // TODO: Implement edit functionality
                            toast({
                              title: "Edit User",
                              description: `Edit functionality for ${fullName} will be implemented soon.`,
                            });
                          }}
                          className="border-blue-200 text-blue-600 hover:bg-blue-50"
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm(`Are you sure you want to delete ${fullName}?`)) {
                              // TODO: Implement delete functionality
                              toast({
                                title: "Delete User",
                                description: `Delete functionality for ${fullName} will be implemented soon.`,
                              });
                            }
                          }}
                          className="border-red-200 text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SystemUsers;

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Filter, UserCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { userService, UserResponse } from "@/services/userService";

const SystemUsers = () => {
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

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

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6">
        <Card className="border border-slate-100 bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs sm:text-base lg:text-lg">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-xl lg:text-2xl font-bold">{users.length}</div>
            <p className="text-[10px] sm:text-xs lg:text-sm text-muted-foreground">System wide</p>
          </CardContent>
        </Card>
        <Card className="border border-slate-100 bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs sm:text-base lg:text-lg">Active Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-xl lg:text-2xl font-bold text-green-600">
              {users.filter(user => user.is_active).length}
            </div>
            <p className="text-[10px] sm:text-xs lg:text-sm text-muted-foreground">Currently active</p>
          </CardContent>
        </Card>
        <Card className="border border-slate-100 bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs sm:text-base lg:text-lg">Organizations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-xl lg:text-2xl font-bold text-blue-600">
              {new Set(users.filter(u => u.organization).map(u => u.organization?.id)).size}
            </div>
            <p className="text-[10px] sm:text-xs lg:text-sm text-muted-foreground">With users</p>
          </CardContent>
        </Card>
        <Card className="border border-slate-100 bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs sm:text-base lg:text-lg">Inactive</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-xl lg:text-2xl font-bold text-yellow-600">
              {users.filter(user => !user.is_active).length}
            </div>
            <p className="text-[10px] sm:text-xs lg:text-sm text-muted-foreground">Inactive accounts</p>
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
        <Card className="border border-slate-100 bg-white">
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100">
              {filteredUsers.map((user) => {
                const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username;
                
                return (
                  <div
                    key={user.id}
                    className="p-4 hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center flex-shrink-0">
                          <UserCircle className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-base sm:text-lg truncate">{fullName || user.username}</h3>
                          <p className="text-xs sm:text-sm text-muted-foreground truncate">{user.email}</p>
                        </div>
                      </div>
                      <Badge 
                        className={`${user.is_active ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"} ml-2 flex-shrink-0`} 
                        variant="outline"
                      >
                        {user.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SystemUsers;

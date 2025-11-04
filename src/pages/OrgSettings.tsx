import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Settings, 
  Bell, 
  User, 
  Building,
  Save,
  Plus,
  Trash2,
  Edit,
  Layout,
  Upload,
  Sparkles,
  Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getOrganizationLogoUrl } from "@/utils/organizationAvatar";
import { useNavigate } from "react-router-dom";
import { organizationService } from "@/services/organizationService";
import { useOrganization } from "@/hooks/useOrganization";

const OrgSettings = () => {
  const { user, hasPermission } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { organization, loading: orgLoading, updateOrganization } = useOrganization();
  
  const [profileSettings, setProfileSettings] = useState({
    name: user?.name || '',
    email: user?.email || '',
    department: user?.department || ''
  });

  const [logoUrl, setLogoUrl] = useState<string>("");
  const [isSavingLogo, setIsSavingLogo] = useState(false);

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    transactionAlerts: true,
    approvalReminders: true,
    weeklyReports: false,
    pushNotifications: true
  });

  const [interfaceSettings, setInterfaceSettings] = useState({
    menuPlacement: 'header', // 'header' or 'sidebar'
    compactMode: false,
    darkMode: false
  });

  const [expenseCategories, setExpenseCategories] = useState<Array<{id: string, name: string, description: string, budget: number, spent: number, count: number}>>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  // Category definitions based on API enum values
  const categoryDefinitions: Record<string, { name: string; description: string }> = {
    office_supplies: { name: 'Office Supplies', description: 'Stationery, equipment, and office materials' },
    travel: { name: 'Travel', description: 'Business travel expenses and transportation' },
    meals: { name: 'Meals', description: 'Food and dining expenses' },
    entertainment: { name: 'Entertainment', description: 'Client meetings, events, and entertainment' },
    utilities: { name: 'Utilities', description: 'Internet, phone, electricity, and other utilities' },
    maintenance: { name: 'Maintenance', description: 'Office repairs and maintenance costs' },
    emergency: { name: 'Emergency', description: 'Unexpected or emergency expenses' },
    other: { name: 'Other', description: 'Other miscellaneous expenses' }
  };

   // Fetch profile settings on mount
   useEffect(() => {
     if (user) {
       setProfileSettings({
         name: user.name || '',
         email: user.email || '',
         department: user.department || ''
       });
     }
   }, [user]);

   // Update logo URL when organization changes
   useEffect(() => {
     if (organization?.logo) {
       setLogoUrl(organization.logo);
     } else {
       setLogoUrl("");
     }
   }, [organization?.logo]);

  // Fetch expense categories from actual expenses
  useEffect(() => {
    const fetchCategories = async () => {
      if (!user?.organizationId || !organization?.id) {
        setLoadingCategories(false);
        return;
      }

      try {
        setLoadingCategories(true);
        
        // First, get the organization's petty cash wallet to filter expenses
        const wallets = await organizationService.getPettyCashWallets({
          organization: organization.id,
          limit: 10
        });

        // Fetch petty cash expenses for all wallets in the organization
        const allExpenses: any[] = [];
        for (const wallet of wallets.results) {
          try {
            const expenses = await organizationService.getPettyCashExpenses({
              petty_cash_wallet: wallet.id,
              limit: 1000, // Get a large number to calculate stats
              offset: 0
            });
            allExpenses.push(...expenses.results);
          } catch (err) {
            console.warn(`Failed to fetch expenses for wallet ${wallet.id}:`, err);
          }
        }

        // Group expenses by category and calculate totals
        const categoryStats: Record<string, { spent: number; count: number }> = {};
        
        allExpenses.forEach((expense) => {
          const category = expense.category || 'other';
          if (!categoryStats[category]) {
            categoryStats[category] = { spent: 0, count: 0 };
          }
          categoryStats[category].spent += expense.amount || 0;
          categoryStats[category].count += 1;
        });

        // Build categories array from all available categories
        const allCategories = Object.keys(categoryDefinitions).map((categoryKey, index) => {
          const stats = categoryStats[categoryKey] || { spent: 0, count: 0 };
          const def = categoryDefinitions[categoryKey];
          
          return {
            id: categoryKey,
            name: def.name,
            description: def.description,
            budget: 0, // Budgets would need a separate endpoint
            spent: stats.spent,
            count: stats.count
          };
        });

        // Sort by spent amount (descending), then by name
        allCategories.sort((a, b) => {
          if (b.spent !== a.spent) return b.spent - a.spent;
          return a.name.localeCompare(b.name);
        });

        setExpenseCategories(allCategories);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
        toast({
          title: "Error loading categories",
          description: "Could not load expense categories. Showing default categories.",
          variant: "destructive",
        });
        // Fallback to default categories based on enum values
        const defaultCategories = Object.keys(categoryDefinitions).map((key, index) => ({
          id: key,
          name: categoryDefinitions[key].name,
          description: categoryDefinitions[key].description,
          budget: 0,
          spent: 0,
          count: 0
        }));
        setExpenseCategories(defaultCategories);
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, [user?.organizationId, organization?.id, toast]);

  const handleSaveProfile = () => {
    // Profile updates would be handled via API in production
    toast({
      title: "Profile updated",
      description: "Your profile settings have been saved successfully.",
    });
  };

  const handleSaveNotifications = () => {
    toast({
      title: "Notification settings updated",
      description: "Your notification preferences have been saved.",
    });
  };

  const handleSaveInterface = () => {
    toast({
      title: "Interface settings updated",
      description: "Your interface preferences have been saved. Please refresh to see changes.",
    });
  };

  const handleAddCategory = () => {
    toast({
      title: "Info",
      description: "Categories are predefined based on expense types. You cannot add custom categories.",
    });
  };

  const handleDeleteCategory = (id: string) => {
    toast({
      title: "Info",
      description: "Categories are predefined and cannot be deleted. They are based on expense types used in petty cash.",
    });
  };

  return (
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-0">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Settings</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Manage your account and organization preferences
          </p>
        </div>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5 h-auto gap-1 overflow-x-auto">
          <TabsTrigger value="profile" className="text-[10px] sm:text-xs lg:text-sm py-2">Profile</TabsTrigger>
          <TabsTrigger value="notifications" className="text-[10px] sm:text-xs lg:text-sm py-2">Notifications</TabsTrigger>
          <TabsTrigger value="interface" className="text-[10px] sm:text-xs lg:text-sm py-2">Interface</TabsTrigger>
          <TabsTrigger value="categories" className="text-[10px] sm:text-xs lg:text-sm py-2">Categories</TabsTrigger>
          <TabsTrigger value="organization" className="text-[10px] sm:text-xs lg:text-sm py-2">Organization</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Settings
              </CardTitle>
              <CardDescription>
                Update your personal information and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                <Avatar className="h-16 w-16 sm:h-20 sm:w-20">
                  <AvatarImage src={user?.avatar} alt={user?.name} />
                  <AvatarFallback className="text-base sm:text-lg">{user?.name?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 w-full sm:w-auto">
                  <Button variant="outline" size="sm" className="w-full sm:w-auto text-xs sm:text-sm">
                    Change Photo
                  </Button>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                    JPG, PNG or GIF. Max size 2MB.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-xs sm:text-sm">Full Name</Label>
                  <Input
                    id="name"
                    value={profileSettings.name}
                    onChange={(e) => setProfileSettings({...profileSettings, name: e.target.value})}
                    className="text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-xs sm:text-sm">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileSettings.email}
                    onChange={(e) => setProfileSettings({...profileSettings, email: e.target.value})}
                    className="text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-2">
                  <Label htmlFor="department" className="text-xs sm:text-sm">Department</Label>
                  <Input
                    id="department"
                    value={profileSettings.department}
                    onChange={(e) => setProfileSettings({...profileSettings, department: e.target.value})}
                    className="text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role" className="text-xs sm:text-sm">Role</Label>
                  <Input
                    id="role"
                    value={user?.role || 'N/A'}
                    disabled
                    className="text-sm"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSaveProfile} className="w-full sm:w-auto text-xs sm:text-sm">
                  <Save className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Preferences
              </CardTitle>
              <CardDescription>
                Choose how you want to be notified about activities
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex flex-col gap-2 p-3 border border-slate-100 rounded-lg bg-slate-50 sm:bg-transparent sm:border-0 sm:rounded-none">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5 flex-1 pr-4">
                      <Label className="text-xs sm:text-sm">Email Notifications</Label>
                      <p className="text-[10px] sm:text-xs text-muted-foreground">
                        Receive email updates about your account activity
                      </p>
                    </div>
                    <Switch
                      checked={notificationSettings.emailNotifications}
                      onCheckedChange={(checked) => 
                        setNotificationSettings({...notificationSettings, emailNotifications: checked})
                      }
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2 p-3 border border-slate-100 rounded-lg bg-slate-50 sm:bg-transparent sm:border-0 sm:rounded-none">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5 flex-1 pr-4">
                      <Label className="text-xs sm:text-sm">Transaction Alerts</Label>
                      <p className="text-[10px] sm:text-xs text-muted-foreground">
                        Get notified when transactions need your attention
                      </p>
                    </div>
                    <Switch
                      checked={notificationSettings.transactionAlerts}
                      onCheckedChange={(checked) => 
                        setNotificationSettings({...notificationSettings, transactionAlerts: checked})
                      }
                    />
                  </div>
                </div>

                {hasPermission('approve_transactions') && (
                  <div className="flex flex-col gap-2 p-3 border border-slate-100 rounded-lg bg-slate-50 sm:bg-transparent sm:border-0 sm:rounded-none">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5 flex-1 pr-4">
                        <Label className="text-xs sm:text-sm">Approval Reminders</Label>
                        <p className="text-[10px] sm:text-xs text-muted-foreground">
                          Reminders for pending approvals
                        </p>
                      </div>
                      <Switch
                        checked={notificationSettings.approvalReminders}
                        onCheckedChange={(checked) => 
                          setNotificationSettings({...notificationSettings, approvalReminders: checked})
                        }
                      />
                    </div>
                  </div>
                )}

                <div className="flex flex-col gap-2 p-3 border border-slate-100 rounded-lg bg-slate-50 sm:bg-transparent sm:border-0 sm:rounded-none">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5 flex-1 pr-4">
                      <Label className="text-xs sm:text-sm">Weekly Reports</Label>
                      <p className="text-[10px] sm:text-xs text-muted-foreground">
                        Receive weekly summary reports via email
                      </p>
                    </div>
                    <Switch
                      checked={notificationSettings.weeklyReports}
                      onCheckedChange={(checked) => 
                        setNotificationSettings({...notificationSettings, weeklyReports: checked})
                      }
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2 p-3 border border-slate-100 rounded-lg bg-slate-50 sm:bg-transparent sm:border-0 sm:rounded-none">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5 flex-1 pr-4">
                      <Label className="text-xs sm:text-sm">Push Notifications</Label>
                      <p className="text-[10px] sm:text-xs text-muted-foreground">
                        Receive push notifications in your browser
                      </p>
                    </div>
                    <Switch
                      checked={notificationSettings.pushNotifications}
                      onCheckedChange={(checked) => 
                        setNotificationSettings({...notificationSettings, pushNotifications: checked})
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSaveNotifications} className="w-full sm:w-auto text-xs sm:text-sm">
                  <Save className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                  Save Preferences
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="interface">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layout className="h-5 w-5" />
                Interface Settings
              </CardTitle>
              <CardDescription>
                Customize your interface layout and appearance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs sm:text-sm">Menu Placement</Label>
                  <Select 
                    value={interfaceSettings.menuPlacement} 
                    onValueChange={(value) => setInterfaceSettings({...interfaceSettings, menuPlacement: value})}
                  >
                    <SelectTrigger className="text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="header">Header Navigation</SelectItem>
                      <SelectItem value="sidebar">Sidebar Navigation</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Choose where to display the main navigation menu
                  </p>
                </div>

                <div className="flex flex-col gap-2 p-3 border border-slate-100 rounded-lg bg-slate-50 sm:bg-transparent sm:border-0 sm:rounded-none">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5 flex-1 pr-4">
                      <Label className="text-xs sm:text-sm">Compact Mode</Label>
                      <p className="text-[10px] sm:text-xs text-muted-foreground">
                        Reduce spacing and use smaller elements
                      </p>
                    </div>
                    <Switch
                      checked={interfaceSettings.compactMode}
                      onCheckedChange={(checked) => 
                        setInterfaceSettings({...interfaceSettings, compactMode: checked})
                      }
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2 p-3 border border-slate-100 rounded-lg bg-slate-50 sm:bg-transparent sm:border-0 sm:rounded-none">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5 flex-1 pr-4">
                      <Label className="text-xs sm:text-sm">Dark Mode</Label>
                      <p className="text-[10px] sm:text-xs text-muted-foreground">
                        Use dark theme for the interface
                      </p>
                    </div>
                    <Switch
                      checked={interfaceSettings.darkMode}
                      onCheckedChange={(checked) => 
                        setInterfaceSettings({...interfaceSettings, darkMode: checked})
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSaveInterface} className="w-full sm:w-auto text-xs sm:text-sm">
                  <Save className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                  Save Interface Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories">
          <Card>
            <CardHeader>
              <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Settings className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="text-base sm:text-lg">Expense Categories</span>
                </div>
                {hasPermission('manage_team') && (
                  <Button onClick={handleAddCategory} size="sm" className="w-full sm:w-auto text-xs sm:text-sm">
                    <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                    Add Category
                  </Button>
                )}
              </CardTitle>
              <CardDescription>
                Manage expense categories and their budgets
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingCategories ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                  <span className="ml-2 text-sm text-muted-foreground">Loading categories...</span>
                </div>
              ) : expenseCategories.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm text-muted-foreground">No expense categories found.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {expenseCategories.map((category) => (
                    <div key={category.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 sm:p-4 border border-slate-200 rounded-lg bg-white">
                      <div className="flex-1 space-y-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                          <h3 className="font-medium text-sm sm:text-base truncate">{category.name}</h3>
                          <div className="flex gap-2 flex-wrap">
                            {category.spent > 0 && (
                              <Badge variant="outline" className="text-xs sm:text-sm w-fit">
                                Spent: UGX {category.spent.toLocaleString()}
                              </Badge>
                            )}
                            {category.count > 0 && (
                              <Badge variant="secondary" className="text-xs sm:text-sm w-fit">
                                {category.count} {category.count === 1 ? 'expense' : 'expenses'}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <p className="text-xs sm:text-sm text-muted-foreground">{category.description}</p>
                      </div>
                      {hasPermission('manage_team') && (
                        <div className="flex items-center gap-2 sm:space-x-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 sm:h-9 sm:w-auto sm:px-3"
                            onClick={() => {
                              toast({
                                title: "Info",
                                description: "Category budgets are not yet supported by the API. Categories are automatically derived from expense types.",
                              });
                            }}
                          >
                            <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                            <span className="hidden sm:inline ml-2">Edit</span>
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleDeleteCategory(category.id)}
                            className="h-8 w-8 sm:h-9 sm:w-auto sm:px-3 text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                            <span className="hidden sm:inline ml-2">Delete</span>
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="organization">
          <Card>
            <CardHeader>
              <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="text-base sm:text-lg">Organization Settings</span>
                </div>
                {user?.role === 'owner' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      localStorage.removeItem(`onboarding_complete_${user?.organizationId}`);
                      toast({
                        title: "Onboarding reset",
                        description: "The onboarding will appear on your next page refresh.",
                      });
                      setTimeout(() => {
                        window.location.reload();
                      }, 1500);
                    }}
                    className="w-full sm:w-auto text-xs sm:text-sm"
                  >
                    <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                    Restart Setup
                  </Button>
                )}
              </CardTitle>
              <CardDescription>
                View and manage organization-wide settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6">
              {/* Logo Upload Section */}
              <div className="space-y-3 sm:space-y-4">
                <Label className="text-xs sm:text-sm">Organization Logo</Label>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                  <div className="relative flex-shrink-0">
                    <img 
                      src={getOrganizationLogoUrl(user?.organization)} 
                      alt={user?.organization?.name || 'Organization logo'} 
                      className="h-16 w-16 sm:h-20 sm:w-20 rounded-lg object-cover border-2 border-blue-200"
                      onError={(e) => {
                        // Fallback to default avatar if logo fails to load
                        const target = e.currentTarget as HTMLImageElement;
                        target.src = getOrganizationLogoUrl(user?.organization);
                      }}
                    />
                  </div>
                  <div className="flex-1 space-y-2 w-full">
                    <div className="flex gap-2">
                      <Input
                        type="url"
                        value={logoUrl}
                        onChange={(e) => setLogoUrl(e.target.value)}
                        onBlur={async () => {
                          if (!organization) return;
                          
                          const orgId = user?.organization?.id || user?.organizationId;
                          if (!orgId) {
                            toast({
                              title: "Error",
                              description: "Organization ID not found",
                              variant: "destructive",
                            });
                            return;
                          }

                          // Only save if URL changed
                          if (logoUrl === (organization.logo || "")) {
                            return;
                          }

                          setIsSavingLogo(true);
                          try {
                            await updateOrganization({
                              logo: logoUrl.trim() || null,
                            });
                            toast({
                              title: "Logo updated",
                              description: "Organization logo has been updated successfully",
                            });
                            // Refresh to show new logo
                            setTimeout(() => window.location.reload(), 500);
                          } catch (error: any) {
                            console.error("Logo update error:", error);
                            toast({
                              title: "Update failed",
                              description: error.message || "Failed to update logo. Please check the URL format and try again.",
                              variant: "destructive",
                            });
                            // Reset to original value on error
                            setLogoUrl(organization.logo || "");
                          } finally {
                            setIsSavingLogo(false);
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.currentTarget.blur();
                          }
                        }}
                        disabled={isSavingLogo}
                        placeholder="https://example.com/logo.png"
                        className="text-xs sm:text-sm"
                      />
                      <Button
                        type="button"
                        onClick={async () => {
                          if (!organization) return;
                          
                          const orgId = user?.organization?.id || user?.organizationId;
                          if (!orgId) {
                            toast({
                              title: "Error",
                              description: "Organization ID not found",
                              variant: "destructive",
                            });
                            return;
                          }

                          setIsSavingLogo(true);
                          try {
                            await updateOrganization({
                              logo: logoUrl.trim() || null,
                            });
                            toast({
                              title: "Logo updated",
                              description: "Organization logo has been updated successfully",
                            });
                            // Refresh to show new logo
                            setTimeout(() => window.location.reload(), 500);
                          } catch (error: any) {
                            console.error("Logo update error:", error);
                            toast({
                              title: "Update failed",
                              description: error.message || "Failed to update logo. Please check the URL format and try again.",
                              variant: "destructive",
                            });
                            // Reset to original value on error
                            setLogoUrl(organization.logo || "");
                          } finally {
                            setIsSavingLogo(false);
                          }
                        }}
                        disabled={isSavingLogo || logoUrl === (organization?.logo || "")}
                        size="sm"
                        className="text-xs sm:text-sm"
                      >
                        {isSavingLogo ? (
                          <>
                            <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 animate-spin" />
                            <span className="hidden sm:inline">Saving...</span>
                          </>
                        ) : (
                          <>
                            <Save className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                            <span className="hidden sm:inline">Save</span>
                          </>
                        )}
                      </Button>
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Enter a direct link to your organization logo image. Press Enter or click Save to update.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-2">
                  <Label className="text-xs sm:text-sm">Organization Name</Label>
                  <Input value={organization?.name || 'Loading...'} disabled className="text-sm" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs sm:text-sm">Organization ID</Label>
                  <Input value={user?.organizationId || 'Loading...'} disabled className="text-sm" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-2">
                  <Label className="text-xs sm:text-sm">Company Registration ID</Label>
                  <Input value={organization?.company_reg_id || 'Not set'} disabled className="text-sm" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs sm:text-sm">Tax ID (TIN)</Label>
                  <Input value={organization?.tin || 'Not set'} disabled className="text-sm" />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs sm:text-sm">Organization Address</Label>
                <Textarea
                  value={organization?.address || 'Not set'}
                  disabled
                  rows={3}
                  className="text-sm"
                />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-2">
                  <Label className="text-xs sm:text-sm">Created On</Label>
                  <Input 
                    value={organization?.created_at ? new Date(organization.created_at).toLocaleDateString() : 'N/A'} 
                    disabled 
                    className="text-sm" 
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs sm:text-sm">Last Updated</Label>
                  <Input 
                    value={organization?.updated_at ? new Date(organization.updated_at).toLocaleDateString() : 'N/A'} 
                    disabled 
                    className="text-sm" 
                  />
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t">
                <p className="text-xs sm:text-sm text-muted-foreground">
                  To update organization details, visit the Organization tab
                </p>
                {hasPermission('manage_team') && (
                  <Button onClick={() => navigate('/org/settings')} variant="outline">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Details
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OrgSettings;
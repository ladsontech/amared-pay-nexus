import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Settings, 
  Bell, 
  Layout,
  Save,
  Sparkles,
  Loader2,
  ChevronRight,
  User,
  Building2,
  Shield,
  Tag,
  Mail,
  Smartphone,
  Globe,
  FileText,
  ArrowLeft
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getOrganizationLogoUrl } from "@/utils/organizationAvatar";
import { useNavigate } from "react-router-dom";
import { organizationService } from "@/services/organizationService";
import { useOrganization } from "@/hooks/useOrganization";
import { useIsMobile } from "@/hooks/use-mobile";

type SettingsSection = {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  items: SettingsItem[];
};

type SettingsItem = {
  id: string;
  title: string;
  description?: string;
  type: 'switch' | 'button' | 'link' | 'info';
  value?: boolean;
  action?: () => void;
  href?: string;
  badge?: string;
  icon?: React.ComponentType<{ className?: string }>;
};

const OrgSettings = () => {
  const { user, hasPermission } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { organization, loading: orgLoading, updateOrganization } = useOrganization();
  
  const [logoUrl, setLogoUrl] = useState<string>("");
  const [isSavingLogo, setIsSavingLogo] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    transactionAlerts: true,
    approvalReminders: true,
    weeklyReports: false,
    pushNotifications: true
  });

  const [interfaceSettings, setInterfaceSettings] = useState({
    compactMode: false,
    darkMode: false
  });

  const [expenseCategories, setExpenseCategories] = useState<Array<{id: string, name: string, description: string, budget: number, spent: number, count: number}>>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

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

  useEffect(() => {
    if (organization?.logo) {
      setLogoUrl(organization.logo);
    } else {
      setLogoUrl("");
    }
  }, [organization?.logo]);

  useEffect(() => {
    const fetchCategories = async () => {
      if (!user?.organizationId || !organization?.id) {
        setLoadingCategories(false);
        return;
      }

      try {
        setLoadingCategories(true);
        
        const wallets = await organizationService.getPettyCashWallets({
          organization: organization.id,
          limit: 10
        });

        const allExpenses: any[] = [];
        for (const wallet of wallets.results) {
          try {
            const expenses = await organizationService.getPettyCashExpenses({
              petty_cash_wallet: wallet.id,
              limit: 1000,
              offset: 0
            });
            allExpenses.push(...expenses.results);
          } catch (err) {
            console.warn(`Failed to fetch expenses for wallet ${wallet.id}:`, err);
          }
        }

        const categoryStats: Record<string, { spent: number; count: number }> = {};
        
        allExpenses.forEach((expense) => {
          const category = expense.category || 'other';
          if (!categoryStats[category]) {
            categoryStats[category] = { spent: 0, count: 0 };
          }
          categoryStats[category].spent += expense.amount || 0;
          categoryStats[category].count += 1;
        });

        const allCategories = Object.keys(categoryDefinitions).map((categoryKey) => {
          const stats = categoryStats[categoryKey] || { spent: 0, count: 0 };
          const def = categoryDefinitions[categoryKey];
          
          return {
            id: categoryKey,
            name: def.name,
            description: def.description,
            budget: 0,
            spent: stats.spent,
            count: stats.count
          };
        });

        allCategories.sort((a, b) => {
          if (b.spent !== a.spent) return b.spent - a.spent;
          return a.name.localeCompare(b.name);
        });

        setExpenseCategories(allCategories);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
        const defaultCategories = Object.keys(categoryDefinitions).map((key) => ({
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
  }, [user?.organizationId, organization?.id]);

  const handleSaveNotifications = () => {
    toast({
      title: "Notification settings updated",
      description: "Your notification preferences have been saved.",
    });
  };

  const handleSaveInterface = () => {
    toast({
      title: "Interface settings updated",
      description: "Your interface preferences have been saved.",
    });
  };

  const handleSaveLogo = async () => {
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
      setTimeout(() => window.location.reload(), 500);
    } catch (error: any) {
      console.error("Logo update error:", error);
      toast({
        title: "Update failed",
        description: error.message || "Failed to update logo. Please check the URL format and try again.",
        variant: "destructive",
      });
      setLogoUrl(organization.logo || "");
    } finally {
      setIsSavingLogo(false);
    }
  };

  const settingsSections: SettingsSection[] = [
    {
      id: 'notifications',
      title: 'Notifications',
      icon: Bell,
      items: [
        {
          id: 'email',
          title: 'Email Notifications',
          description: 'Receive email updates about your account activity',
          type: 'switch',
          value: notificationSettings.emailNotifications,
          action: () => setNotificationSettings({...notificationSettings, emailNotifications: !notificationSettings.emailNotifications})
        },
        {
          id: 'transactions',
          title: 'Transaction Alerts',
          description: 'Get notified when transactions need your attention',
          type: 'switch',
          value: notificationSettings.transactionAlerts,
          action: () => setNotificationSettings({...notificationSettings, transactionAlerts: !notificationSettings.transactionAlerts})
        },
        ...(hasPermission('approve_transactions') ? [{
          id: 'approvals',
          title: 'Approval Reminders',
          description: 'Reminders for pending approvals',
          type: 'switch' as const,
          value: notificationSettings.approvalReminders,
          action: () => setNotificationSettings({...notificationSettings, approvalReminders: !notificationSettings.approvalReminders})
        }] : []),
        {
          id: 'reports',
          title: 'Weekly Reports',
          description: 'Receive weekly summary reports via email',
          type: 'switch',
          value: notificationSettings.weeklyReports,
          action: () => setNotificationSettings({...notificationSettings, weeklyReports: !notificationSettings.weeklyReports})
        },
        {
          id: 'push',
          title: 'Push Notifications',
          description: 'Receive push notifications in your browser',
          type: 'switch',
          value: notificationSettings.pushNotifications,
          action: () => setNotificationSettings({...notificationSettings, pushNotifications: !notificationSettings.pushNotifications})
        }
      ]
    },
    {
      id: 'interface',
      title: 'Interface',
      icon: Layout,
      items: [
        {
          id: 'compact',
          title: 'Compact Mode',
          description: 'Reduce spacing and use smaller elements',
          type: 'switch',
          value: interfaceSettings.compactMode,
          action: () => setInterfaceSettings({...interfaceSettings, compactMode: !interfaceSettings.compactMode})
        },
        {
          id: 'dark',
          title: 'Dark Mode',
          description: 'Use dark theme for the interface',
          type: 'switch',
          value: interfaceSettings.darkMode,
          action: () => setInterfaceSettings({...interfaceSettings, darkMode: !interfaceSettings.darkMode})
        }
      ]
    },
    {
      id: 'organization',
      title: 'Organization',
      icon: Building2,
      items: [
        {
          id: 'logo',
          title: 'Organization Logo',
          description: 'Update your organization logo',
          type: 'button',
          action: () => setActiveSection('logo')
        },
        {
          id: 'details',
          title: 'Organization Details',
          description: 'View organization information',
          type: 'link',
          href: '/org/account',
          icon: ChevronRight
        },
        ...(user?.role === 'owner' ? [{
          id: 'onboarding',
          title: 'Restart Setup',
          description: 'Reset and restart the onboarding process',
          type: 'button' as const,
          action: () => {
            localStorage.removeItem(`onboarding_complete_${user?.organizationId}`);
            toast({
              title: "Onboarding reset",
              description: "The onboarding will appear on your next page refresh.",
            });
            setTimeout(() => window.location.reload(), 1500);
          }
        }] : [])
      ]
    },
    {
      id: 'account',
      title: 'Account',
      icon: User,
      items: [
        {
          id: 'profile',
          title: 'Profile Settings',
          description: 'Manage your personal information',
          type: 'link',
          href: '/org/account',
          icon: ChevronRight
        },
        {
          id: 'security',
          title: 'Security & Password',
          description: 'Change your password and security settings',
          type: 'link',
          href: '/org/account#security',
          icon: ChevronRight
        }
      ]
    }
  ];

  const renderSettingsItem = (item: SettingsItem) => {
    if (item.type === 'switch') {
      return (
        <div key={item.id} className="flex items-center justify-between py-3 px-1">
          <div className="flex-1 min-w-0 pr-4">
            <Label className="text-sm font-medium text-foreground">{item.title}</Label>
            {item.description && (
              <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
            )}
          </div>
          <Switch
            checked={item.value}
            onCheckedChange={item.action}
          />
        </div>
      );
    }

    if (item.type === 'link' || item.type === 'button') {
      const content = (
        <div className="flex items-center justify-between py-3 px-1 flex-1">
          <div className="flex-1 min-w-0 pr-4">
            <div className="flex items-center gap-2">
              <Label className="text-sm font-medium text-foreground">{item.title}</Label>
              {item.badge && (
                <Badge variant="secondary" className="text-xs">{item.badge}</Badge>
              )}
            </div>
            {item.description && (
              <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
            )}
          </div>
          {item.icon ? (
            <item.icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          )}
        </div>
      );

      if (item.type === 'link' && item.href) {
        return (
          <button
            key={item.id}
            onClick={() => navigate(item.href!)}
            className="w-full text-left hover:bg-accent/50 transition-colors rounded-lg"
          >
            {content}
          </button>
        );
      }

      return (
        <button
          key={item.id}
          onClick={item.action}
          className="w-full text-left hover:bg-accent/50 transition-colors rounded-lg"
        >
          {content}
        </button>
      );
    }

    return null;
  };

  // Mobile View - List-based interface
  if (isMobile) {
    if (activeSection === 'logo') {
      return (
        <div className="space-y-4 pb-20">
          {/* Mobile Header */}
          <div className="flex items-center gap-3 mb-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setActiveSection(null)}
              className="h-9 w-9"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-lg font-bold">Organization Logo</h1>
              <p className="text-xs text-muted-foreground">Update your organization logo</p>
            </div>
          </div>

          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="flex justify-center">
                <img 
                  src={getOrganizationLogoUrl(user?.organization)} 
                  alt={user?.organization?.name || 'Organization logo'} 
                  className="h-24 w-24 rounded-xl object-cover border-2 border-blue-200"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Logo URL</Label>
                <Input
                  type="url"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  placeholder="https://example.com/logo.png"
                  disabled={isSavingLogo}
                />
                <p className="text-xs text-muted-foreground">
                  Enter a direct link to your organization logo image
                </p>
              </div>

              <Button 
                onClick={handleSaveLogo} 
                disabled={isSavingLogo || logoUrl === (organization?.logo || "")}
                className="w-full"
              >
                {isSavingLogo ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Logo
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }

    return (
      <div className="space-y-1 pb-20">
        {/* Mobile Header */}
        <div className="sticky top-12 bg-white border-b border-gray-100 -mx-3 sm:-mx-4 md:mx-0 px-3 sm:px-4 md:px-0 py-4 mb-4 z-10">
          <h1 className="text-xl font-bold text-black">Settings</h1>
          <p className="text-sm text-gray-600">Manage your preferences</p>
        </div>

        {/* Settings Sections */}
        {settingsSections.map((section) => (
          <Card key={section.id} className="border-0 shadow-none bg-transparent">
            <CardHeader className="pb-2 pt-4">
              <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                <section.icon className="h-4 w-4" />
                {section.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 px-0">
              <div className="bg-white rounded-lg border border-gray-100 divide-y divide-gray-100">
                {section.items.map((item) => (
                  <div key={item.id}>
                    {renderSettingsItem(item)}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Expense Categories Section */}
        <Card className="border-0 shadow-none bg-transparent">
          <CardHeader className="pb-2 pt-4">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
              <Tag className="h-4 w-4" />
              Expense Categories
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 px-0">
            <div className="bg-white rounded-lg border border-gray-100">
              {loadingCategories ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                  <span className="ml-2 text-sm text-muted-foreground">Loading...</span>
                </div>
              ) : expenseCategories.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm text-muted-foreground">No categories found</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {expenseCategories.map((category, index) => (
                    <div key={category.id} className="py-3 px-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground">{category.name}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{category.description}</p>
                          <div className="flex gap-2 mt-2">
                            {category.spent > 0 && (
                              <Badge variant="outline" className="text-xs">
                                UGX {category.spent.toLocaleString()}
                              </Badge>
                            )}
                            {category.count > 0 && (
                              <Badge variant="secondary" className="text-xs">
                                {category.count} {category.count === 1 ? 'expense' : 'expenses'}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-3 px-1">
              Categories are automatically derived from expense types
            </p>
          </CardContent>
        </Card>

        {/* Save Buttons */}
        <div className="space-y-3 pt-4">
          <Button 
            onClick={handleSaveNotifications} 
            className="w-full"
            variant="outline"
          >
            <Save className="h-4 w-4 mr-2" />
            Save Notification Settings
          </Button>
          <Button 
            onClick={handleSaveInterface} 
            className="w-full"
            variant="outline"
          >
            <Save className="h-4 w-4 mr-2" />
            Save Interface Settings
          </Button>
        </div>
      </div>
    );
  }

  // Desktop View - Traditional Card Layout
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage your account and organization preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Notifications */}
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
            {settingsSections.find(s => s.id === 'notifications')?.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between py-2">
                <div className="space-y-0.5 flex-1 pr-4">
                  <Label className="text-sm">{item.title}</Label>
                  {item.description && (
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                  )}
                </div>
                <Switch
                  checked={item.value}
                  onCheckedChange={item.action}
                />
              </div>
            ))}
            <Button onClick={handleSaveNotifications} className="w-full mt-4">
              <Save className="h-4 w-4 mr-2" />
              Save Preferences
            </Button>
          </CardContent>
        </Card>

        {/* Interface */}
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
          <CardContent className="space-y-4">
            {settingsSections.find(s => s.id === 'interface')?.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between py-2">
                <div className="space-y-0.5 flex-1 pr-4">
                  <Label className="text-sm">{item.title}</Label>
                  {item.description && (
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                  )}
                </div>
                <Switch
                  checked={item.value}
                  onCheckedChange={item.action}
                />
              </div>
            ))}
            <Button onClick={handleSaveInterface} className="w-full mt-4">
              <Save className="h-4 w-4 mr-2" />
              Save Interface Settings
            </Button>
          </CardContent>
        </Card>

        {/* Organization */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Organization Settings
            </CardTitle>
            <CardDescription>
              Manage organization-wide settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Logo Upload */}
            <div className="space-y-3">
              <Label>Organization Logo</Label>
              <div className="flex items-center gap-4">
                <img 
                  src={getOrganizationLogoUrl(user?.organization)} 
                  alt={user?.organization?.name || 'Organization logo'} 
                  className="h-16 w-16 rounded-lg object-cover border-2 border-blue-200"
                />
                <div className="flex-1 space-y-2">
                  <div className="flex gap-2">
                    <Input
                      type="url"
                      value={logoUrl}
                      onChange={(e) => setLogoUrl(e.target.value)}
                      placeholder="https://example.com/logo.png"
                      disabled={isSavingLogo}
                      className="text-sm"
                    />
                    <Button
                      onClick={handleSaveLogo}
                      disabled={isSavingLogo || logoUrl === (organization?.logo || "")}
                      size="sm"
                    >
                      {isSavingLogo ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Enter a direct link to your organization logo image
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Organization Links */}
            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-between"
                onClick={() => navigate('/org/account')}
              >
                <span>View Organization Details</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Account */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Account Settings
            </CardTitle>
            <CardDescription>
              Manage your personal account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              variant="outline"
              className="w-full justify-between"
              onClick={() => navigate('/org/account')}
            >
              <span>Profile Settings</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="w-full justify-between"
              onClick={() => navigate('/org/account#security')}
            >
              <span>Security & Password</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>

        {/* Expense Categories */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5" />
              Expense Categories
            </CardTitle>
            <CardDescription>
              View expense categories and their usage statistics
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {expenseCategories.map((category) => (
                  <div key={category.id} className="p-4 border border-gray-200 rounded-lg bg-white">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 space-y-1">
                        <h3 className="font-medium text-sm">{category.name}</h3>
                        <p className="text-xs text-muted-foreground">{category.description}</p>
                        <div className="flex gap-2 mt-2">
                          {category.spent > 0 && (
                            <Badge variant="outline" className="text-xs">
                              UGX {category.spent.toLocaleString()}
                            </Badge>
                          )}
                          {category.count > 0 && (
                            <Badge variant="secondary" className="text-xs">
                              {category.count} {category.count === 1 ? 'expense' : 'expenses'}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-4">
              Categories are automatically derived from expense types used in petty cash transactions.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OrgSettings;

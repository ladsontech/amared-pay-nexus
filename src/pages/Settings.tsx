import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Save, Shield, Bell, Database, DollarSign, LogOut, User } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { useToast } from "@/hooks/use-toast";

const Settings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    notifications: {
      emailAlerts: true,
      smsAlerts: false,
      pushNotifications: true,
    },
    security: {
      twoFactorAuth: false,
      sessionTimeout: "30",
    },
    payment: {
      defaultCurrency: "UGX",
      maxTransactionAmount: "1000000",
      commissionRate: "2.5",
    },
    api: {
      webhookUrl: "",
      apiTimeout: "30",
    },
  });

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user");
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
    navigate("/login");
  };

  const handleSave = (section: string) => {
    toast({
      title: "Settings Saved",
      description: `${section} settings have been updated successfully.`,
    });
  };

  const updateSetting = (section: string, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [key]: value,
      },
    }));
  };

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-primary">Settings</h1>
          <p className="text-muted-foreground">
            Configure your bulk payment system preferences
          </p>
        </div>

        {/* Account Section */}
        <Card className="border-l-4 border-l-primary">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <User className="h-5 w-5 text-primary" />
              <CardTitle>Account Information</CardTitle>
            </div>
            <CardDescription>
              Your account details and logout options
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Name</Label>
                <Input value={user.name || "Demo User"} disabled />
              </div>
              <div>
                <Label>Email</Label>
                <Input value={user.email || "demo@example.com"} disabled />
              </div>
            </div>
            <div>
              <Label>Organization</Label>
              <Input value={user.organization || "Demo Organization"} disabled />
            </div>
            <Separator />
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                variant="destructive" 
                onClick={handleLogout}
                className="flex items-center space-x-2"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </Button>
              <Button variant="outline">
                Change Password
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Bell className="h-5 w-5 text-primary" />
                <CardTitle>Notifications</CardTitle>
              </div>
              <CardDescription>
                Manage how you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="email-alerts">Email Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive email notifications for transactions
                  </p>
                </div>
                <Switch
                  id="email-alerts"
                  checked={settings.notifications.emailAlerts}
                  onCheckedChange={(checked) => 
                    updateSetting('notifications', 'emailAlerts', checked)
                  }
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="sms-alerts">SMS Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive SMS notifications for critical events
                  </p>
                </div>
                <Switch
                  id="sms-alerts"
                  checked={settings.notifications.smsAlerts}
                  onCheckedChange={(checked) => 
                    updateSetting('notifications', 'smsAlerts', checked)
                  }
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="push-notifications">Push Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive browser push notifications
                  </p>
                </div>
                <Switch
                  id="push-notifications"
                  checked={settings.notifications.pushNotifications}
                  onCheckedChange={(checked) => 
                    updateSetting('notifications', 'pushNotifications', checked)
                  }
                />
              </div>
              <Button 
                onClick={() => handleSave('Notification')} 
                className="w-full"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Notification Settings
              </Button>
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-primary" />
                <CardTitle>Security</CardTitle>
              </div>
              <CardDescription>
                Manage your account security settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="two-factor">Two-Factor Authentication</Label>
                  <p className="text-sm text-muted-foreground">
                    Add an extra layer of security to your account
                  </p>
                </div>
                <Switch
                  id="two-factor"
                  checked={settings.security.twoFactorAuth}
                  onCheckedChange={(checked) => 
                    updateSetting('security', 'twoFactorAuth', checked)
                  }
                />
              </div>
              <Separator />
              <div className="space-y-2">
                <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
                <Input
                  id="session-timeout"
                  type="number"
                  value={settings.security.sessionTimeout}
                  onChange={(e) => 
                    updateSetting('security', 'sessionTimeout', e.target.value)
                  }
                />
                <p className="text-sm text-muted-foreground">
                  Automatically log out after inactivity
                </p>
              </div>
              <Button 
                onClick={() => handleSave('Security')} 
                className="w-full"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Security Settings
              </Button>
            </CardContent>
          </Card>

          {/* Payment Settings */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5 text-primary" />
                <CardTitle>Payment Configuration</CardTitle>
              </div>
              <CardDescription>
                Configure payment processing settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="default-currency">Default Currency</Label>
                <Input
                  id="default-currency"
                  value={settings.payment.defaultCurrency}
                  onChange={(e) => 
                    updateSetting('payment', 'defaultCurrency', e.target.value)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="max-amount">Maximum Transaction Amount (UGX)</Label>
                <Input
                  id="max-amount"
                  type="number"
                  value={settings.payment.maxTransactionAmount}
                  onChange={(e) => 
                    updateSetting('payment', 'maxTransactionAmount', e.target.value)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="commission-rate">Commission Rate (%)</Label>
                <Input
                  id="commission-rate"
                  type="number"
                  step="0.1"
                  value={settings.payment.commissionRate}
                  onChange={(e) => 
                    updateSetting('payment', 'commissionRate', e.target.value)
                  }
                />
              </div>
              <Button 
                onClick={() => handleSave('Payment')} 
                className="w-full"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Payment Settings
              </Button>
            </CardContent>
          </Card>

          {/* API Settings */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Database className="h-5 w-5 text-primary" />
                <CardTitle>API Configuration</CardTitle>
              </div>
              <CardDescription>
                Configure API endpoints and settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="webhook-url">Webhook URL</Label>
                <Input
                  id="webhook-url"
                  type="url"
                  placeholder="https://your-app.com/webhook"
                  value={settings.api.webhookUrl}
                  onChange={(e) => 
                    updateSetting('api', 'webhookUrl', e.target.value)
                  }
                />
                <p className="text-sm text-muted-foreground">
                  URL to receive payment status updates
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="api-timeout">API Timeout (seconds)</Label>
                <Input
                  id="api-timeout"
                  type="number"
                  value={settings.api.apiTimeout}
                  onChange={(e) => 
                    updateSetting('api', 'apiTimeout', e.target.value)
                  }
                />
              </div>
              <Button 
                onClick={() => handleSave('API')} 
                className="w-full"
              >
                <Save className="h-4 w-4 mr-2" />
                Save API Settings
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Danger Zone */}
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-red-600">Danger Zone</CardTitle>
            <CardDescription>
              These actions cannot be undone. Please proceed with caution.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-red-200 rounded-lg gap-3">
              <div>
                <h4 className="font-medium">Reset All Settings</h4>
                <p className="text-sm text-muted-foreground">
                  Reset all configuration to default values
                </p>
              </div>
              <Button variant="destructive" size="sm">Reset Settings</Button>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-red-200 rounded-lg gap-3">
              <div>
                <h4 className="font-medium">Clear Transaction History</h4>
                <p className="text-sm text-muted-foreground">
                  Permanently delete all transaction records
                </p>
              </div>
              <Button variant="destructive" size="sm">Clear History</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Settings;

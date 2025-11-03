import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Bell, Shield, Database, Globe, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const SystemSettings = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    siteName: "AlmaredPay",
    siteDescription: "Comprehensive payment management system",
    defaultCurrency: "UGX",
    timeZone: "Africa/Kampala",
    maintenanceMode: false,
    userRegistration: true,
    emailNotifications: true,
    smsNotifications: false,
    maxFileSize: "10",
    sessionTimeout: "30",
    backupFrequency: "daily",
    logRetention: "90"
  });

  const handleSave = () => {
    toast({
      title: "Settings saved",
      description: "System settings have been updated successfully.",
    });
  };

  const handleInputChange = (key: string, value: string | boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-0">
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-slate-900">System Settings</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">Configure global system settings and preferences</p>
        </div>
        <Button onClick={handleSave} className="w-full sm:w-auto text-xs sm:text-sm">
          <Save className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
          Save Changes
        </Button>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 h-auto gap-1">
          <TabsTrigger value="general" className="text-[10px] sm:text-xs lg:text-sm py-2">General</TabsTrigger>
          <TabsTrigger value="notifications" className="text-[10px] sm:text-xs lg:text-sm py-2">Notifications</TabsTrigger>
          <TabsTrigger value="security" className="text-[10px] sm:text-xs lg:text-sm py-2">Security</TabsTrigger>
          <TabsTrigger value="database" className="text-[10px] sm:text-xs lg:text-sm py-2">Database</TabsTrigger>
          <TabsTrigger value="integrations" className="text-[10px] sm:text-xs lg:text-sm py-2 col-span-2 sm:col-span-1">Integrations</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <div className="grid gap-6">
            <Card className="border border-blue-200 shadow-sm bg-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  General Settings
                </CardTitle>
                <CardDescription>
                  Basic system configuration and preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="siteName" className="text-xs sm:text-sm">Site Name</Label>
                    <Input
                      id="siteName"
                      value={settings.siteName}
                      onChange={(e) => handleInputChange('siteName', e.target.value)}
                      className="text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="defaultCurrency" className="text-xs sm:text-sm">Default Currency</Label>
                    <Select value={settings.defaultCurrency} onValueChange={(value) => handleInputChange('defaultCurrency', value)}>
                      <SelectTrigger className="text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="UGX">UGX - Ugandan Shilling</SelectItem>
                        <SelectItem value="USD">USD - US Dollar</SelectItem>
                        <SelectItem value="EUR">EUR - Euro</SelectItem>
                        <SelectItem value="GBP">GBP - British Pound</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="siteDescription" className="text-xs sm:text-sm">Site Description</Label>
                  <Textarea
                    id="siteDescription"
                    value={settings.siteDescription}
                    onChange={(e) => handleInputChange('siteDescription', e.target.value)}
                    rows={3}
                    className="text-sm"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="timeZone" className="text-xs sm:text-sm">Time Zone</Label>
                    <Select value={settings.timeZone} onValueChange={(value) => handleInputChange('timeZone', value)}>
                      <SelectTrigger className="text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Africa/Kampala">Africa/Kampala</SelectItem>
                        <SelectItem value="UTC">UTC</SelectItem>
                        <SelectItem value="America/New_York">America/New_York</SelectItem>
                        <SelectItem value="Europe/London">Europe/London</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sessionTimeout" className="text-xs sm:text-sm">Session Timeout (minutes)</Label>
                    <Input
                      id="sessionTimeout"
                      type="number"
                      value={settings.sessionTimeout}
                      onChange={(e) => handleInputChange('sessionTimeout', e.target.value)}
                      className="text-sm"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2 p-3 sm:p-0 border border-slate-100 sm:border-0 rounded-lg sm:rounded-none bg-slate-50 sm:bg-transparent">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5 flex-1 pr-4">
                      <Label className="text-xs sm:text-sm">Maintenance Mode</Label>
                      <p className="text-[10px] sm:text-xs text-muted-foreground">
                        Enable maintenance mode to prevent user access
                      </p>
                    </div>
                    <Switch
                      checked={settings.maintenanceMode}
                      onCheckedChange={(checked) => handleInputChange('maintenanceMode', checked)}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2 p-3 sm:p-0 border border-slate-100 sm:border-0 rounded-lg sm:rounded-none bg-slate-50 sm:bg-transparent">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5 flex-1 pr-4">
                      <Label className="text-xs sm:text-sm">User Registration</Label>
                      <p className="text-[10px] sm:text-xs text-muted-foreground">
                        Allow new users to register accounts
                      </p>
                    </div>
                    <Switch
                      checked={settings.userRegistration}
                      onCheckedChange={(checked) => handleInputChange('userRegistration', checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="notifications">
          <Card className="border border-blue-200 shadow-sm bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Settings
              </CardTitle>
              <CardDescription>
                Configure system-wide notification preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-2 p-3 border border-slate-100 rounded-lg bg-slate-50 sm:bg-transparent sm:border-0 sm:rounded-none">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5 flex-1 pr-4">
                    <Label className="text-xs sm:text-sm">Email Notifications</Label>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">
                      Send email notifications for important events
                    </p>
                  </div>
                  <Switch
                    checked={settings.emailNotifications}
                    onCheckedChange={(checked) => handleInputChange('emailNotifications', checked)}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2 p-3 border border-slate-100 rounded-lg bg-slate-50 sm:bg-transparent sm:border-0 sm:rounded-none">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5 flex-1 pr-4">
                    <Label className="text-xs sm:text-sm">SMS Notifications</Label>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">
                      Send SMS notifications for critical alerts
                    </p>
                  </div>
                  <Switch
                    checked={settings.smsNotifications}
                    onCheckedChange={(checked) => handleInputChange('smsNotifications', checked)}
                  />
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <Label className="text-xs sm:text-sm">Notification Categories</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex items-center justify-between p-2 border border-slate-100 rounded-lg bg-white">
                    <Label htmlFor="transaction-alerts" className="text-xs sm:text-sm cursor-pointer flex-1">Transaction Alerts</Label>
                    <Switch id="transaction-alerts" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between p-2 border border-slate-100 rounded-lg bg-white">
                    <Label htmlFor="security-alerts" className="text-xs sm:text-sm cursor-pointer flex-1">Security Alerts</Label>
                    <Switch id="security-alerts" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between p-2 border border-slate-100 rounded-lg bg-white">
                    <Label htmlFor="system-updates" className="text-xs sm:text-sm cursor-pointer flex-1">System Updates</Label>
                    <Switch id="system-updates" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between p-2 border border-slate-100 rounded-lg bg-white">
                    <Label htmlFor="maintenance-notices" className="text-xs sm:text-sm cursor-pointer flex-1">Maintenance Notices</Label>
                    <Switch id="maintenance-notices" defaultChecked />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card className="border border-blue-200 shadow-sm bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Settings
              </CardTitle>
              <CardDescription>
                Configure security policies and access controls
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-2">
                  <Label htmlFor="maxFileSize" className="text-xs sm:text-sm">Max File Upload Size (MB)</Label>
                  <Input
                    id="maxFileSize"
                    type="number"
                    value={settings.maxFileSize}
                    onChange={(e) => handleInputChange('maxFileSize', e.target.value)}
                    className="text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs sm:text-sm">Password Policy</Label>
                  <div className="flex flex-wrap gap-1.5">
                    <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-[10px] sm:text-xs">Min 8 characters</Badge>
                    <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-[10px] sm:text-xs">Special chars required</Badge>
                    <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-[10px] sm:text-xs">Numbers required</Badge>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2 p-3 border border-slate-100 rounded-lg bg-slate-50 sm:bg-transparent sm:border-0 sm:rounded-none">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5 flex-1 pr-4">
                    <Label className="text-xs sm:text-sm">Two-Factor Authentication</Label>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">
                      Require 2FA for admin users
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs sm:text-sm">IP Restrictions</Label>
                <p className="text-[10px] sm:text-xs text-muted-foreground">
                  Restrict admin access to specific IP addresses
                </p>
                <Textarea
                  placeholder="Enter IP addresses (one per line)"
                  rows={3}
                  className="text-sm"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="database">
          <Card className="border border-blue-200 shadow-sm bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Database Settings
              </CardTitle>
              <CardDescription>
                Configure database backup and maintenance settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-2">
                  <Label htmlFor="backupFrequency" className="text-xs sm:text-sm">Backup Frequency</Label>
                  <Select value={settings.backupFrequency} onValueChange={(value) => handleInputChange('backupFrequency', value)}>
                    <SelectTrigger className="text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hourly">Hourly</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="logRetention" className="text-xs sm:text-sm">Log Retention (days)</Label>
                  <Input
                    id="logRetention"
                    type="number"
                    value={settings.logRetention}
                    onChange={(e) => handleInputChange('logRetention', e.target.value)}
                    className="text-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs sm:text-sm">Database Status</Label>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                  <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-xs sm:text-sm w-fit">Healthy</Badge>
                  <span className="text-xs sm:text-sm text-gray-600">Last backup: 2 hours ago</span>
                </div>
              </div>

              <div className="space-y-2">
                <Button variant="outline" className="w-full sm:w-auto text-xs sm:text-sm">
                  <Database className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                  Run Manual Backup
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations">
          <Card className="border border-blue-200 shadow-sm bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Integrations
              </CardTitle>
              <CardDescription>
                Configure third-party integrations and API settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 sm:p-4 border border-slate-200 rounded-lg bg-white">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm sm:text-base">Payment Gateway</h3>
                    <p className="text-xs sm:text-sm text-gray-600 truncate">MTN Mobile Money integration</p>
                  </div>
                  <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-xs sm:text-sm w-fit">Connected</Badge>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 sm:p-4 border border-slate-200 rounded-lg bg-white">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm sm:text-base">Email Service</h3>
                    <p className="text-xs sm:text-sm text-gray-600 truncate">SMTP configuration for notifications</p>
                  </div>
                  <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-xs sm:text-sm w-fit">Active</Badge>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 sm:p-4 border border-slate-200 rounded-lg bg-white">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm sm:text-base">SMS Service</h3>
                    <p className="text-xs sm:text-sm text-gray-600 truncate">SMS gateway for alerts</p>
                  </div>
                  <Badge className="bg-gray-100 text-gray-700 border-gray-200 text-xs sm:text-sm w-fit">Pending</Badge>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 sm:p-4 border border-slate-200 rounded-lg bg-white">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm sm:text-base">Analytics</h3>
                    <p className="text-xs sm:text-sm text-gray-600 truncate">Third-party analytics integration</p>
                  </div>
                  <Badge className="bg-gray-100 text-gray-700 border-gray-200 text-xs sm:text-sm w-fit">Disabled</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SystemSettings;
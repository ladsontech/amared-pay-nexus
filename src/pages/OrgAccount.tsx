import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useOrganizationData } from '@/hooks/useOrganizationData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { User, Mail, Phone, MapPin, Calendar, Shield, Building2, Briefcase, CreditCard, Globe, Hash } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

export default function OrgAccount() {
  const { user: authUser, changePassword } = useAuth();
  const { organization, stats, loading: orgLoading } = useOrganizationData();
  const isMobile = useIsMobile();
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: ''
  });
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });

  // Use auth user data directly
  useEffect(() => {
    if (authUser) {
      setFormData({
        firstName: authUser.firstName || '',
        lastName: authUser.lastName || '',
        email: authUser.email || '',
        phoneNumber: authUser.phoneNumber || ''
      });
    }
  }, [authUser]);

  // Create userProfile from auth user for backward compatibility
  const userProfile = authUser ? {
    firstName: authUser.firstName || '',
    lastName: authUser.lastName || '',
    email: authUser.email || '',
    phoneNumber: authUser.phoneNumber || '',
    avatar: authUser.avatar,
    role: authUser.role,
    department: authUser.organization?.name || 'N/A',
    position: authUser.position || 'Staff Member',
    joinedDate: new Date().toISOString(),
    isEmailVerified: authUser.isEmailVerified,
    isPhoneVerified: authUser.isPhoneVerified
  } : null;

  const loading = orgLoading || !authUser;

  const handleSaveProfile = async () => {
    // TODO: Implement API call to update user profile
    toast.info('Profile update feature coming soon');
    setIsEditing(false);
  };

  const handleChangePassword = async () => {
    if (passwordData.new_password !== passwordData.confirm_password) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordData.new_password.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    try {
      const result = await changePassword(passwordData.current_password, passwordData.new_password);
      if (result.success) {
        toast.success('Password changed successfully');
        setPasswordData({
          current_password: '',
          new_password: '',
          confirm_password: ''
        });
        setIsChangingPassword(false);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to change password');
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 sm:space-y-6 pb-20 md:pb-0">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 pb-20 md:pb-0">
      {/* Mobile Header */}
      <div className="md:hidden bg-white border-b border-gray-100 -mx-6 px-6 py-4 mb-4">
        <h1 className="text-xl font-bold text-black">Account Settings</h1>
        <p className="text-sm text-gray-600">Manage your account and organization</p>
      </div>

      {/* Desktop Header */}
      <div className="hidden md:block">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Account Settings</h2>
        <p className="text-sm md:text-base text-muted-foreground">
          Manage your account settings and organization details
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList className={`${isMobile ? 'grid w-full grid-cols-3' : 'inline-flex'}`}>
          <TabsTrigger value="profile" className={isMobile ? 'text-xs' : ''}>
            <User className="h-4 w-4 mr-2" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="security" className={isMobile ? 'text-xs' : ''}>
            <Shield className="h-4 w-4 mr-2" />
            Security
          </TabsTrigger>
          <TabsTrigger value="organization" className={isMobile ? 'text-xs' : ''}>
            <Building2 className="h-4 w-4 mr-2" />
            Organization
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <div className="space-y-6">
            {/* Profile Overview */}
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
                  <Avatar className="h-20 w-20 sm:h-24 sm:w-24">
                    <AvatarImage src={userProfile?.avatar} alt={`${userProfile?.firstName} ${userProfile?.lastName}`} />
                    <AvatarFallback className="text-lg sm:text-xl">
                      {userProfile?.firstName?.[0]}{userProfile?.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-2 text-center sm:text-left">
                    <CardTitle className="text-xl sm:text-2xl">
                      {userProfile?.firstName} {userProfile?.lastName}
                    </CardTitle>
                    <CardDescription className="text-base">{userProfile?.email}</CardDescription>
                    <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                      <Badge variant="secondary" className="text-sm">
                        <Briefcase className="h-3 w-3 mr-1" />
                        {userProfile?.role}
                      </Badge>
                      <Badge variant="outline" className="text-sm">
                        {userProfile?.department}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Profile Details */}
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>
                  Update your personal details and contact information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    disabled={!isEditing}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <Input
                    id="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                    disabled={!isEditing}
                  />
                </div>

                {/* Additional Profile Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t">
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Joined</p>
                      <p className="text-sm text-muted-foreground">
                        {userProfile?.joinedDate ? new Date(userProfile.joinedDate).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <User className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Position</p>
                      <p className="text-sm text-muted-foreground">{userProfile?.position}</p>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2">
                  {isEditing ? (
                    <>
                      <Button variant="outline" onClick={() => setIsEditing(false)} className="w-full sm:w-auto">
                        Cancel
                      </Button>
                      <Button onClick={handleSaveProfile} className="w-full sm:w-auto">
                        Save Changes
                      </Button>
                    </>
                  ) : (
                    <Button onClick={() => setIsEditing(true)} className="w-full sm:w-auto">
                      <User className="mr-2 h-4 w-4" />
                      Edit Profile
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>
                Manage your password and security preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {!isChangingPassword ? (
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Password</h4>
                    <p className="text-sm text-muted-foreground">
                      Last changed 30 days ago
                    </p>
                  </div>
                  <Button onClick={() => setIsChangingPassword(true)}>
                    <Shield className="mr-2 h-4 w-4" />
                    Change Password
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="current_password">Current Password</Label>
                    <Input
                      id="current_password"
                      type="password"
                      value={passwordData.current_password}
                      onChange={(e) => setPasswordData({...passwordData, current_password: e.target.value})}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="new_password">New Password</Label>
                    <Input
                      id="new_password"
                      type="password"
                      value={passwordData.new_password}
                      onChange={(e) => setPasswordData({...passwordData, new_password: e.target.value})}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirm_password">Confirm New Password</Label>
                    <Input
                      id="confirm_password"
                      type="password"
                      value={passwordData.confirm_password}
                      onChange={(e) => setPasswordData({...passwordData, confirm_password: e.target.value})}
                    />
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setIsChangingPassword(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleChangePassword}>
                      Change Password
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="organization">
          <div className="space-y-6">
            {/* Organization Overview */}
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <div className="p-3 rounded-lg bg-blue-50">
                    <Building2 className="h-8 w-8 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">{organization?.name}</CardTitle>
                    <CardDescription>{organization?.industry}</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Organization Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Staff</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.totalStaff}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Wallet Balance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    UGX {stats?.totalWalletBalance?.toLocaleString()}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Pending Approvals</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">{stats?.pendingApprovals}</div>
                </CardContent>
              </Card>
            </div>

            {/* Organization Details */}
            <Card>
              <CardHeader>
                <CardTitle>Organization Information</CardTitle>
                <CardDescription>
                  Detailed information about your organization
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="flex items-start space-x-3">
                    <Hash className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Registration Number</p>
                      <p className="text-sm text-muted-foreground">{organization?.registrationNumber}</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Established</p>
                      <p className="text-sm text-muted-foreground">
                        {organization?.establishedDate ? new Date(organization.establishedDate).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Address</p>
                      <p className="text-sm text-muted-foreground">{organization?.address}</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Phone</p>
                      <p className="text-sm text-muted-foreground">{organization?.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Email</p>
                      <p className="text-sm text-muted-foreground">{organization?.email}</p>
                    </div>
                  </div>
                  {organization?.website && (
                    <div className="flex items-start space-x-3">
                      <Globe className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Website</p>
                        <p className="text-sm text-muted-foreground">{organization.website}</p>
                      </div>
                    </div>
                  )}
                </div>

                <Separator />

                {/* Wallets */}
                <div>
                  <h4 className="font-medium mb-4">Organization Wallets</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {organization?.wallets?.map((wallet) => (
                      <Card key={wallet.id} className="border-2">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <CreditCard className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium text-sm">{wallet.name}</span>
                            </div>
                            <Badge 
                              variant={wallet.status === 'active' ? 'default' : 'secondary'}
                              className="text-xs"
                            >
                              {wallet.status}
                            </Badge>
                          </div>
                          <div className="text-lg font-bold text-green-600">
                            {wallet.currency} {wallet.balance.toLocaleString()}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* User Role and Permissions */}
                <div>
                  <h4 className="font-medium mb-4">Your Role & Permissions</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Role</p>
                        <p className="text-sm text-muted-foreground">{userProfile?.role}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Briefcase className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Department</p>
                        <p className="text-sm text-muted-foreground">{userProfile?.department}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Position</p>
                        <p className="text-sm text-muted-foreground">{userProfile?.position}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {authUser?.permissions?.map((permission, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {permission.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
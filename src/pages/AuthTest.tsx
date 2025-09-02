import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Eye, EyeOff, Mail, Shield, User, Building, 
  CheckCircle2, XCircle, Loader2, AlertCircle 
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { authService } from '@/services/authService';
import { organizationService } from '@/services/organizationService';
import { userService } from '@/services/userService';

const AuthTest = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);
  const [results, setResults] = useState<Record<string, any>>({});
  
  // Auth test states
  const [loginData, setLoginData] = useState({
    username: 'testuser',
    email: 'test@example.com',
    password: 'testpassword123'
  });
  
  const [passwordData, setPasswordData] = useState({
    current_password: 'oldpassword123',
    new_password: 'newpassword123'
  });
  
  // Organization test states
  const [orgData, setOrgData] = useState({
    username: 'orgowner',
    password: 'orgpassword123',
    first_name: 'John',
    last_name: 'Doe',
    email: 'owner@testorg.com',
    phone_number: '256700000000',
    org_name: 'Test Organization',
    address: '123 Test Street, Kampala',
    company_reg_id: 'REG123456',
    tin: 'TIN123456789',
    wallet_currency: 1,
    wallet_pin: '1234'
  });

  // User creation test states
  const [subAdminData, setSubAdminData] = useState({
    first_name: 'Jane',
    last_name: 'Smith',
    email: 'jane.smith@example.com',
    phone_number: '+256701234567',
    username: 'janesmith',
    password: 'password123'
  });

  const [staffData, setStaffData] = useState({
    first_name: 'Bob',
    last_name: 'Wilson',
    email: 'bob.wilson@example.com',
    phone_number: '+256789012345',
    username: 'bobwilson',
    password: 'password123',
    organization: '',
    role: 'member' as const
  });

  const [organizations, setOrganizations] = useState<Array<{id: string; name: string}>>([]);

  const testEndpoint = async (name: string, testFn: () => Promise<any>) => {
    setLoading(name);
    try {
      const result = await testFn();
      setResults(prev => ({ ...prev, [name]: { success: true, data: result } }));
      toast({
        title: `${name} Success`,
        description: 'API call completed successfully'
      });
    } catch (error: any) {
      console.error(`${name} Error:`, error);
      
      // Enhanced error handling for authentication issues
      let errorMessage = error.message;
      let suggestion = '';
      
      if (error.status === 401) {
        errorMessage = 'Authentication failed - Invalid or missing credentials';
        suggestion = 'Please login first using the Authentication tab';
      } else if (error.status === 403) {
        errorMessage = 'Access forbidden - Insufficient permissions';
        suggestion = 'Check if your account has the required permissions';
      } else if (error.status === 400) {
        errorMessage = 'Bad request - Check your input data';
        suggestion = 'Verify all required fields are filled correctly';
      }
      
      setResults(prev => ({ 
        ...prev, 
        [name]: { 
          success: false, 
          error: errorMessage,
          suggestion,
          status: error.status,
          details: error.details 
        } 
      }));
      
      toast({
        title: `${name} Failed`,
        description: suggestion || errorMessage,
        variant: 'destructive'
      });
    } finally {
      setLoading(null);
    }
  };

  const ResultCard = ({ name, result }: { name: string; result: any }) => (
    <Alert className={`mb-4 ${result?.success ? 'border-green-500' : 'border-red-500'}`}>
      <div className="flex items-center gap-2">
        {result?.success ? (
          <CheckCircle2 className="h-4 w-4 text-green-600" />
        ) : (
          <XCircle className="h-4 w-4 text-red-600" />
        )}
        <h4 className="font-semibold">{name}</h4>
      </div>
      <AlertDescription className="mt-2">
        {result?.success ? (
          <pre className="text-xs bg-muted p-2 rounded overflow-x-auto">
            {JSON.stringify(result.data, null, 2)}
          </pre>
        ) : (
          <div>
            <p className="text-red-600 font-medium">{result?.error}</p>
            {result?.suggestion && (
              <p className="text-amber-600 text-sm mt-1 font-medium">💡 {result.suggestion}</p>
            )}
            {result?.status && (
              <p className="text-sm text-muted-foreground mt-1">Status: {result.status}</p>
            )}
            {result?.details && (
              <pre className="text-xs bg-muted p-2 rounded mt-2 overflow-x-auto">
                {JSON.stringify(result.details, null, 2)}
              </pre>
            )}
          </div>
        )}
      </AlertDescription>
    </Alert>
  );

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary mb-2">API Authentication Testing</h1>
        <p className="text-muted-foreground">
          Test all authentication and organization endpoints with the backend API
        </p>
      </div>

      <Tabs defaultValue="auth" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="auth">Authentication</TabsTrigger>
          <TabsTrigger value="organization">Organizations</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="results">Test Results</TabsTrigger>
        </TabsList>

        <TabsContent value="auth" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Login Test */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Login Test
                </CardTitle>
                <CardDescription>Test POST /auth/login/</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Username</Label>
                    <Input
                      value={loginData.username}
                      onChange={(e) => setLoginData(prev => ({ ...prev, username: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={loginData.email}
                      onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                </div>
                <div>
                  <Label>Password</Label>
                  <Input
                    type="password"
                    value={loginData.password}
                    onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                  />
                </div>
                <Button 
                  onClick={() => testEndpoint('Login', () => authService.login(loginData))}
                  disabled={loading === 'Login'}
                  className="w-full"
                >
                  {loading === 'Login' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Test Login
                </Button>
              </CardContent>
            </Card>

            {/* Password Change Test */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Change Password
                </CardTitle>
                <CardDescription>Test POST /auth/password/change</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Current Password</Label>
                  <Input
                    type="password"
                    value={passwordData.current_password}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, current_password: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>New Password</Label>
                  <Input
                    type="password"
                    value={passwordData.new_password}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, new_password: e.target.value }))}
                  />
                </div>
                <Button 
                  onClick={() => testEndpoint('Change Password', () => authService.changePassword(passwordData))}
                  disabled={loading === 'Change Password'}
                  className="w-full"
                >
                  {loading === 'Change Password' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Test Change Password
                </Button>
              </CardContent>
            </Card>

            {/* Token Operations */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Token Operations</CardTitle>
                <CardDescription>Test token refresh, verify, and logout</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <Button 
                    onClick={() => testEndpoint('Refresh Token', () => authService.refreshToken())}
                    disabled={loading === 'Refresh Token'}
                    variant="outline"
                  >
                    {loading === 'Refresh Token' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Refresh Token
                  </Button>
                  <Button 
                    onClick={() => testEndpoint('Verify Token', () => {
                      const token = localStorage.getItem('access_token') || 'test-token';
                      return authService.verifyToken(token);
                    })}
                    disabled={loading === 'Verify Token'}
                    variant="outline"
                  >
                    {loading === 'Verify Token' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Verify Token
                  </Button>
                  <Button 
                    onClick={() => testEndpoint('Logout', () => authService.logout())}
                    disabled={loading === 'Logout'}
                    variant="outline"
                  >
                    {loading === 'Logout' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Logout
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="organization" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Create Organization
              </CardTitle>
              <CardDescription>Test POST /organizations/create_org/</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Username</Label>
                  <Input
                    value={orgData.username}
                    onChange={(e) => setOrgData(prev => ({ ...prev, username: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Password</Label>
                  <Input
                    type="password"
                    value={orgData.password}
                    onChange={(e) => setOrgData(prev => ({ ...prev, password: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>First Name</Label>
                  <Input
                    value={orgData.first_name}
                    onChange={(e) => setOrgData(prev => ({ ...prev, first_name: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Last Name</Label>
                  <Input
                    value={orgData.last_name}
                    onChange={(e) => setOrgData(prev => ({ ...prev, last_name: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={orgData.email}
                    onChange={(e) => setOrgData(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Phone Number</Label>
                  <Input
                    value={orgData.phone_number}
                    onChange={(e) => setOrgData(prev => ({ ...prev, phone_number: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Organization Name</Label>
                  <Input
                    value={orgData.org_name}
                    onChange={(e) => setOrgData(prev => ({ ...prev, org_name: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Address</Label>
                  <Input
                    value={orgData.address}
                    onChange={(e) => setOrgData(prev => ({ ...prev, address: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Company Registration ID</Label>
                  <Input
                    value={orgData.company_reg_id}
                    onChange={(e) => setOrgData(prev => ({ ...prev, company_reg_id: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>TIN Number</Label>
                  <Input
                    value={orgData.tin}
                    onChange={(e) => setOrgData(prev => ({ ...prev, tin: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Wallet Currency ID</Label>
                  <Input
                    type="number"
                    value={orgData.wallet_currency}
                    onChange={(e) => setOrgData(prev => ({ ...prev, wallet_currency: parseInt(e.target.value) }))}
                  />
                </div>
                <div>
                  <Label>Wallet PIN</Label>
                  <Input
                    value={orgData.wallet_pin}
                    onChange={(e) => setOrgData(prev => ({ ...prev, wallet_pin: e.target.value }))}
                  />
                </div>
              </div>
              <Button 
                onClick={() => testEndpoint('Create Organization', () => organizationService.createOrganization(orgData))}
                disabled={loading === 'Create Organization'}
                className="w-full"
              >
                {loading === 'Create Organization' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Organization
              </Button>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-6">
            <Button 
              onClick={() => testEndpoint('List Organizations', () => organizationService.listOrganizations())}
              disabled={loading === 'List Organizations'}
              variant="outline"
            >
              {loading === 'List Organizations' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              List Organizations
            </Button>
            <Button 
              onClick={() => testEndpoint('List Wallets', () => organizationService.listWallets())}
              disabled={loading === 'List Wallets'}
              variant="outline"
            >
              {loading === 'List Wallets' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              List Wallets
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          {/* Authentication Warning */}
          <Alert className="border-amber-500 bg-amber-50">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800">
              <strong>Authentication Required:</strong> You must login first (Authentication tab) before creating sub admins or staff members. These endpoints require valid authentication tokens.
            </AlertDescription>
          </Alert>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* Create Sub Admin Test */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Create Sub Admin
                </CardTitle>
                <CardDescription>Test POST /sub_admin/</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>First Name</Label>
                    <Input
                      value={subAdminData.first_name}
                      onChange={(e) => setSubAdminData(prev => ({ ...prev, first_name: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label>Last Name</Label>
                    <Input
                      value={subAdminData.last_name}
                      onChange={(e) => setSubAdminData(prev => ({ ...prev, last_name: e.target.value }))}
                    />
                  </div>
                </div>
                <div>
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={subAdminData.email}
                    onChange={(e) => setSubAdminData(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Phone Number</Label>
                    <Input
                      value={subAdminData.phone_number}
                      onChange={(e) => setSubAdminData(prev => ({ ...prev, phone_number: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label>Username</Label>
                    <Input
                      value={subAdminData.username}
                      onChange={(e) => setSubAdminData(prev => ({ ...prev, username: e.target.value }))}
                    />
                  </div>
                </div>
                <div>
                  <Label>Password</Label>
                  <Input
                    type="password"
                    value={subAdminData.password}
                    onChange={(e) => setSubAdminData(prev => ({ ...prev, password: e.target.value }))}
                  />
                </div>
                <Button 
                  onClick={() => testEndpoint('Create Sub Admin', () => userService.createSubAdmin(subAdminData))}
                  disabled={loading === 'Create Sub Admin'}
                  className="w-full"
                >
                  {loading === 'Create Sub Admin' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Sub Admin
                </Button>
              </CardContent>
            </Card>

            {/* Create Staff Test */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Add Organization Staff
                </CardTitle>
                <CardDescription>Test POST /organizations/add_staff/</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>First Name</Label>
                    <Input
                      value={staffData.first_name}
                      onChange={(e) => setStaffData(prev => ({ ...prev, first_name: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label>Last Name</Label>
                    <Input
                      value={staffData.last_name}
                      onChange={(e) => setStaffData(prev => ({ ...prev, last_name: e.target.value }))}
                    />
                  </div>
                </div>
                <div>
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={staffData.email}
                    onChange={(e) => setStaffData(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Phone Number</Label>
                    <Input
                      value={staffData.phone_number}
                      onChange={(e) => setStaffData(prev => ({ ...prev, phone_number: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label>Username</Label>
                    <Input
                      value={staffData.username}
                      onChange={(e) => setStaffData(prev => ({ ...prev, username: e.target.value }))}
                    />
                  </div>
                </div>
                <div>
                  <Label>Password</Label>
                  <Input
                    type="password"
                    value={staffData.password}
                    onChange={(e) => setStaffData(prev => ({ ...prev, password: e.target.value }))}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Organization</Label>
                    <Select 
                      value={staffData.organization} 
                      onValueChange={(value) => setStaffData(prev => ({ ...prev, organization: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select organization" />
                      </SelectTrigger>
                      <SelectContent>
                        {organizations.map(org => (
                          <SelectItem key={org.id} value={org.id}>{org.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-2 w-full"
                      onClick={() => testEndpoint('Load Organizations', async () => {
                        const orgs = await organizationService.listOrganizations();
                        setOrganizations(orgs.map(org => ({ id: org.id, name: org.name })));
                        return orgs;
                      })}
                    >
                      Load Organizations
                    </Button>
                  </div>
                  <div>
                    <Label>Role</Label>
                    <Select 
                      value={staffData.role} 
                      onValueChange={(value) => setStaffData(prev => ({ ...prev, role: value as any }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="member">Member</SelectItem>
                        <SelectItem value="manager">Manager</SelectItem>
                        <SelectItem value="owner">Owner</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button 
                  onClick={() => testEndpoint('Add Staff', () => organizationService.addStaff(staffData))}
                  disabled={loading === 'Add Staff'}
                  className="w-full"
                >
                  {loading === 'Add Staff' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Add Staff Member
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Button 
              onClick={() => testEndpoint('List Users', () => userService.listUsers())}
              disabled={loading === 'List Users'}
              variant="outline"
            >
              {loading === 'List Users' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              List Users
            </Button>
            <Button 
              onClick={() => testEndpoint('List Sub Admins', () => userService.listSubAdmins())}
              disabled={loading === 'List Sub Admins'}
              variant="outline"
            >
              {loading === 'List Sub Admins' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              List Sub Admins
            </Button>
            <Button 
              onClick={() => testEndpoint('List Staff', () => organizationService.listStaff())}
              disabled={loading === 'List Staff'}
              variant="outline"
            >
              {loading === 'List Staff' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              List Staff
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="results" className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Test Results</h3>
            {Object.keys(results).length === 0 ? (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  No tests run yet. Switch to other tabs to run API tests.
                </AlertDescription>
              </Alert>
            ) : (
              Object.entries(results).map(([name, result]) => (
                <ResultCard key={name} name={name} result={result} />
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AuthTest;
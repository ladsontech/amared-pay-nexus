import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const AdminTest = () => {
  const { user, isAuthenticated, isRole } = useAuth();
  const navigate = useNavigate();

  const handleAdminLogin = () => {
    // Simulate admin login
    const adminUser = {
      id: 'admin-1',
      name: 'System Administrator',
      email: 'admin@almaredpay.com',
      role: 'admin',
      organizationId: 'system',
      organization: {
        id: 'system',
        name: 'Almared Pay System',
        description: 'System Administration',
        industry: 'Financial Technology'
      },
      position: 'System Administrator',
      department: 'System Administration',
      permissions: [
        'system_admin',
        'manage_organizations',
        'manage_system_users',
        'view_system_analytics',
        'approve_transactions',
        'approve_funding',
        'approve_bulk_payments',
        'approve_bank_deposits',
        'view_department_reports',
        'manage_team',
        'submit_transactions',
        'request_funding',
        'view_own_history',
        'access_petty_cash',
        'access_bulk_payments',
        'access_collections',
        'access_bank_deposits'
      ]
    };

    localStorage.setItem('user', JSON.stringify(adminUser));
    window.location.reload(); // Reload to update auth context
  };

  const goToAdminDashboard = () => {
    navigate('/system/analytics');
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Admin Access Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">Current Auth Status:</h3>
              <p>Authenticated: {isAuthenticated ? 'Yes' : 'No'}</p>
              <p>User: {user?.name || 'None'}</p>
              <p>Role: {user?.role || 'None'}</p>
              <p>Is Admin: {isRole('admin') ? 'Yes' : 'No'}</p>
            </div>

            <div className="space-y-2">
              <Button onClick={handleAdminLogin} className="w-full">
                Login as Admin (Test)
              </Button>
              <Button onClick={goToAdminDashboard} variant="outline" className="w-full">
                Go to Admin Dashboard
              </Button>
              <Button onClick={() => navigate('/')} variant="secondary" className="w-full">
                Back to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminTest;

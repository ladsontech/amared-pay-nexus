import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthState, Permission, rolePermissions, UserRole } from '@/types/auth';
import { authService } from '@/services/authService';
import { userService } from '@/services/userService';
import { setLogoutCallback } from '@/utils/apiHelper';
interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; message: string }>;
  refreshToken: () => Promise<{ access: string; refresh: string }>;
  verifyToken: (token: string) => Promise<boolean>;
  hasPermission: (permission: Permission) => boolean;
  hasAnyPermission: (permissions: Permission[]) => boolean;
  isRole: (role: string) => boolean;
  impersonateOrganization: (organizationId: string, organizationName: string) => Promise<void>;
  stopImpersonating: () => void;
  isImpersonating: boolean;
  loginAsUser: (userId: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    loading: true,
  });
  const [originalAdmin, setOriginalAdmin] = useState<User | null>(null);
  const [isImpersonating, setIsImpersonating] = useState<boolean>(
    localStorage.getItem('impersonating') === 'true'
  );

  const logout = async () => {
    // If impersonating, return to admin dashboard
    if (originalAdmin || localStorage.getItem('impersonating') === 'true') {
      stopImpersonating();
      return;
    }
    await authService.logout();
    setAuthState({
      user: null,
      isAuthenticated: false,
      loading: false,
    });
  };

  useEffect(() => {
    // Register logout callback for automatic token expiration handling
    setLogoutCallback(async () => {
      await logout();
    });

    // Load user from localStorage
    const storedUser = localStorage.getItem('user');
    const isImpersonating = localStorage.getItem('impersonating') === 'true';
    
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        
        // Ensure user has permissions array - if missing, set default based on role
        if (!user.permissions || !Array.isArray(user.permissions)) {
          console.warn('User permissions missing or invalid, setting default permissions');
          user.permissions = user.role && rolePermissions[user.role as UserRole] 
            ? rolePermissions[user.role as UserRole] 
            : rolePermissions.staff;
        }
        
        // Ensure organizationId is set when impersonating
        if (isImpersonating && !user.organizationId) {
          console.error('Impersonation state found but organizationId missing');
          // Clear invalid impersonation state
          localStorage.removeItem('impersonating');
          localStorage.removeItem('original_admin');
        } else {
          setAuthState({
            user,
            isAuthenticated: true,
            loading: false,
          });
          
          // If impersonating, restore the original admin state
          if (isImpersonating && user.organizationId) {
            setIsImpersonating(true);
            const storedAdmin = localStorage.getItem('original_admin');
            if (storedAdmin) {
              try {
                const adminUser = JSON.parse(storedAdmin);
                setOriginalAdmin(adminUser);
              } catch (e) {
                console.error('Failed to parse original admin:', e);
              }
            }
          } else if (isImpersonating) {
            // Clear invalid impersonation state
            setIsImpersonating(false);
            localStorage.removeItem('impersonating');
            localStorage.removeItem('original_admin');
          }
        }
      } catch (error) {
        console.error('Error loading user from localStorage:', error);
        // Invalid JSON, clear localStorage
        localStorage.removeItem('user');
        localStorage.removeItem('impersonating');
        localStorage.removeItem('original_admin');
        setAuthState(prev => ({ ...prev, loading: false }));
        setIsImpersonating(false);
      }
    } else {
      setAuthState(prev => ({ ...prev, loading: false }));
      setIsImpersonating(false);
    }
  }, []);

  const login = async (identity: string, password: string) => {
    try {
      const isEmail = identity.includes('@');
      const response = await authService.login({ 
        email: isEmail ? identity : '', 
        username: isEmail ? undefined : identity,
        password 
      });

      // Get base user from login response, then fetch full profile to get is_superuser/is_staff
      const baseUser = (response as any).user || {};
      let profile: any = baseUser;
      if (baseUser?.id) {
        try {
          profile = await userService.getUser(baseUser.id);
        } catch (e) {
          console.warn('Failed to fetch full user profile; using base user from login response', e);
        }
      }

      // Determine superuser/admin
      const isSuperuser = profile?.is_superuser === true;

      // For non-superusers, fetch their organization and staff details
      let organizationId = 'default-org';
      let organizationName = 'Default Organization';
      let staffRole: 'owner' | 'manager' | 'member' = 'member';
      
      if (!isSuperuser) {
        try {
          // Import organizationService dynamically to avoid circular dependency
          const { organizationService } = await import('@/services/organizationService');
          
          // Fetch staff list for this user - try with username if id doesn't work
          console.log('Fetching staff data for user:', baseUser);
          let staffResponse = await organizationService.getStaffList({ user: baseUser.id });
          
          // If no results with ID, try with username
          if (!staffResponse.results || staffResponse.results.length === 0) {
            console.log('No staff found by ID, trying username:', profile?.username);
            staffResponse = await organizationService.getStaffList();
            // Filter by username manually
            const matchingStaff = staffResponse.results.find(
              (s: any) => s.user.username === profile?.username || s.user.id === baseUser.id
            );
            if (matchingStaff) {
              staffResponse.results = [matchingStaff];
            }
          }
          
          console.log('Staff response:', staffResponse);
          
          if (staffResponse.results && staffResponse.results.length > 0) {
            const staffRecord = staffResponse.results[0];
            organizationId = staffRecord.organization.id;
            organizationName = staffRecord.organization.name;
            staffRole = staffRecord.role || 'member';
            console.log('User belongs to organization:', organizationName, 'with role:', staffRole);
          } else {
            console.warn('No organization found for user, using default demo org');
          }
        } catch (e) {
          console.error('Failed to fetch user organization data:', e);
        }
      }

      // Determine role
      let userRole: import('@/types/auth').UserRole = 'staff';
      if (isSuperuser) {
        userRole = 'admin';
      } else if (staffRole === 'owner' || staffRole === 'manager') {
        userRole = staffRole;
      } else {
        userRole = 'staff';
      }

      // Names
      const username = profile?.username || baseUser?.username || '';
      const nameParts = username.split('.');
      const firstName = profile?.first_name || nameParts[0] || username || '';
      const lastName = profile?.last_name || nameParts[1] || '';

      const user: User = {
        id: profile?.id || baseUser?.id || 'unknown',
        name: `${firstName} ${lastName}`.trim() || username || 'Unknown User',
        email: profile?.email || baseUser?.email || (isEmail ? identity : ''),
        role: userRole,
        organizationId,
        organization: {
          id: organizationId,
          name: organizationName,
          description: organizationName,
          industry: 'Finance'
        },
        permissions: isSuperuser
          ? (['system_admin', ...rolePermissions.admin] as Permission[])
          : rolePermissions[userRole],
        position: isSuperuser ? 'System Administrator' : (staffRole || 'Staff Member'),
        firstName: firstName,
        lastName: lastName,
        phoneNumber: profile?.phone_number || baseUser?.phone_number,
        avatar: profile?.avatar || baseUser?.avatar,
        isEmailVerified: profile?.is_email_verified ?? baseUser?.is_email_verified,
        isPhoneVerified: profile?.is_phone_verified ?? baseUser?.is_phone_verified,
        isSuperuser: isSuperuser,
        isStaff: profile?.is_staff ?? baseUser?.is_staff,
      };

      console.log('User logged in:', { 
        id: user.id, 
        name: user.name, 
        email: user.email, 
        role: user.role, 
        isSuperuser,
        organizationId: user.organizationId,
        organizationName: user.organization.name
      });

      localStorage.setItem('user', JSON.stringify(user));
      setAuthState({
        user,
        isAuthenticated: true,
        loading: false,
      });
    } catch (error) {
      console.error('Login error:', error);
      throw new Error('Invalid credentials');
    }
  };

  const stopImpersonating = () => {
    const storedAdmin = localStorage.getItem('original_admin');
    if (storedAdmin) {
      try {
        const adminUser = JSON.parse(storedAdmin);
        localStorage.setItem('user', JSON.stringify(adminUser));
        setAuthState({
          user: adminUser,
          isAuthenticated: true,
          loading: false,
        });
      } catch (e) {
        console.error('Failed to restore admin user:', e);
      }
    }
    
    localStorage.removeItem('impersonating');
    localStorage.removeItem('original_admin');
    setIsImpersonating(false);
    setOriginalAdmin(null);
  };

  const impersonateOrganization = async (organizationId: string, organizationName: string): Promise<void> => {
    const currentUser = authState.user;
    if (!currentUser) {
      throw new Error('No user is currently logged in');
    }
    
    // Check if user is super admin or has admin role
    const isAdmin = currentUser.role === 'admin' || currentUser.isSuperuser === true;
    if (!isAdmin) {
      throw new Error('Only super admins can impersonate organizations');
    }

    // Validate organization ID
    if (!organizationId || organizationId.trim() === '') {
      throw new Error('Invalid organization ID');
    }

    // Validate organization name
    if (!organizationName || organizationName.trim() === '') {
      throw new Error('Invalid organization name');
    }

    try {
      // Store original admin info
      if (!originalAdmin) {
        setOriginalAdmin(currentUser);
      }

      // Try to fetch the actual organization owner's staff record
      let ownerStaff: any = null;
      try {
        const { organizationService } = await import('@/services/organizationService');
        const staffResponse = await organizationService.getStaffList({ 
          organization: organizationId.trim(),
          role: 'owner'
        });
        
        if (staffResponse.results && staffResponse.results.length > 0) {
          ownerStaff = staffResponse.results[0];
          console.log('Found organization owner:', ownerStaff);
        }
      } catch (e) {
        console.warn('Could not fetch organization owner, using admin user info:', e);
      }

      // Create impersonated user with owner permissions
      // Use actual owner's info if available, otherwise use admin's info
      const ownerUser = ownerStaff?.user || {};
      
      // CRITICAL: Superusers retain their admin permissions even when impersonating
      // This allows them to bypass all access restrictions
      const impersonatedUser: User = {
        id: ownerUser.id || currentUser.id,
        name: ownerUser.first_name && ownerUser.last_name 
          ? `${ownerUser.first_name} ${ownerUser.last_name}`.trim()
          : ownerUser.username || currentUser.name || `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim() || currentUser.email || 'User',
        email: ownerUser.email || currentUser.email,
        role: 'owner',
        organizationId: organizationId.trim(),
        organization: {
          id: organizationId.trim(),
          name: organizationName.trim(),
          description: organizationName.trim(),
          industry: 'Finance'
        },
        // Give all permissions including admin permissions
        permissions: [...new Set([...rolePermissions.owner, ...rolePermissions.admin, 'system_admin'])] as Permission[],
        position: 'Organization Owner',
        firstName: ownerUser.first_name || currentUser.firstName,
        lastName: ownerUser.last_name || currentUser.lastName,
        phoneNumber: ownerUser.phone_number || currentUser.phoneNumber,
        avatar: ownerUser.avatar || currentUser.avatar,
        isEmailVerified: ownerUser.is_email_verified ?? currentUser.isEmailVerified,
        isPhoneVerified: ownerUser.is_phone_verified ?? currentUser.isPhoneVerified,
        isSuperuser: true, // Keep superuser status for internal access checks
        isStaff: true, // Ensure staff status for API access
        department: currentUser.department,
      };

      // Validate impersonated user has all required fields
      if (!impersonatedUser.id || !impersonatedUser.organizationId) {
        throw new Error('Invalid impersonated user data: missing id or organizationId');
      }

      // Store in localStorage first - ensure it's synchronous
      try {
        localStorage.setItem('user', JSON.stringify(impersonatedUser));
        localStorage.setItem('impersonating', 'true');
        localStorage.setItem('original_admin', JSON.stringify(currentUser));
        
        // Verify localStorage was set
        const verifyUser = localStorage.getItem('user');
        const verifyImpersonating = localStorage.getItem('impersonating');
        
        if (!verifyUser || verifyImpersonating !== 'true') {
          throw new Error('Failed to persist impersonation state to localStorage');
        }

        console.log('Impersonation state persisted:', {
          userId: impersonatedUser.id,
          orgId: impersonatedUser.organizationId,
          orgName: impersonatedUser.organization.name,
        });
        
        // Update state
        setIsImpersonating(true);
        setAuthState({
          user: impersonatedUser,
          isAuthenticated: true,
          loading: false,
        });
      } catch (storageError) {
        console.error('localStorage error during impersonation:', storageError);
        throw new Error(`Failed to save impersonation state: ${storageError instanceof Error ? storageError.message : 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error setting impersonation state:', error);
      throw new Error(`Failed to set impersonation state: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    const response = await authService.changePassword({ 
      current_password: currentPassword, 
      new_password: newPassword 
    });
    return response;
  };

  const refreshToken = async () => {
    const tokens = await authService.refreshToken();
    return tokens;
  };

  const verifyToken = async (token: string) => {
    const isValid = await authService.verifyToken(token);
    return isValid;
  };

  const hasPermission = (permission: Permission): boolean => {
    // Superusers always have all permissions
    if (authState.user?.isSuperuser === true) {
      return true;
    }
    return authState.user?.permissions?.includes(permission) || false;
  };

  const hasAnyPermission = (permissions: Permission[]): boolean => {
    // Superusers always have all permissions
    if (authState.user?.isSuperuser === true) {
      return true;
    }
    return permissions.some(permission => hasPermission(permission));
  };

  const isRole = (role: string): boolean => {
    return authState.user?.role === role;
  };

  const loginAsUser = (userId: string) => {
    // Demo login function for testing
    console.log('Demo login as user:', userId);
  };

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login,
        logout,
        changePassword,
        refreshToken,
        verifyToken,
        hasPermission,
        hasAnyPermission,
        isRole,
        impersonateOrganization,
        stopImpersonating,
        isImpersonating,
        loginAsUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

const TestAuth: React.FC = () => {
  const { login, logout, changePassword, refreshToken, verifyToken } = useAuth();

  useEffect(() => {
    const testAuth = async () => {
      try {
        // Test login
        await login('user@example.com', 'password');
        console.log('Login successful');

        // Test change password
        const changeResponse = await changePassword('currentPassword', 'newPassword');
        console.log(changeResponse.message);

        // Test refresh token
        const tokens = await refreshToken();
        console.log('Tokens refreshed:', tokens);

        // Test verify token
        const isValid = await verifyToken(tokens.access);
        console.log('Token valid:', isValid);
      } catch (error) {
        console.error('Error during authentication tests:', error);
      } finally {
        // Test logout
        await logout();
        console.log('Logged out');
      }
    };

    testAuth();
  }, [login, logout, changePassword, refreshToken, verifyToken]);

  return <div>Testing Authentication...</div>;
};

export default TestAuth;

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Shield, 
  Clock, 
  Users, 
  Lock, 
  AlertCircle, 
  CheckCircle, 
  Timer,
  LogOut,
  DollarSign,
  TrendingUp
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const OrgSecurityDemo = () => {
  const { logout, user } = useAuth();
  const { toast } = useToast();
  const [sessionTimeLeft, setSessionTimeLeft] = useState(15 * 60); // 15 minutes in seconds
  const [isActive, setIsActive] = useState(true);

  // Demo spending limits data
  const spendingLimits = {
    staff: { daily: 100000, monthly: 2000000 },
    manager: { daily: 500000, monthly: 10000000 },
    admin: { daily: 2000000, monthly: 50000000 }
  };

  const currentSpending = {
    daily: 75000,
    monthly: 1250000
  };

  // Simulate session countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setSessionTimeLeft(prev => {
        if (prev <= 1) {
          toast({
            title: "Session Expired",
            description: "You have been logged out for security.",
            variant: "destructive"
          });
          logout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [logout, toast]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getSessionProgress = () => {
    return ((15 * 60 - sessionTimeLeft) / (15 * 60)) * 100;
  };

  const handleManualLogout = () => {
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
    logout();
  };

  const resetSession = () => {
    setSessionTimeLeft(15 * 60);
    toast({
      title: "Session Extended",
      description: "Your session has been extended by 15 minutes.",
    });
  };

  const getUserLimits = () => {
    const role = user?.role || 'staff';
    return spendingLimits[role as keyof typeof spendingLimits] || spendingLimits.staff;
  };

  const getDailyUsagePercent = () => {
    const limits = getUserLimits();
    return (currentSpending.daily / limits.daily) * 100;
  };

  const getMonthlyUsagePercent = () => {
    const limits = getUserLimits();
    return (currentSpending.monthly / limits.monthly) * 100;
  };

  const securityFeatures = [
    {
      title: "Auto-Logout Timer",
      description: "Automatic logout after 15 minutes of inactivity",
      status: "active",
      icon: Timer
    },
    {
      title: "Spending Limits",
      description: "Role-based daily and monthly spending controls",
      status: "active",
      icon: DollarSign
    },
    {
      title: "Approval Workflows", 
      description: "All sensitive operations require manager approval",
      status: "active",
      icon: CheckCircle
    },
    {
      title: "Session Management",
      description: "Secure token-based authentication with refresh",
      status: "active",
      icon: Lock
    }
  ];

  const recentSecurityEvents = [
    {
      time: "2 minutes ago",
      event: "Login attempt detected",
      status: "success",
      detail: `User ${user?.email} logged in successfully`
    },
    {
      time: "15 minutes ago", 
      event: "Spending limit check",
      status: "warning",
      detail: "Daily spending at 75% of limit"
    },
    {
      time: "1 hour ago",
      event: "Approval request",
      status: "info", 
      detail: "Bank transfer request sent for approval"
    },
    {
      time: "2 hours ago",
      event: "Session extended",
      status: "info",
      detail: "User activity detected, session renewed"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">Security & Controls Demo</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Enhanced security features and financial controls
          </p>
        </div>
        <Button onClick={handleManualLogout} variant="outline" className="flex items-center gap-2">
          <LogOut className="h-4 w-4" />
          Manual Logout
        </Button>
      </div>

      {/* Session Status */}
      <Card className="border-orange-200 bg-orange-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-orange-600" />
            Active Session Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Time Remaining</div>
              <div className="text-2xl font-bold text-orange-600">{formatTime(sessionTimeLeft)}</div>
            </div>
            <div className="text-right">
              <Button onClick={resetSession} size="sm">
                Extend Session
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Session Progress</span>
              <span>{getSessionProgress().toFixed(1)}%</span>
            </div>
            <Progress value={getSessionProgress()} className="h-2" />
          </div>
          <div className="text-sm text-muted-foreground">
            Your session will automatically expire when the timer reaches zero. 
            Any activity will reset the timer.
          </div>
        </CardContent>
      </Card>

      {/* Spending Limits */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Spending Limits & Usage
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Daily Limit</span>
                  <span className="text-sm">
                    UGX {currentSpending.daily.toLocaleString()} / {getUserLimits().daily.toLocaleString()}
                  </span>
                </div>
                <Progress value={getDailyUsagePercent()} className="h-2" />
                <div className="text-xs text-muted-foreground mt-1">
                  {getDailyUsagePercent().toFixed(1)}% used
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Monthly Limit</span>
                  <span className="text-sm">
                    UGX {currentSpending.monthly.toLocaleString()} / {getUserLimits().monthly.toLocaleString()}
                  </span>
                </div>
                <Progress value={getMonthlyUsagePercent()} className="h-2" />
                <div className="text-xs text-muted-foreground mt-1">
                  {getMonthlyUsagePercent().toFixed(1)}% used
                </div>
              </div>
            </div>

            <div className="bg-muted/50 p-3 rounded-lg">
              <div className="text-sm font-medium mb-1">Your Role: {user?.role?.toUpperCase()}</div>
              <div className="text-xs text-muted-foreground">
                Spending limits are automatically enforced based on your user role. 
                Transactions exceeding limits require manager approval.
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security Features
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {securityFeatures.map((feature, index) => {
                const IconComponent = feature.icon;
                return (
                  <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <IconComponent className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-sm">{feature.title}</div>
                      <div className="text-xs text-muted-foreground">{feature.description}</div>
                    </div>
                    <Badge variant="secondary" className="text-green-700">
                      Active
                    </Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Security Events */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Recent Security Events
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentSecurityEvents.map((event, index) => (
              <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                <div className={`p-2 rounded-lg ${
                  event.status === 'success' ? 'bg-green-100' :
                  event.status === 'warning' ? 'bg-yellow-100' :
                  'bg-blue-100'
                }`}>
                  {event.status === 'success' ? (
                    <CheckCircle className={`h-4 w-4 ${
                      event.status === 'success' ? 'text-green-600' :
                      event.status === 'warning' ? 'text-yellow-600' :
                      'text-blue-600'
                    }`} />
                  ) : event.status === 'warning' ? (
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                  ) : (
                    <TrendingUp className="h-4 w-4 text-blue-600" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-sm">{event.event}</div>
                  <div className="text-xs text-muted-foreground">{event.detail}</div>
                </div>
                <div className="text-xs text-muted-foreground">{event.time}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Additional Security Info */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-blue-800">Enhanced Security Features (Demo)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium text-blue-800 mb-2">Implemented Features</h4>
              <ul className="space-y-1 text-blue-700">
                <li>• 15-minute auto-logout timer</li>
                <li>• Role-based spending limits</li>
                <li>• Mandatory approval workflows</li>
                <li>• Real-time session monitoring</li>
                <li>• Activity-based session renewal</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-blue-800 mb-2">Future Enhancements</h4>
              <ul className="space-y-1 text-blue-700">
                <li>• Multi-factor authentication</li>
                <li>• IP address monitoring</li>
                <li>• Device fingerprinting</li>
                <li>• Advanced audit logging</li>
                <li>• Suspicious activity detection</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrgSecurityDemo;
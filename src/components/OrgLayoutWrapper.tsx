
import { ReactNode } from "react";
import { Wallet, Coins } from "lucide-react";

interface OrgLayoutWrapperProps {
  children: ReactNode;
  currentBalance?: number;
  pettyCashBalance?: number;
}

const OrgLayoutWrapper = ({ 
  children, 
  currentBalance = 1250000, 
  pettyCashBalance = 150000 
}: OrgLayoutWrapperProps) => {
  return (
    <div className="space-y-4">
      {/* Balance Bar - Always shown on organization pages */}
      <div className="bg-muted/30 p-3 rounded-lg border">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <Wallet className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-xs text-muted-foreground">Organization Balance</p>
                <p className="text-sm font-bold text-green-600">UGX {currentBalance.toLocaleString()}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Coins className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-xs text-muted-foreground">Petty Cash Balance</p>
                <p className="text-sm font-bold text-blue-600">UGX {pettyCashBalance.toLocaleString()}</p>
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Tech Solutions Ltd</p>
            <p className="text-xs text-muted-foreground">ORG001</p>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      {children}
    </div>
  );
};

export default OrgLayoutWrapper;

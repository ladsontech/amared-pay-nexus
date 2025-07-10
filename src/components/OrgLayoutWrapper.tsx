
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
      {/* Balance Bar - Mobile Responsive */}
      <div className="bg-muted/30 p-3 sm:p-4 rounded-lg border">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
            <div className="flex items-center space-x-2">
              <Wallet className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-xs text-muted-foreground">Organization Balance</p>
                <p className="text-sm sm:text-base font-bold text-green-600">UGX {currentBalance.toLocaleString()}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Coins className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-xs text-muted-foreground">Petty Cash Balance</p>
                <p className="text-sm sm:text-base font-bold text-blue-600">UGX {pettyCashBalance.toLocaleString()}</p>
              </div>
            </div>
          </div>
          <div className="text-left sm:text-right">
            <p className="text-xs text-muted-foreground font-medium">Tech Solutions Ltd</p>
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

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import BulkPaymentsReport from "@/components/reports/BulkPaymentsReport";

const OrgBulkPaymentsReport = () => {
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">Bulk Payments Report</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Detailed bulk payments analytics and exports
          </p>
        </div>
        <Button asChild variant="outline">
          <Link to="/org/bulk-payments" className="flex items-center space-x-2">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Bulk Payments</span>
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Report</CardTitle>
          <CardDescription>Filter, analyze, and export bulk payment data</CardDescription>
        </CardHeader>
        <CardContent>
          <BulkPaymentsReport />
        </CardContent>
      </Card>
    </div>
  );
};

export default OrgBulkPaymentsReport;


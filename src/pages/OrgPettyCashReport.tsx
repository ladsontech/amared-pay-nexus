import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import PettyCashReport from "@/components/reports/PettyCashReport";

const OrgPettyCashReport = () => {
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">Petty Cash Report</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Detailed petty cash transactions, trends, and exports
          </p>
        </div>
        <Button asChild variant="outline">
          <Link to="/org/petty-cash" className="flex items-center space-x-2">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Petty Cash</span>
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Report</CardTitle>
          <CardDescription>Filter, analyze, and export petty cash data</CardDescription>
        </CardHeader>
        <CardContent>
          <PettyCashReport />
        </CardContent>
      </Card>
    </div>
  );
};

export default OrgPettyCashReport;


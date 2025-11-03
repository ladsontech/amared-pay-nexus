import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import CollectionsReport from "@/components/reports/CollectionsReport";

const OrgCollectionsReport = () => {
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">Collections Report</h1>
          <p className="text-xs sm:text-sm md:text-base text-muted-foreground">
            Detailed collections analytics and exports
          </p>
        </div>
        <Button asChild variant="outline" className="w-full sm:w-auto text-xs sm:text-sm">
          <Link to="/org/collections" className="flex items-center justify-center space-x-2">
            <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Back to Collections</span>
            <span className="sm:hidden">Back</span>
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base sm:text-lg">Report</CardTitle>
          <CardDescription className="text-xs sm:text-sm">Filter, analyze, and export collections data</CardDescription>
        </CardHeader>
        <CardContent className="p-3 sm:p-6">
          <CollectionsReport />
        </CardContent>
      </Card>
    </div>
  );
};

export default OrgCollectionsReport;


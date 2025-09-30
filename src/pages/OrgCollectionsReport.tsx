import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import CollectionsReport from "@/components/reports/CollectionsReport";

const OrgCollectionsReport = () => {
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">Collections Report</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Detailed collections analytics and exports
          </p>
        </div>
        <Button asChild variant="outline">
          <Link to="/org/collections" className="flex items-center space-x-2">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Collections</span>
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Report</CardTitle>
          <CardDescription>Filter, analyze, and export collections data</CardDescription>
        </CardHeader>
        <CardContent>
          <CollectionsReport />
        </CardContent>
      </Card>
    </div>
  );
};

export default OrgCollectionsReport;



import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Plus, Search, Filter, Download, Smartphone } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { useToast } from "@/hooks/use-toast";

interface Collection {
  id: string;
  amount: number;
  phoneNumber: string;
  status: "pending" | "successful" | "failed";
  method: "mobile_money" | "bank_transfer";
  createdAt: string;
  reference: string;
}

const Collections = () => {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Simulate fetching collections from /payments/collections/
    const fetchCollections = async () => {
      try {
        setIsLoading(true);
        setTimeout(() => {
          setCollections([
            {
              id: "COL001",
              amount: 5000,
              phoneNumber: "+256701234567",
              status: "successful",
              method: "mobile_money",
              createdAt: "2024-01-15T10:30:00Z",
              reference: "REF001",
            },
            {
              id: "COL002",
              amount: 2500,
              phoneNumber: "+256789012345",
              status: "pending",
              method: "mobile_money",
              createdAt: "2024-01-14T14:20:00Z",
              reference: "REF002",
            },
            {
              id: "COL003",
              amount: 7500,
              phoneNumber: "+256712345678",
              status: "failed",
              method: "mobile_money",
              createdAt: "2024-01-13T09:15:00Z",
              reference: "REF003",
            },
          ]);
          setIsLoading(false);
        }, 1000);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load collections",
          variant: "destructive",
        });
        setIsLoading(false);
      }
    };

    fetchCollections();
  }, [toast]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "successful":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filteredCollections = collections.filter(
    (collection) =>
      collection.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      collection.phoneNumber.includes(searchTerm) ||
      collection.reference.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleInitiateCollection = () => {
    toast({
      title: "Collection Initiated",
      description: "Mobile money collection has been initiated successfully.",
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Collections</h1>
            <p className="text-muted-foreground">
              Manage mobile money collections and payments
            </p>
          </div>
          <Button className="flex items-center space-x-2" onClick={handleInitiateCollection}>
            <Plus className="h-4 w-4" />
            <span>Initiate Collection</span>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Total Collections</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{collections.length}</div>
              <p className="text-sm text-muted-foreground">All time</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Successful</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {collections.filter(c => c.status === "successful").length}
              </div>
              <p className="text-sm text-muted-foreground">Completed collections</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Total Amount</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${collections.reduce((sum, c) => sum + c.amount, 0).toLocaleString()}
              </div>
              <p className="text-sm text-muted-foreground">Total collected</p>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search collections..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-muted rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-muted rounded w-1/4"></div>
                      <div className="h-3 bg-muted rounded w-1/2"></div>
                    </div>
                    <div className="h-6 bg-muted rounded w-20"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredCollections.map((collection) => (
              <Card key={collection.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                        <Smartphone className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-semibold">{collection.id}</h3>
                          <Badge className={getStatusColor(collection.status)}>
                            {collection.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {collection.phoneNumber} • {collection.reference}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(collection.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold">
                        ${collection.amount.toLocaleString()}
                      </div>
                      <div className="text-sm text-muted-foreground capitalize">
                        {collection.method.replace("_", " ")}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {filteredCollections.length === 0 && !isLoading && (
          <Card>
            <CardContent className="text-center py-12">
              <div className="text-muted-foreground">
                <Smartphone className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">No collections found</h3>
                <p>Start collecting payments to see them here.</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Collections;

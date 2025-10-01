import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, TrendingUp, Loader2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface AIInsightsProps {
  transactions: Array<{
    id: string;
    amount: number;
    description: string;
    date: string;
    type?: string;
  }>;
}

export const AIInsights = ({ transactions }: AIInsightsProps) => {
  const [insights, setInsights] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const generateInsights = async (type: "insights" | "categorize" | "forecast") => {
    if (!supabase) {
      toast({
        title: "Configuration Required",
        description: "AI features are being set up. Please refresh the page in a moment.",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-insights', {
        body: { transactions, type }
      });

      if (error) throw error;

      if (data?.insights) {
        setInsights(data.insights);
        toast({
          title: "AI Analysis Complete",
          description: "Your financial insights are ready",
        });
      }
    } catch (error: any) {
      console.error('AI insights error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate insights",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-blue-50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            <CardTitle>AI Financial Insights</CardTitle>
          </div>
          <Badge variant="secondary" className="bg-purple-100 text-purple-700">
            Free Gemini AI
          </Badge>
        </div>
        <CardDescription>
          Get smart insights powered by Lovable AI's free Gemini models
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => generateInsights("insights")}
            disabled={loading}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <TrendingUp className="h-4 w-4 mr-2" />
            )}
            Analyze Spending
          </Button>
          <Button
            onClick={() => generateInsights("categorize")}
            disabled={loading}
            variant="outline"
          >
            Categorize Transactions
          </Button>
          <Button
            onClick={() => generateInsights("forecast")}
            disabled={loading}
            variant="outline"
          >
            Forecast Spending
          </Button>
        </div>

        {insights && (
          <div className="mt-4 p-4 bg-white rounded-lg border border-purple-200">
            <div className="flex items-start gap-2">
              <Sparkles className="h-5 w-5 text-purple-600 mt-1 flex-shrink-0" />
              <div className="flex-1 whitespace-pre-wrap text-sm">{insights}</div>
            </div>
          </div>
        )}

        {!insights && !loading && (
          <div className="text-center py-8 text-muted-foreground">
            <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Click a button above to get AI-powered insights</p>
            <p className="text-xs mt-1">All Gemini models are FREE until Oct 6, 2025</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
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
export const AIInsights = ({
  transactions
}: AIInsightsProps) => {
  const [insights, setInsights] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const {
    toast
  } = useToast();
  const generateInsights = async (type: "insights" | "categorize" | "forecast") => {
    if (!supabase) {
      toast({
        title: "Configuration Required",
        description: "AI features are being set up. Please refresh the page in a moment.",
        variant: "destructive"
      });
      return;
    }
    setLoading(true);
    try {
      const {
        data,
        error
      } = await supabase.functions.invoke('ai-insights', {
        body: {
          transactions,
          type
        }
      });
      if (error) throw error;
      if (data?.insights) {
        setInsights(data.insights);
        toast({
          title: "AI Analysis Complete",
          description: "Your financial insights are ready"
        });
      }
    } catch (error: any) {
      console.error('AI insights error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate insights",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  return <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-blue-50">
      
      
    </Card>;
};
import type { Express, Request, Response } from "express";
import { storage } from "./storage";
import { insertTransactionSchema, insertAiInsightsSchema } from "@shared/schema";
import { z } from "zod";

export function registerRoutes(app: Express) {
  
  app.get("/api/transactions", async (req: Request, res: Response) => {
    try {
      const userId = req.query.userId as string;
      if (!userId) {
        return res.status(400).json({ error: "userId is required" });
      }
      const transactions = await storage.getTransactions(userId);
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      res.status(500).json({ error: "Failed to fetch transactions" });
    }
  });

  app.post("/api/transactions", async (req: Request, res: Response) => {
    try {
      const validatedData = insertTransactionSchema.parse(req.body);
      const transaction = await storage.createTransaction(validatedData);
      res.status(201).json(transaction);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error("Error creating transaction:", error);
      res.status(500).json({ error: "Failed to create transaction" });
    }
  });

  app.delete("/api/transactions/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid transaction ID" });
      }
      await storage.deleteTransaction(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting transaction:", error);
      res.status(500).json({ error: "Failed to delete transaction" });
    }
  });

  app.post("/api/ai-insights", async (req: Request, res: Response) => {
    try {
      const { transactions, type = "insights", userId } = req.body;
      
      if (!userId) {
        return res.status(400).json({ error: "userId is required" });
      }
      
      if (!transactions || !Array.isArray(transactions)) {
        return res.status(400).json({ error: "transactions array is required" });
      }

      const LOVABLE_API_KEY = process.env.LOVABLE_API_KEY;
      
      if (!LOVABLE_API_KEY) {
        return res.status(500).json({ error: 'LOVABLE_API_KEY is not configured' });
      }

      let systemPrompt = '';
      let userPrompt = '';

      if (type === "insights") {
        systemPrompt = "You are a financial advisor AI. Analyze transaction data and provide actionable insights. Be concise and practical.";
        userPrompt = `Analyze these transactions and provide 3-5 key insights about spending patterns, potential savings, and financial recommendations:\n\n${JSON.stringify(transactions, null, 2)}`;
      } else if (type === "categorize") {
        systemPrompt = "You are a transaction categorization AI. Categorize transactions into appropriate categories.";
        userPrompt = `Categorize these transactions into categories like Bills, Food, Transport, Entertainment, etc:\n\n${JSON.stringify(transactions, null, 2)}`;
      } else if (type === "forecast") {
        systemPrompt = "You are a financial forecasting AI. Predict future spending based on historical data.";
        userPrompt = `Based on these transactions, forecast next month's spending and identify trends:\n\n${JSON.stringify(transactions, null, 2)}`;
      }

      const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
        }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          return res.status(429).json({ error: "Rate limit exceeded. Please try again later." });
        }
        if (response.status === 402) {
          return res.status(402).json({ error: "AI credits depleted. Please add credits to continue." });
        }
        const errorText = await response.text();
        console.error('AI gateway error:', response.status, errorText);
        return res.status(500).json({ error: "AI service error" });
      }

      const data = await response.json();
      const aiResponse = data.choices?.[0]?.message?.content || "No insights available";

      const insightData = {
        userId,
        type,
        insights: aiResponse,
      };

      const validatedInsight = insertAiInsightsSchema.parse(insightData);
      const savedInsight = await storage.createAiInsight(validatedInsight);

      res.json({ insights: aiResponse, saved: savedInsight });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error('Error in ai-insights:', error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  });

  app.get("/api/ai-insights", async (req: Request, res: Response) => {
    try {
      const userId = req.query.userId as string;
      const type = req.query.type as string | undefined;
      
      if (!userId) {
        return res.status(400).json({ error: "userId is required" });
      }
      
      const insights = await storage.getAiInsights(userId, type);
      res.json(insights);
    } catch (error) {
      console.error("Error fetching AI insights:", error);
      res.status(500).json({ error: "Failed to fetch AI insights" });
    }
  });
}

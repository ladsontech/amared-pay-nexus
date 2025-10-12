import { transactions, aiInsights, type Transaction, type InsertTransaction, type AiInsight, type InsertAiInsight } from "@shared/schema";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";

export interface IStorage {
  getTransactions(userId: string): Promise<Transaction[]>;
  getTransaction(id: number): Promise<Transaction | undefined>;
  createTransaction(data: InsertTransaction): Promise<Transaction>;
  deleteTransaction(id: number): Promise<void>;
  
  getAiInsights(userId: string, type?: string): Promise<AiInsight[]>;
  createAiInsight(data: InsertAiInsight): Promise<AiInsight>;
}

export class DatabaseStorage implements IStorage {
  async getTransactions(userId: string): Promise<Transaction[]> {
    return await db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, userId))
      .orderBy(desc(transactions.date));
  }

  async getTransaction(id: number): Promise<Transaction | undefined> {
    const [transaction] = await db
      .select()
      .from(transactions)
      .where(eq(transactions.id, id));
    return transaction || undefined;
  }

  async createTransaction(data: InsertTransaction): Promise<Transaction> {
    const [transaction] = await db
      .insert(transactions)
      .values(data)
      .returning();
    return transaction;
  }

  async deleteTransaction(id: number): Promise<void> {
    await db.delete(transactions).where(eq(transactions.id, id));
  }

  async getAiInsights(userId: string, type?: string): Promise<AiInsight[]> {
    const conditions = type 
      ? and(eq(aiInsights.userId, userId), eq(aiInsights.type, type))
      : eq(aiInsights.userId, userId);
    
    return await db
      .select()
      .from(aiInsights)
      .where(conditions)
      .orderBy(desc(aiInsights.createdAt));
  }

  async createAiInsight(data: InsertAiInsight): Promise<AiInsight> {
    const [insight] = await db
      .insert(aiInsights)
      .values(data)
      .returning();
    return insight;
  }
}

export const storage = new DatabaseStorage();

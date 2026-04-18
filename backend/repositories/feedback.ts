import { db } from '../db';
import { feedbacks, InsertFeedback, insertFeedbackSchema } from '../db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { toDrizzleInsert } from './helpers';

type CreateFeedbackInput = z.infer<typeof insertFeedbackSchema>;

export class FeedbackRepository {
  async create(data: CreateFeedbackInput) {
    const [feedback] = await db
      .insert(feedbacks)
      .values(toDrizzleInsert<InsertFeedback>(data))
      .returning();
    return feedback;
  }

  async getByUser(userId: string) {
    return db.select().from(feedbacks).where(eq(feedbacks.userId, userId));
  }
}

export const feedbackRepository = new FeedbackRepository();

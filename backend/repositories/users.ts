import { db } from '../db';
import {
  users,
  InsertUser,
  insertUserSchema,
  UpdateUserPreferencesInput,
} from '../db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { toDrizzleInsert, withUpdatedAt } from './helpers';

// Use Zod-inferred type for repository inputs so routes can pass
// `insertUserSchema.parse(...)` directly without type mismatches.
type CreateUserInput = z.infer<typeof insertUserSchema>;

export class UserRepository {
  async create(userData: CreateUserInput) {
    // Hash password before storing
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    const [user] = await db
      .insert(users)
      .values(
        toDrizzleInsert<InsertUser>({
          ...userData,
          password: hashedPassword,
        })
      )
      .returning();

    return user;
  }

  async findByEmail(email: string) {
    const [user] = await db.select().from(users).where(eq(users.email, email));

    return user;
  }

  async findById(id: string) {
    const [user] = await db.select().from(users).where(eq(users.id, id));

    return user;
  }

  async updatePreferences(id: string, preferences: UpdateUserPreferencesInput) {
    const [user] = await db
      .update(users)
      .set(withUpdatedAt(preferences))
      .where(eq(users.id, id))
      .returning();

    return user;
  }

  async findAll() {
    return await db.select().from(users);
  }

  async verifyPassword(plainPassword: string, hashedPassword: string) {
    return bcrypt.compare(plainPassword, hashedPassword);
  }
}
export const userRepository = new UserRepository();

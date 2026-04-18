import { Router, Request, Response, NextFunction } from 'express';
import { UserRepository } from '../repositories/users';
import { signupUserSchema, updateUserPreferencesSchema } from '../db/schema';
import jwt from 'jsonwebtoken';
import { JWT_CONFIG, AUTH_ERRORS } from '../config/constants';
import { AppError } from '../middleware/errorHandler';
import { authenticateLocal, authenticateJWT } from '../middleware/auth';
import { AuthRequest, AuthenticatedUser } from '../middleware/auth';
import type { User } from '../db/schema';

const router = Router();
const userRepo = new UserRepository();

// Signup route
const signupHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const validatedData = signupUserSchema.parse(req.body);

    const existingUser = await userRepo.findByEmail(validatedData.email);
    if (existingUser) {
      throw new AppError(AUTH_ERRORS.EMAIL_ALREADY_EXISTS, 400);
    }

    const user = await userRepo.create({
      email: validatedData.email,
      password: validatedData.password,
      name: validatedData.name,
    });

    const token = generateToken(user);

    res.status(201).json({
      success: true,
      data: {
        message: 'Signup successful',
        token,
        user: sanitizeUser(user),
      },
    });
  } catch (error) {
    next(error);
  }
};

// Login route
const loginHandler = (req: Request, res: Response) => {
  const user = (req as AuthRequest).user!;
  const token = generateToken(user);

  res.json({
    success: true,
    data: {
      message: 'Login successful',
      token,
      user: sanitizeUser(user),
    },
  });
};

// Get current user
const getCurrentUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authUser = (req as AuthRequest).user!;
    const user = await userRepo.findById(authUser.id);

    if (!user) {
      throw new AppError(AUTH_ERRORS.UNAUTHORIZED, 401);
    }

    res.json({
      success: true,
      data: sanitizeUser(user),
    });
  } catch (error) {
    next(error);
  }
};

const updatePreferencesHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = (req as AuthRequest).user!;
  try {
    const validatedData = updateUserPreferencesSchema.parse(req.body);
    const updatedUser = await userRepo.updatePreferences(user.id, validatedData);

    if (!updatedUser) {
      throw new AppError(AUTH_ERRORS.UNAUTHORIZED, 401);
    }

    res.json({
      success: true,
      data: sanitizeUser(updatedUser),
    });
  } catch (error) {
    next(error);
  }
};

// Helper functions
type SafeUser = Omit<User, 'password'>;

const generateToken = (user: Pick<AuthenticatedUser, 'id' | 'email'>) => {
  const jwtSecret = JWT_CONFIG.SECRET || JWT_CONFIG.FALLBACK_SECRET;
  return jwt.sign({ userId: user.id, email: user.email }, jwtSecret, {
    expiresIn: JWT_CONFIG.EXPIRES_IN,
  });
};

const sanitizeUser = (user: SafeUser | AuthenticatedUser) => ({
  id: user.id,
  email: user.email,
  name: user.name,
  theme: user.theme,
  refreshRate: user.refreshRate,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

// Routes
router.post('/signup', signupHandler);
router.post('/login', authenticateLocal, loginHandler);
router.get('/me', authenticateJWT, getCurrentUser);
router.put('/preferences', authenticateJWT, updatePreferencesHandler);

export default router;

/**
 * Database User Service Implementation
 * Uses Prisma ORM to interact with a SQLite database for authentication
 */

import { 
  User, 
  UserCredentials, 
  UserRegistrationData, 
  UserWithToken,
  AuthProvider
} from '../models/User';
import { IUserService } from './IUserService';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from './PrismaClient';

// Get JWT secret from environment variable or use default for development
const JWT_SECRET = process.env.JWT_SECRET || 'buildtrack-pro-development-secret';

// Create a dummy Prisma client for client-side rendering if the real one isn't available
const dummyPrisma = {
  user: {
    findUnique: () => Promise.resolve(null),
    findFirst: () => Promise.resolve(null),
    create: () => Promise.resolve(null),
    update: () => Promise.resolve(null),
    delete: () => Promise.resolve(null)
  },
  verificationToken: {
    findUnique: () => Promise.resolve(null),
    create: () => Promise.resolve(null),
    delete: () => Promise.resolve(null)
  },
  resetToken: {
    findUnique: () => Promise.resolve(null),
    create: () => Promise.resolve(null),
    delete: () => Promise.resolve(null)
  },
  $disconnect: () => Promise.resolve()
};

// Use the imported prisma or fallback to dummy for client-side
const db = prisma || dummyPrisma;

export class DbUserService implements IUserService {
  /**
   * Get user by email
   */
  async getUserByEmail(email: string): Promise<User | null> {
    try {
      return await db.user.findUnique({
        where: { email: email.toLowerCase() }
      });
    } catch (err) {
      console.error('Error in getUserByEmail:', err);
      return null;
    }
  }

  /**
   * Get user by provider ID
   */
  async getUserByProviderId(provider: AuthProvider, providerId: string): Promise<User | null> {
    try {
      return await db.user.findFirst({
        where: {
          AND: [
            { authProvider: provider },
            { authProviderId: providerId }
          ]
        }
      });
    } catch (err) {
      console.error('Error in getUserByProviderId:', err);
      return null;
    }
  }
  /**
   * Authenticate user with email and password
   */
  async authenticateWithCredentials(credentials: UserCredentials): Promise<UserWithToken | null> {
    try {
      // Find user by email
      const dbUser = await db.user.findUnique({
        where: { email: credentials.email.toLowerCase() }
      });

      // User not found or password doesn't match
      if (!dbUser || !dbUser.password) {
        console.log('User not found or no password:', credentials.email);
        return null;
      }

      // Verify password
      const passwordValid = await bcrypt.compare(credentials.password, dbUser.password);
      if (!passwordValid) {
        console.log('Invalid password for user:', credentials.email);
        return null;
      }

      // Update last login
      await db.user.update({
        where: { id: dbUser.id },
        data: {
          lastLoginAt: new Date(),
          updatedAt: new Date()
        }
      });
      
      // Convert db user to our user model
      const user = this.mapDbUserToUser(dbUser);

      // Generate and return token
      const token = this.generateToken(user);
      return { ...user, token };
    } catch (err) {
      console.error('Authentication error:', err);
      return null;
    }
  }

  /**
   * Register a new user
   */
  async registerUser(userData: UserRegistrationData): Promise<UserWithToken | null> {
    try {
      // Check if email already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: userData.email.toLowerCase() }
      });

      if (existingUser) {
        console.log('Email already in use:', userData.email);
        return null; // Email already in use
      }

      // For email registration, hash the password
      let hashedPassword: string | undefined;
      if (userData.password) {
        hashedPassword = await bcrypt.hash(userData.password, 10);
      }

      // Parse name into first and last name
      let firstName: string | undefined;
      let lastName: string | undefined;
      
      if (userData.name) {
        const nameParts = userData.name.split(' ');
        firstName = nameParts[0];
        lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : undefined;
      }
      
      // Create new user
      const dbUser = await db.user.create({
        data: {
          email: userData.email.toLowerCase(),
          firstName,
          lastName,
          password: hashedPassword,
          authProvider: userData.authProvider || 'email',
          authProviderId: userData.authProviderId,
          isEmailVerified: userData.authProvider !== 'email', // Only email needs verification
          createdAt: new Date(),
          updatedAt: new Date(),
          role: 'user'
        }
      });

      // For email registration, create verification token
      if (userData.authProvider === 'email' || !userData.authProvider) {
        const verificationToken = uuidv4();
        const expiry = new Date();
        expiry.setHours(expiry.getHours() + 24); // 24-hour expiry
        
        await db.verificationToken.create({
          data: {
            token: verificationToken,
            userId: dbUser.id,
            expiresAt: expiry
          }
        });
        
        // In a real implementation, would send email here
        console.log(`Verification token created: ${verificationToken} for user ${dbUser.id}`);
      }
      
      // Convert db user to our user model
      const user = this.mapDbUserToUser(dbUser);
      
      // Generate and return token
      const token = this.generateToken(user);
      console.log(`User created: ${user.id}, ${user.email}`);
      
      return { ...user, token };
    } catch (err) {
      console.error('Error in registerUser:', err);
      return null;
    }
  }

  /**
   * Authenticate with a social provider
   */
  async authenticateWithProvider(provider: AuthProvider, providerToken: string): Promise<UserWithToken | null> {
    try {
      // Find user by provider ID
      const user = await prisma.user.findFirst({
        where: { 
          AND: [
            { authProvider: provider },
            { authProviderId: providerToken }
          ]
        }
      });

      if (user) {
        // Update last login
        await db.user.update({
          where: { id: user.id },
          data: {
            lastLoginAt: new Date(),
            updatedAt: new Date()
          }
        });
        
        // Return existing user
        const token = this.generateToken(user);
        return { ...user, token };
      }

      // User doesn't exist, create new user from provider
      const email = `${provider}${providerToken.substring(0, 8)}@example.com`;
      const newUser = await prisma.user.create({
        data: {
          email,
          firstName: `${provider.charAt(0).toUpperCase() + provider.slice(1)}`,
          lastName: 'User',
          authProvider: provider,
          authProviderId: providerToken,
          isEmailVerified: true, // Assumed verified through provider
          createdAt: new Date(),
          updatedAt: new Date(),
          lastLoginAt: new Date(),
          role: 'user'
        }
      });

      // Generate and return token
      const token = this.generateToken(newUser);
      return { ...newUser, token };
    } catch (err) {
      console.error('Error in authenticateWithProvider:', err);
      return null;
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<User | null> {
    try {
      return await db.user.findUnique({
        where: { id: userId }
      });
    } catch (err) {
      console.error('Error in getUserById:', err);
      return null;
    }
  }

  /**
   * Update user profile
   */
  async updateUserProfile(userId: string, profileData: Partial<User>): Promise<User | null> {
    try {
      return await db.user.update({
        where: { id: userId },
        data: {
          ...profileData,
          updatedAt: new Date()
        }
      });
    } catch (err) {
      console.error('Error in updateUserProfile:', err);
      return null;
    }
  }

  /**
   * Update user by ID with partial data
   */
  async updateUser(userId: string, userData: Partial<User>): Promise<User | null> {
    try {
      return await db.user.update({
        where: { id: userId },
        data: {
          ...userData,
          updatedAt: new Date()
        }
      });
    } catch (err) {
      console.error('Error in updateUser:', err);
      return null;
    }
  }

  /**
   * Verify user's email with token
   */
  async verifyEmail(token: string): Promise<boolean> {
    try {
      // Find verification token
      const verificationToken = await db.verificationToken.findUnique({
        where: { token },
        include: { user: true }
      });
      
      if (!verificationToken) return null;
      
      // Check if token is expired
      if (verificationToken.expiresAt < new Date()) {
        // Token expired, delete and return null
        await db.verificationToken.delete({
          where: { id: verificationToken.id }
        });
        return false;
      }
      
      // Update user's email verification status
      const updatedUser = await db.user.update({
        where: { id: verificationToken.userId },
        data: { 
          isEmailVerified: true,
          updatedAt: new Date()
        }
      });
      
      // Delete used token
      await prisma.verificationToken.delete({
        where: { id: verificationToken.id }
      });
      
      return true;
    } catch (err) {
      console.error('Error in verifyEmail:', err);
      return false;
    }
  }

  /**
   * Map database user to our User model
   */
  private mapDbUserToUser(dbUser: any): User {
    // Create a name from firstName and lastName
    const name = dbUser.firstName 
      ? `${dbUser.firstName} ${dbUser.lastName || ''}`.trim() 
      : dbUser.email.split('@')[0]; // Use part of email if no name provided
    
    // Create user preferences if none exist
    const defaultPreferences = {
      theme: 'light',
      notifications: {
        email: true,
        push: true,
        sms: false
      }
    };
    
    // Parse preferences if they exist as JSON string, otherwise use default
    let preferences;
    try {
      if (dbUser.preferences && typeof dbUser.preferences === 'string') {
        preferences = JSON.parse(dbUser.preferences);
      } else if (dbUser.preferences) {
        preferences = dbUser.preferences;
      } else {
        preferences = defaultPreferences;
      }
    } catch (e) {
      console.error('Error parsing preferences, using default:', e);
      preferences = defaultPreferences;
    }
    
    return {
      id: dbUser.id,
      email: dbUser.email,
      name: name,
      password: dbUser.password,
      authProvider: dbUser.authProvider || 'email',
      authProviderId: dbUser.authProviderId,
      isEmailVerified: Boolean(dbUser.isEmailVerified),
      createdAt: new Date(dbUser.createdAt),
      updatedAt: new Date(dbUser.updatedAt),
      lastLoginAt: dbUser.lastLoginAt ? new Date(dbUser.lastLoginAt) : undefined,
      role: dbUser.role || 'user',
      preferences: preferences,
      profileImage: dbUser.profileImage,
      organizationId: dbUser.organizationId
    };
  }

  /**
   * Create password reset token
   */
  async requestPasswordReset(email: string): Promise<boolean> {
    try {
      // Find user by email
      const user = await db.user.findUnique({
        where: { email: email.toLowerCase() }
      });
      
      if (!user) return false;
      
      // Create reset token
      const resetToken = uuidv4();
      const expiry = new Date();
      expiry.setHours(expiry.getHours() + 1); // 1-hour expiry
      
      await db.resetToken.create({
        data: {
          token: resetToken,
          userId: user.id,
          expiresAt: expiry
        }
      });
      
      // In a real implementation, would send email here
      console.log(`Reset token created: ${resetToken} for user ${user.id}`);
      
      return true;
    } catch (err) {
      console.error('Error in requestPasswordReset:', err);
      return false;
    }
  }

  /**
   * Reset password with token
   */
  async resetPassword(token: string, newPassword: string): Promise<boolean> {
    try {
      // Find reset token
      const resetToken = await db.resetToken.findUnique({
        where: { token }
      });
      
      if (!resetToken) return false;
      
      // Check if token is expired
      if (resetToken.expiresAt < new Date()) {
        // Token expired, delete and return false
        await db.resetToken.delete({
          where: { id: resetToken.id }
        });
        return false;
      }
      
      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      
      // Update user's password
      await db.user.update({
        where: { id: resetToken.userId },
        data: { 
          password: hashedPassword,
          updatedAt: new Date()
        }
      });
      
      // Delete used token
      await db.resetToken.delete({
        where: { id: resetToken.id }
      });
      
      return true;
    } catch (err) {
      console.error('Error in resetPassword:', err);
      return false;
    }
  }

  /**
   * Generate a JWT token for a user
   */
  private generateToken(user: any): string {
    return jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
  }
}

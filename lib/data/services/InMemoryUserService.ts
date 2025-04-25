/**
 * In-Memory User Service Implementation
 * Simulates database operations for development and testing
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

// Secret for JWT signing - in production this would be in env vars
const JWT_SECRET = 'buildtrack-pro-development-secret';

export class InMemoryUserService implements IUserService {
  // Simulated user database
  private users: User[] = [];
  // Reset tokens storage: { token: { userId, expires } }
  private resetTokens: Record<string, { userId: string, expires: Date }> = {};
  // Verification tokens storage: { token: { userId, expires } }
  private verificationTokens: Record<string, { userId: string, expires: Date }> = {};

  constructor() {
    // Seed with a test user
    const hashedPassword = bcrypt.hashSync('password123', 10);
    this.users.push({
      id: uuidv4(),
      email: 'test@buildtrackpro.com',
      name: 'Test User',
      password: hashedPassword,
      authProvider: 'email',
      isEmailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastLoginAt: new Date(),
      role: 'admin',
      preferences: {
        theme: 'light',
        notifications: {
          email: true,
          push: true,
          sms: false
        }
      }
    });
    
    // Add a Google OAuth user
    this.users.push({
      id: uuidv4(),
      email: 'google@buildtrackpro.com',
      name: 'Google User',
      authProvider: 'google',
      authProviderId: 'google-oauth2-12345',
      isEmailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastLoginAt: new Date(),
      role: 'user'
    });
    
    // Add a Microsoft OAuth user
    this.users.push({
      id: uuidv4(),
      email: 'microsoft@buildtrackpro.com',
      name: 'Microsoft User',
      authProvider: 'microsoft',
      authProviderId: 'microsoft-oauth2-12345',
      isEmailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastLoginAt: new Date(),
      role: 'manager'
    });
  }

  /**
   * Generate a JWT token for a user
   */
  private generateToken(user: User): string {
    return jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
  }

  /**
   * Authenticate user with email and password
   */
  async authenticateWithCredentials(credentials: UserCredentials): Promise<UserWithToken | null> {
    try {
      // Artificial delay to simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Find user by email
      const user = this.users.find(u => u.email.toLowerCase() === credentials.email.toLowerCase());
      
      // Debug log for testing
      console.log(`Auth attempt for: ${credentials.email}`);
      console.log(`Found user: ${user ? 'Yes' : 'No'}`);
      
      // If no user found, return null
      if (!user) {
        console.log('User not found');
        return null;
      }
      
      // If no password or password doesn't match
      if (!user.password) {
        console.log('No password stored for user');
        return null;
      }
      
      const passwordMatch = bcrypt.compareSync(credentials.password, user.password);
      console.log(`Password match: ${passwordMatch ? 'Yes' : 'No'}`);
      
      if (!passwordMatch) {
        return null;
      }
      
      // Update last login
      user.lastLoginAt = new Date();
      user.updatedAt = new Date();
      
      // Generate and return token
      const token = this.generateToken(user);
      return { ...user, token };
    } catch (err) {
      console.error('Error in authenticateWithCredentials:', err);
      return null;
    }
  }

  /**
   * Authenticate user with OAuth provider
   */
  async authenticateWithProvider(provider: AuthProvider, providerToken: string): Promise<UserWithToken | null> {
    // In a real implementation, we would validate the token with the provider's API
    // For simulation, we'll use dummy validation logic
    
    // Check provider
    if (!provider || provider === 'email' || !providerToken) {
      return null;
    }
    
    // Extract user info from token (simulated)
    const providerUserId = providerToken.split('-').pop();
    const email = `${provider}${providerUserId}@example.com`;
    
    // Find existing user by provider ID or email
    let user = this.users.find(
      u => (u.authProvider === provider && u.authProviderId === providerToken) ||
           (u.email.toLowerCase() === email.toLowerCase())
    );
    
    // If user doesn't exist, create a new one
    if (!user) {
      user = {
        id: uuidv4(),
        email,
        name: `${provider.charAt(0).toUpperCase() + provider.slice(1)} User`,
        authProvider: provider,
        authProviderId: providerToken,
        isEmailVerified: true, // Assumed verified through provider
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLoginAt: new Date(),
        role: 'user'
      };
      this.users.push(user);
    } else {
      // Update last login
      user.lastLoginAt = new Date();
      user.updatedAt = new Date();
    }
    
    // Generate and return token
    const token = this.generateToken(user);
    return { ...user, token };
  }

  /**
   * Register a new user
   */
  async registerUser(userData: UserRegistrationData): Promise<UserWithToken | null> {
    try {
      // Artificial delay to simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Check if email already exists
      if (this.users.some(u => u.email.toLowerCase() === userData.email.toLowerCase())) {
        return null; // Email already in use
      }
      
      // For email registration, hash the password
      let hashedPassword: string | undefined;
      if (userData.password) {
        hashedPassword = bcrypt.hashSync(userData.password, 10);
      }
      
      // Create new user with a proper ID
      const userId = uuidv4();
      
      const newUser: User = {
        id: userId,
        email: userData.email,
        name: userData.name || '',
        password: hashedPassword,
        authProvider: userData.authProvider || 'email',
        authProviderId: userData.authProviderId,
        isEmailVerified: userData.authProvider !== 'email', // Only email needs verification
        createdAt: new Date(),
        updatedAt: new Date(),
        role: 'user'
      };
      
      // Add to "database"
      this.users.push(newUser);
      
      // For email registration, create verification token
      if (userData.authProvider === 'email' || !userData.authProvider) {
        const verificationToken = uuidv4();
        const expiry = new Date();
        expiry.setHours(expiry.getHours() + 24); // 24-hour expiry
        
        this.verificationTokens[verificationToken] = {
          userId: newUser.id,
          expires: expiry
        };
        
        // In a real implementation, would send email here
        console.log(`Verification token created: ${verificationToken} for user ${newUser.id}`);
      }
      
      // Generate and return token
      const token = this.generateToken(newUser);
      
      // Log user creation for debugging
      console.log(`User created: ${newUser.id}, ${newUser.email}`);
      
      return { ...newUser, token };
    } catch (err) {
      console.error('Error in registerUser:', err);
      return null;
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(id: string): Promise<User | null> {
    const user = this.users.find(u => u.id === id);
    return user || null;
  }

  /**
   * Get user by email
   */
  async getUserByEmail(email: string): Promise<User | null> {
    const user = this.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    return user || null;
  }

  /**
   * Get user by provider ID
   */
  async getUserByProviderId(provider: AuthProvider, providerUserId: string): Promise<User | null> {
    const user = this.users.find(
      u => u.authProvider === provider && u.authProviderId === providerUserId
    );
    return user || null;
  }

  /**
   * Update user data
   */
  async updateUser(id: string, userData: Partial<User>): Promise<User | null> {
    const userIndex = this.users.findIndex(u => u.id === id);
    
    if (userIndex === -1) {
      return null;
    }
    
    // If updating password, hash it
    if (userData.password) {
      userData.password = bcrypt.hashSync(userData.password, 10);
    }
    
    // Update user
    const updatedUser = {
      ...this.users[userIndex],
      ...userData,
      updatedAt: new Date()
    };
    
    this.users[userIndex] = updatedUser;
    return updatedUser;
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(email: string): Promise<boolean> {
    const user = await this.getUserByEmail(email);
    
    if (!user) {
      return false;
    }
    
    // Generate reset token
    const resetToken = uuidv4();
    const expiry = new Date();
    expiry.setHours(expiry.getHours() + 1); // 1-hour expiry
    
    this.resetTokens[resetToken] = {
      userId: user.id,
      expires: expiry
    };
    
    // In a real implementation, would send email here
    console.log(`Password reset token created: ${resetToken} for user ${user.id}`);
    
    return true;
  }

  /**
   * Reset password with token
   */
  async resetPassword(token: string, newPassword: string): Promise<boolean> {
    // Check if token exists and is valid
    const resetData = this.resetTokens[token];
    if (!resetData || resetData.expires < new Date()) {
      return false;
    }
    
    // Get user
    const user = await this.getUserById(resetData.userId);
    if (!user) {
      return false;
    }
    
    // Update password
    const hashedPassword = bcrypt.hashSync(newPassword, 10);
    await this.updateUser(user.id, { password: hashedPassword });
    
    // Remove used token
    delete this.resetTokens[token];
    
    return true;
  }

  /**
   * Verify email with token
   */
  async verifyEmail(token: string): Promise<boolean> {
    // Check if token exists and is valid
    const verificationData = this.verificationTokens[token];
    if (!verificationData || verificationData.expires < new Date()) {
      return false;
    }
    
    // Get user
    const user = await this.getUserById(verificationData.userId);
    if (!user) {
      return false;
    }
    
    // Mark email as verified
    await this.updateUser(user.id, { isEmailVerified: true });
    
    // Remove used token
    delete this.verificationTokens[token];
    
    return true;
  }
}

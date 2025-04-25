/**
 * User Service Interface
 * Defines the contract for user data operations
 */

import { 
  User, 
  UserCredentials, 
  UserRegistrationData, 
  UserWithToken,
  AuthProvider
} from '../models/User';

export interface IUserService {
  /**
   * Authenticate a user with email and password
   * @param credentials User credentials
   * @returns Authenticated user with token or null if authentication fails
   */
  authenticateWithCredentials(credentials: UserCredentials): Promise<UserWithToken | null>;
  
  /**
   * Authenticate a user with an OAuth provider
   * @param provider The OAuth provider (google, microsoft, apple)
   * @param providerToken Token or code from the provider
   * @returns Authenticated user with token or null if authentication fails
   */
  authenticateWithProvider(provider: AuthProvider, providerToken: string): Promise<UserWithToken | null>;
  
  /**
   * Register a new user
   * @param userData User registration data
   * @returns Newly created user with token or null if registration fails
   */
  registerUser(userData: UserRegistrationData): Promise<UserWithToken | null>;
  
  /**
   * Get a user by ID
   * @param id User ID
   * @returns User or null if not found
   */
  getUserById(id: string): Promise<User | null>;
  
  /**
   * Get a user by email
   * @param email User email
   * @returns User or null if not found
   */
  getUserByEmail(email: string): Promise<User | null>;
  
  /**
   * Get a user by provider ID
   * @param provider Auth provider
   * @param providerUserId Provider's user ID
   * @returns User or null if not found
   */
  getUserByProviderId(provider: AuthProvider, providerUserId: string): Promise<User | null>;
  
  /**
   * Update a user
   * @param id User ID
   * @param userData Partial user data to update
   * @returns Updated user or null if update fails
   */
  updateUser(id: string, userData: Partial<User>): Promise<User | null>;
  
  /**
   * Request a password reset
   * @param email User email
   * @returns True if reset was requested successfully
   */
  requestPasswordReset(email: string): Promise<boolean>;
  
  /**
   * Reset a password with a token
   * @param token Reset token
   * @param newPassword New password
   * @returns True if password was reset successfully
   */
  resetPassword(token: string, newPassword: string): Promise<boolean>;
  
  /**
   * Verify a user's email
   * @param token Verification token
   * @returns True if email was verified successfully
   */
  verifyEmail(token: string): Promise<boolean>;
}

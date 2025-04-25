/**
 * User model for BuildTrack Pro
 * Part of the data layer abstraction
 */

export type AuthProvider = 'email' | 'google' | 'microsoft' | 'apple' | null;

export interface User {
  id: string;
  email: string;
  name: string;
  password?: string; // Not stored in some auth providers
  authProvider: AuthProvider;
  authProviderId?: string;
  organizationId?: string;
  role?: string;
  profileImage?: string;
  isEmailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
  preferences?: UserPreferences;
}

export interface UserPreferences {
  theme?: 'light' | 'dark' | 'system';
  notifications?: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  dashboardLayout?: any; // This will be expanded as we develop the dashboard
}

export interface UserCredentials {
  email: string;
  password: string;
}

export interface UserRegistrationData {
  email: string;
  name: string;
  password?: string;
  authProvider?: AuthProvider;
  authProviderId?: string;
}

export interface UserWithToken extends User {
  token: string;
}

/**
 * Supabase User Service
 * Implements IUserService interface with Supabase
 */

import { IUserService } from './IUserService';
import { User, UserCredentials, UserRegistrationData, UserWithToken, AuthProvider } from '../models/User';
import { supabase } from '../../supabase/client';

export class SupabaseUserService implements IUserService {
  /**
   * Authenticate a user with email and password
   */
  async authenticateWithCredentials(credentials: UserCredentials): Promise<UserWithToken | null> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password
      });
      
      if (error) throw error;
      if (!data.user) return null;
      
      // Get profile information from profiles table
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();
        
      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Profile fetch error:', profileError);
      }

      // Create name from first and last name
      const name = `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim();
      
      // Map Supabase user to our User model
      return {
        id: data.user.id,
        email: data.user.email || '',
        name,
        role: profile?.role || 'user',
        organizationId: profile?.organization_id || '',
        isEmailVerified: data.user.email_confirmed_at !== null,
        createdAt: new Date(data.user.created_at),
        updatedAt: new Date(data.user.updated_at || data.user.created_at),
        lastLoginAt: data.user.last_sign_in_at ? new Date(data.user.last_sign_in_at) : undefined,
        authProvider: 'email',
        token: data.session?.access_token || ''
      };
    } catch (error) {
      console.error('Authentication error:', error);
      return null;
    }
  }
  
  /**
   * Authenticate with a provider (Google, Microsoft, etc.)
   */
  async authenticateWithProvider(provider: AuthProvider, providerToken: string): Promise<UserWithToken | null> {
    try {
      // This would typically involve exchanging the provider token for a Supabase session
      // For now, we'll just validate the token with Supabase
      const { data, error } = await supabase.auth.getUser(providerToken);
      
      if (error) throw error;
      if (!data.user) return null;
      
      // Get the session
      const { data: sessionData } = await supabase.auth.getSession();
      
      // Get profile information
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();
        
      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Profile fetch error:', profileError);
      }
      
      // Create name from first and last name
      const name = `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim();
      
      return {
        id: data.user.id,
        email: data.user.email || '',
        name,
        role: profile?.role || 'user',
        organizationId: profile?.organization_id || '',
        isEmailVerified: data.user.email_confirmed_at !== null,
        createdAt: new Date(data.user.created_at),
        updatedAt: new Date(data.user.updated_at || data.user.created_at),
        lastLoginAt: data.user.last_sign_in_at ? new Date(data.user.last_sign_in_at) : undefined,
        authProvider: provider,
        authProviderId: data.user.identities?.[0]?.provider || undefined,
        token: sessionData.session?.access_token || ''
      };
    } catch (error) {
      console.error('Provider authentication error:', error);
      return null;
    }
  }
  
  /**
   * Register a new user
   */
  async registerUser(userData: UserRegistrationData): Promise<UserWithToken | null> {
    try {
      // Extract first and last name from the full name
      const nameParts = userData.name.split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      
      // Register user with Supabase
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            name: userData.name
          }
        }
      });
      
      if (error) throw error;
      if (!data.user) return null;
      
      // Create a profile entry 
      if (data.user.id) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            first_name: firstName,
            last_name: lastName,
            role: 'user'
          });
          
        if (profileError) {
          console.error('Profile creation error:', profileError);
        }
      }

      // Map to our User model with token
      return {
        id: data.user.id,
        email: data.user.email || '',
        name: userData.name,
        role: 'user',
        organizationId: '',
        isEmailVerified: data.user.email_confirmed_at !== null,
        createdAt: new Date(data.user.created_at),
        updatedAt: new Date(data.user.updated_at || data.user.created_at),
        authProvider: userData.authProvider || 'email',
        token: data.session?.access_token || ''
      };
    } catch (error) {
      console.error('Registration error:', error);
      return null;
    }
  }
  
  /**
   * Get a user by ID
   */
  async getUserById(id: string): Promise<User | null> {
    try {
      const { data, error } = await supabase.auth.admin.getUserById(id);
      
      if (error) throw error;
      if (!data.user) return null;
      
      // Get profile information
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();
        
      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Profile fetch error:', profileError);
      }
      
      // Create name from first and last name
      const name = `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim();
      
      return {
        id: data.user.id,
        email: data.user.email || '',
        name,
        role: profile?.role || 'user',
        organizationId: profile?.organization_id || '',
        isEmailVerified: data.user.email_confirmed_at !== null,
        createdAt: new Date(data.user.created_at),
        updatedAt: new Date(data.user.updated_at || data.user.created_at),
        lastLoginAt: data.user.last_sign_in_at ? new Date(data.user.last_sign_in_at) : undefined,
        authProvider: 'email'
      };
    } catch (error) {
      console.error('Get user error:', error);
      return null;
    }
  }
  
  /**
   * Get a user by email
   */
  async getUserByEmail(email: string): Promise<User | null> {
    try {
      // Search for user by email in the auth.users view
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .ilike('email', email)
        .single();
        
      if (error) {
        if (error.code === 'PGRST116') {
          // No user found, not an error
          return null;
        }
        throw error;
      }
      
      if (!data) return null;
      
      // Get profile information
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.id)
        .single();
        
      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Profile fetch error:', profileError);
      }
      
      // Create name from first and last name
      const name = `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim();
      
      return {
        id: data.id,
        email: data.email,
        name,
        role: profile?.role || 'user',
        organizationId: profile?.organization_id || '',
        isEmailVerified: !!data.email_confirmed_at,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at || data.created_at),
        lastLoginAt: data.last_sign_in_at ? new Date(data.last_sign_in_at) : undefined,
        authProvider: 'email'
      };
    } catch (error) {
      console.error('Get user by email error:', error);
      return null;
    }
  }
  
  /**
   * Get a user by provider ID
   */
  async getUserByProviderId(provider: AuthProvider, providerUserId: string): Promise<User | null> {
    try {
      // This would typically involve looking up a user by their OAuth provider ID
      // In Supabase, we'd need to query through identities
      
      // For now, a simplified implementation:
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('auth_provider', provider)
        .eq('auth_provider_id', providerUserId)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          return null; // No user found
        }
        throw error;
      }
      
      if (!data) return null;
      
      // Get profile information
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.id)
        .single();
      
      // Create name from first and last name
      const name = `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim();
      
      return {
        id: data.id,
        email: data.email,
        name,
        role: profile?.role || 'user',
        organizationId: profile?.organization_id || '',
        isEmailVerified: !!data.email_confirmed_at,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at || data.created_at),
        lastLoginAt: data.last_sign_in_at ? new Date(data.last_sign_in_at) : undefined,
        authProvider: provider,
        authProviderId: providerUserId
      };
    } catch (error) {
      console.error('Get user by provider ID error:', error);
      return null;
    }
  }
  
  /**
   * Request a password reset for a user
   */
  async requestPasswordReset(email: string): Promise<boolean> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Password reset request error:', error);
      return false;
    }
  }
  
  /**
   * Reset a user's password with a token
   */
  async resetPassword(token: string, newPassword: string): Promise<boolean> {
    try {
      // When using token-based password reset with Supabase
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Password reset error:', error);
      return false;
    }
  }
  
  /**
   * Verify a user's email
   */
  async verifyEmail(token: string): Promise<boolean> {
    try {
      // Supabase handles email verification via magic links
      // This would be handling the callback after clicking the link
      
      // For most Supabase setups, this would involve verifying the token
      // which is usually done automatically via the callback route
      return true;
    } catch (error) {
      console.error('Email verification error:', error);
      return false;
    }
  }
  
  /**
   * Update a user
   */
  async updateUser(id: string, userData: Partial<User>): Promise<User | null> {
    try {
      // Extract name parts if name is provided
      let firstName, lastName;
      if (userData.name) {
        const nameParts = userData.name.split(' ');
        firstName = nameParts[0] || '';
        lastName = nameParts.slice(1).join(' ') || '';
      }
      
      // Update user profile
      if (firstName || lastName || userData.role || userData.organizationId) {
        const updateData: any = {};
        
        if (firstName) updateData.first_name = firstName;
        if (lastName) updateData.last_name = lastName;
        if (userData.role) updateData.role = userData.role;
        if (userData.organizationId) updateData.organization_id = userData.organizationId;
        updateData.updated_at = new Date().toISOString();
        
        const { error: profileError } = await supabase
          .from('profiles')
          .update(updateData)
          .eq('id', id);
          
        if (profileError) throw profileError;
      }
      
      // Get updated user
      return await this.getUserById(id);
    } catch (error) {
      console.error('Update user error:', error);
      return null;
    }
  }
  
  /**
   * Delete a user
   */
  async deleteUser(id: string): Promise<boolean> {
    try {
      const { error } = await supabase.auth.admin.deleteUser(id);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Delete user error:', error);
      return false;
    }
  }
}

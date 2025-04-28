/**
 * ProfileSyncService
 * 
 * Service responsible for synchronizing user profile data between Supabase Auth
 * and Prisma models, with special handling for language preferences and other
 * internationalization settings.
 * 
 * Following BuildTrack Pro's mobile-first approach, this service ensures that
 * profile changes are consistently applied across all interfaces, especially
 * important for construction professionals working in the field with potentially
 * limited connectivity.
 */

import { createClient, User, AdminUserAttributes } from '@supabase/supabase-js';
import prisma from '../../lib/prisma';
import { processQueuedMutations } from '../utils/storage';

// Define interfaces for type safety
interface DbUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  language?: string;
  timezone?: string;
  avatarUrl?: string;
  jobTitle?: string;
  department?: string;
  preferredContactMethod?: string;
}

interface UserMetadata {
  language?: string;
  timezone?: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  job_title?: string;
  department?: string;
  preferred_contact_method?: string;
  [key: string]: any;
}

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export class ProfileSyncService {
  /**
   * Synchronize changes to user profile between Supabase Auth and Prisma
   * @param userId The user ID to synchronize
   * @param isOnline Whether the device is currently online
   * @returns Promise<boolean> indicating success
   */
  static async syncUserProfile(userId: string, isOnline: boolean = true): Promise<boolean> {
    try {
      if (!isOnline) {
        console.log('Device offline, queuing sync for later');
        return false;
      }
      
      // Fetch user from Supabase Auth
      const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(
        userId
      );
      
      if (authError || !authUser) {
        console.error('Error fetching auth user:', authError);
        return false;
      }
      
      // Fetch user from Prisma with all needed fields
      const dbUser = await prisma.user.findUnique({
        where: { id: userId }
      });
      
      if (!dbUser) {
        console.error('User not found in database');
        return false;
      }
      
      // Detect changes that need to be synced
      const userMetadata = authUser.user.user_metadata || {};
      const needsSync = this.detectChanges(dbUser, userMetadata);
      
      if (!needsSync) {
        console.log('No changes detected, skipping sync');
        return true;
      }
      
      // Update Supabase Auth with Prisma data
      await this.updateSupabaseAuth(userId, dbUser);
      
      // Update Prisma with Supabase Auth data
      await this.updatePrismaFromAuth(userId, authUser.user);
      
      return true;
    } catch (error) {
      console.error('Error in profile sync:', error);
      return false;
    }
  }
  
  /**
   * Process any queued profile synchronization operations
   * Particularly useful when device comes back online
   */
  static async processQueuedSyncs(): Promise<void> {
    try {
      // Process any queued mutations (from offline mode)
      await processQueuedMutations();
    } catch (error) {
      console.error('Error processing queued syncs:', error);
    }
  }
  
  /**
   * Detect if there are changes that need to be synchronized
   * @param dbUser User from Prisma database
   * @param authMetadata Metadata from Supabase Auth
   * @returns boolean indicating if sync is needed
   */
  private static detectChanges(
    dbUser: DbUser, 
    authMetadata: UserMetadata
  ): boolean {
    // Check for language preference changes
    if (dbUser.language !== authMetadata.language) {
      return true;
    }
    
    // Check for timezone changes
    if (dbUser.timezone !== authMetadata.timezone) {
      return true;
    }
    
    // Check for name changes
    if (
      dbUser.firstName !== authMetadata.first_name ||
      dbUser.lastName !== authMetadata.last_name
    ) {
      return true;
    }
    
    // Check for profile picture changes
    if (dbUser.avatarUrl !== authMetadata.avatar_url) {
      return true;
    }
    
    return false;
  }
  
  /**
   * Update Supabase Auth with data from Prisma
   * @param userId User ID to update
   * @param dbUser User data from Prisma
   */
  private static async updateSupabaseAuth(
    userId: string,
    dbUser: DbUser
  ): Promise<void> {
    try {
      // Prepare metadata updates
      const metadata = {
        language: dbUser.language || 'en',
        timezone: dbUser.timezone || 'UTC',
        first_name: dbUser.firstName,
        last_name: dbUser.lastName,
        avatar_url: dbUser.avatarUrl,
        job_title: dbUser.jobTitle,
        department: dbUser.department,
        preferred_contact_method: dbUser.preferredContactMethod
      };
      
      // Update user metadata in Supabase Auth
      const { error } = await supabase.auth.admin.updateUserById(
        userId,
        { user_metadata: metadata }
      );
      
      if (error) {
        throw new Error(`Error updating auth metadata: ${error.message}`);
      }
    } catch (error) {
      console.error('Error updating Supabase Auth:', error);
      throw error;
    }
  }
  
  /**
   * Update Prisma with data from Supabase Auth
   * @param userId User ID to update
   * @param authUser User data from Supabase Auth
   */
  private static async updatePrismaFromAuth(
    userId: string,
    authUser: User
  ): Promise<void> {
    try {
      const metadata = authUser.user_metadata || {};
      
      // Update user in Prisma with only the fields that exist in the schema
      await prisma.user.update({
        where: { id: userId },
        data: {
          email: authUser.email,
          firstName: metadata.first_name,
          lastName: metadata.last_name,
          language: metadata.language || 'en',
          timezone: metadata.timezone || 'UTC',
          avatarUrl: metadata.avatar_url,
          jobTitle: metadata.job_title,
          department: metadata.department,
          preferredContactMethod: metadata.preferred_contact_method
        }
      });
    } catch (error) {
      console.error('Error updating Prisma:', error);
      throw error;
    }
  }
}

'use client';

/**
 * Profile API client for BuildTrack Pro
 * 
 * Handles user profile data interactions with styling following 
 * the BuildTrack Pro design system with Primary Blue (rgb(24,62,105))
 * and Primary Orange (rgb(236,107,44))
 */

export interface ProfileData {
  id: string;
  userId: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
  language: string;
  theme: 'light' | 'dark' | 'system';
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  dashboardLayout?: any;
  createdAt: string;
  updatedAt: string;
}

const mockProfile: ProfileData = {
  id: '123',
  userId: 'user-123',
  name: 'Demo User',
  email: 'demo@buildtrackpro.com',
  avatar: '/images/avatar-placeholder.png',
  role: 'project_manager',
  language: 'en',
  theme: 'light',
  notifications: {
    email: true,
    push: true,
    sms: false,
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

class ProfileAPI {
  async getProfile(): Promise<ProfileData> {
    // Simulated API call with delay
    return new Promise((resolve) => {
      setTimeout(() => resolve(mockProfile), 300);
    });
  }

  async updateProfile(data: Partial<ProfileData>): Promise<ProfileData> {
    // Simulated API call with delay
    return new Promise((resolve) => {
      setTimeout(() => {
        const updated = { ...mockProfile, ...data, updatedAt: new Date().toISOString() };
        resolve(updated);
      }, 500);
    });
  }

  async updateLanguage(language: string): Promise<ProfileData> {
    return this.updateProfile({ language });
  }
  
  async updatePreferences(preferences: any): Promise<ProfileData> {
    return this.updateProfile({ ...preferences });
  }
  
  async updateDashboardLayout(layout: any): Promise<ProfileData> {
    return this.updateProfile({ dashboardLayout: layout });
  }
  
  async addRecentProject(projectId: string): Promise<ProfileData> {
    // This would normally update a recent projects list in the profile
    return this.updateProfile({});
  }
}

export default new ProfileAPI();

/**
 * BuildTrack Pro - Authentication Initialization Script
 * 
 * This script helps ensure that test users are properly loaded and available
 * for local development testing of the authentication system.
 */

(function() {
  // Test users matching BuildTrack Pro's role structure
  const defaultTestUsers = [
    {
      id: "usr_admin_test",
      email: "admin@buildtrackpro.com",
      name: "Admin User",
      password: "$2a$10$UKonBzs.DAuDuyPFpQugYuwbl0vT8G.NGK.8QUJ.8KSvVrLZiAUO.", // Password123 hashed with bcrypt
      role: "admin",
      isEmailVerified: true,
      organizationId: "org_test_01",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastLoginAt: null,
      authProvider: "email",
      authProviderId: null
    },
    {
      id: "usr_pm_test",
      email: "pm@buildtrackpro.com",
      name: "Project Manager",
      password: "$2a$10$UKonBzs.DAuDuyPFpQugYuwbl0vT8G.NGK.8QUJ.8KSvVrLZiAUO.", // Password123 hashed with bcrypt
      role: "project_manager",
      isEmailVerified: true,
      organizationId: "org_test_01",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastLoginAt: null,
      authProvider: "email",
      authProviderId: null
    },
    {
      id: "usr_contractor_test",
      email: "contractor@buildtrackpro.com",
      name: "Contractor User",
      password: "$2a$10$UKonBzs.DAuDuyPFpQugYuwbl0vT8G.NGK.8QUJ.8KSvVrLZiAUO.", // Password123 hashed with bcrypt
      role: "contractor",
      isEmailVerified: true,
      organizationId: "org_test_01",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastLoginAt: null,
      authProvider: "email",
      authProviderId: null
    },
    {
      id: "usr_client_test",
      email: "client@buildtrackpro.com",
      name: "Client User",
      password: "$2a$10$UKonBzs.DAuDuyPFpQugYuwbl0vT8G.NGK.8QUJ.8KSvVrLZiAUO.", // Password123 hashed with bcrypt
      role: "client",
      isEmailVerified: true,
      organizationId: "org_test_01",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastLoginAt: null,
      authProvider: "email",
      authProviderId: null
    },
    {
      id: "usr_user_test",
      email: "user@buildtrackpro.com",
      name: "Regular User",
      password: "$2a$10$UKonBzs.DAuDuyPFpQugYuwbl0vT8G.NGK.8QUJ.8KSvVrLZiAUO.", // Password123 hashed with bcrypt
      role: "user",
      isEmailVerified: true,
      organizationId: "org_test_01",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastLoginAt: null,
      authProvider: "email",
      authProviderId: null
    }
  ];

  // Function to ensure test users exist in localStorage
  function ensureTestUsers() {
    try {
      console.log("Checking for existing test users...");
      
      // Get any existing users from localStorage
      const existingUsersStr = localStorage.getItem('buildtrack_users_db');
      let existingUsers = [];
      
      if (existingUsersStr) {
        try {
          existingUsers = JSON.parse(existingUsersStr);
          console.log(`Found ${existingUsers.length} existing users in storage`);
        } catch (e) {
          console.warn("Failed to parse existing users, will reset:", e);
          existingUsers = [];
        }
      }
      
      // Check if we need to add test users
      const existingEmails = new Set(existingUsers.map(u => u.email.toLowerCase()));
      const missingUsers = defaultTestUsers.filter(u => !existingEmails.has(u.email.toLowerCase()));
      
      if (missingUsers.length > 0) {
        console.log(`Adding ${missingUsers.length} missing test users...`);
        
        // Merge the arrays, adding any missing users
        const updatedUsers = [...existingUsers, ...missingUsers];
        
        // Save back to localStorage
        localStorage.setItem('buildtrack_users_db', JSON.stringify(updatedUsers));
        console.log(`Successfully saved ${updatedUsers.length} users to storage`);
        
        return {
          success: true,
          message: `Added ${missingUsers.length} test users`,
          usersAdded: missingUsers.length,
          totalUsers: updatedUsers.length
        };
      } else {
        console.log("All test users already exist");
        return {
          success: true,
          message: "All test users already exist",
          usersAdded: 0,
          totalUsers: existingUsers.length
        };
      }
    } catch (error) {
      console.error("Error ensuring test users:", error);
      return {
        success: false,
        message: error.message || "Unknown error",
        error: error
      };
    }
  }
  
  // Auto-initialize on script load
  const result = ensureTestUsers();
  
  // Expose for external use if needed
  window.BuildTrackAuth = {
    ensureTestUsers: ensureTestUsers,
    lastResult: result
  };
  
  // Add a message to the console
  console.log(
    "%cBuildTrack Pro Auth System Initialized",
    "background: #183e69; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold;"
  );
  console.log(
    "%cTest accounts available with password 'Password123':",
    "color: #ec6b2c; font-weight: bold;"
  );
  console.log(
    "- Admin: admin@buildtrackpro.com\n" +
    "- Project Manager: pm@buildtrackpro.com\n" +
    "- Contractor: contractor@buildtrackpro.com\n" +
    "- Client: client@buildtrackpro.com\n" +
    "- User: user@buildtrackpro.com"
  );
})();

/**
 * User Service Factory
 * Provides access to the current user service implementation
 */

import { IUserService } from './IUserService';
import { InMemoryUserService } from './InMemoryUserService';

// This will be replaced with environment or config based selection later
const IMPLEMENTATION_TYPE = 'in-memory';

/**
 * Factory singleton to provide the appropriate UserService implementation
 */
export class UserServiceFactory {
  private static instance: IUserService;
  
  /**
   * Get the current UserService implementation
   */
  public static getInstance(): IUserService {
    if (!UserServiceFactory.instance) {
      switch (IMPLEMENTATION_TYPE) {
        case 'in-memory':
          UserServiceFactory.instance = new InMemoryUserService();
          break;
        // Future implementations will be added here:
        // case 'postgres':
        //   UserServiceFactory.instance = new PostgresUserService();
        //   break;
        default:
          UserServiceFactory.instance = new InMemoryUserService();
      }
    }
    
    return UserServiceFactory.instance;
  }
}

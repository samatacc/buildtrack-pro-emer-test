import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useEffect, useState } from 'react';

// Define the type for the hook return value
interface UseSupabaseReturn {
  supabase: ReturnType<typeof createClientComponentClient>;
  user: any | null;
  isLoading: boolean;
  error: Error | null;
}

/**
 * Custom hook to use Supabase client and user state
 */
export function useSupabase(): UseSupabaseReturn {
  const [user, setUser] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  
  // Create the Supabase client
  const supabase = createClientComponentClient();
  
  // Effect to get and subscribe to auth state
  useEffect(() => {
    // Get current user
    const getUser = async () => {
      try {
        setIsLoading(true);
        
        const { data, error } = await supabase.auth.getUser();
        
        if (error) {
          throw error;
        }
        
        setUser(data?.user || null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to get user'));
        console.error('Error getting user:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    // Call getUser immediately
    getUser();
    
    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user || null);
      }
    );
    
    // Cleanup subscription
    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);
  
  return { supabase, user, isLoading, error };
}

export default useSupabase;

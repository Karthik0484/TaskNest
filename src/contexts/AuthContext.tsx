import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // Get initial session first
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Error getting session:', error);
        }
        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);
          setLoading(false);
        }
      } catch (error) {
        console.error('Error in getInitialSession:', error);
        if (mounted) setLoading(false);
      }
    };

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session);

        if (!mounted) return;

        setSession(session);
        setUser(session?.user ?? null);

        if (loading) setLoading(false);

        // Handle email confirmation
        if (event === 'SIGNED_IN' && session) {
          console.log('User signed in successfully');
        }
        
        if (event === 'TOKEN_REFRESHED') {
          console.log('Token refreshed successfully');
        }
      }
    );

    getInitialSession();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    // Check if user is already signed out
    if (!session && !user) {
      console.warn('signOut called, but user/session is already null');
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        // If "session not found", suppress as it's not a critical error for the UI
        if (
          typeof error.message === "string" &&
          error.message.toLowerCase().includes("session not found")
        ) {
          console.warn('Supabase: session not found during signOut, syncing local state anyway');
        } else {
          console.error('Error signing out:', error);
          throw error;
        }
      }
    } catch (error) {
      // Log all errors, but always clear state to ensure "hard sign out"
      console.error('Error in signOut:', error);
    } finally {
      // Clear local state regardless of result to prevent ghost sessions
      setUser(null);
      setSession(null);
      setLoading(false);
    }
  };

  // Always provide a context value, even during initialization
  const contextValue: AuthContextType = {
    user,
    session,
    loading,
    signOut
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { User } from '../types/supabase';

type AuthState = {
  user: User | null;
  session: any;
  loading: boolean;
  error: string | null;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  checkUsername: (username: string) => Promise<boolean>;
  deleteUser: (userId: string) => Promise<void>;
  toggleAdminStatus: (userId: string) => Promise<void>;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  loading: true,
  error: null,

  signUp: async (email, password, username) => {
    try {
      set({ loading: true, error: null });
      
      // Check if username already exists
      const { data: existingUsers } = await supabase
        .from('users')
        .select('username')
        .eq('username', username)
        .single();
      
      if (existingUsers) {
        set({ error: 'Username already taken', loading: false });
        return;
      }

      // Sign up user
      const { data, error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: {
            username,
          }
        }
      });

      if (error) {
        set({ error: error.message, loading: false });
        return;
      }

      if (data.user) {
        // Create user profile in users table
        const { error: profileError } = await supabase
          .from('users')
          .insert({
            id: data.user.id,
            username,
            email,
            created_at: new Date().toISOString(),
            last_seen: new Date().toISOString(),
            is_admin: false
          });

        if (profileError) {
          set({ error: profileError.message, loading: false });
          return;
        }

        // Get user details
        const { data: userData } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.user.id)
          .single();

        set({ 
          user: userData as User,
          session: data.session,
          loading: false 
        });
      }
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  signIn: async (email, password) => {
    try {
      set({ loading: true, error: null });
      
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email, 
        password
      });

      if (error) {
        set({ error: error.message, loading: false });
        return;
      }

      if (data.user) {
        // Get user details
        const { data: userData } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.user.id)
          .single();

        // Update last seen
        await supabase
          .from('users')
          .update({ last_seen: new Date().toISOString() })
          .eq('id', data.user.id);

        set({ 
          user: userData as User,
          session: data.session,
          loading: false 
        });
      }
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  signOut: async () => {
    try {
      set({ loading: true });
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        set({ error: error.message, loading: false });
        return;
      }
      
      set({ user: null, session: null, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  checkUsername: async (username) => {
    const { data } = await supabase
      .from('users')
      .select('username')
      .eq('username', username);
    
    return data && data.length > 0;
  },

  deleteUser: async (userId) => {
    try {
      set({ loading: true, error: null });
      
      // Check if current user is admin
      const currentUser = useAuthStore.getState().user;
      if (!currentUser?.is_admin) {
        set({ error: 'Unauthorized action', loading: false });
        return;
      }

      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);

      if (error) {
        set({ error: error.message, loading: false });
        return;
      }

      set({ loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  toggleAdminStatus: async (userId) => {
    try {
      set({ loading: true, error: null });
      
      // Check if current user is admin
      const currentUser = useAuthStore.getState().user;
      if (!currentUser?.is_admin) {
        set({ error: 'Unauthorized action', loading: false });
        return;
      }

      // Get current admin status
      const { data: userData } = await supabase
        .from('users')
        .select('is_admin')
        .eq('id', userId)
        .single();

      if (!userData) {
        set({ error: 'User not found', loading: false });
        return;
      }

      // Toggle admin status
      const { error } = await supabase
        .from('users')
        .update({ is_admin: !userData.is_admin })
        .eq('id', userId);

      if (error) {
        set({ error: error.message, loading: false });
        return;
      }

      set({ loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  }
}));

// Initialize auth state on load
supabase.auth.onAuthStateChange(async (event, session) => {
  if (session) {
    // Get user details
    const { data: userData } = await supabase
      .from('users')
      .select('*')
      .eq('id', session.user.id)
      .single();

    useAuthStore.setState({ 
      user: userData as User,
      session,
      loading: false 
    });

    // Update last seen
    await supabase
      .from('users')
      .update({ last_seen: new Date().toISOString() })
      .eq('id', session.user.id);
  } else {
    useAuthStore.setState({ user: null, session: null, loading: false });
  }
});
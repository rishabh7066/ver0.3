
import { User } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

// Storage Keys (Fallback)
const DB_KEY = 'sky_x_users_db';
const SESSION_KEY = 'sky_x_session_active';

// Helper to access the "Database" (Fallback)
const getUsersDB = (): User[] => {
  try {
    const data = localStorage.getItem(DB_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
};

const saveToDB = (user: User) => {
  const users = getUsersDB();
  const index = users.findIndex(u => u.id === user.id);
  if (index !== -1) {
    users[index] = user;
  } else {
    users.push(user);
  }
  localStorage.setItem(DB_KEY, JSON.stringify(users));
};

// --- AUTH API ---

export const subscribeToAuthChanges = (callback: (user: User | null) => void) => {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data } = supabase.auth.onAuthStateChange((event, session) => {
        try {
          if (session?.user) {
            callback({
              id: session.user.id,
              email: session.user.email!,
              name: session.user.user_metadata.name || session.user.email?.split('@')[0] || 'User',
              avatarUrl: session.user.user_metadata.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${session.user.id}`
            });
          } else {
            callback(null);
          }
        } catch (err) {
          console.error("Error processing auth state change:", err);
          callback(null);
        }
      });
      return () => data.subscription.unsubscribe();
    } catch (e) {
      console.error("Failed to subscribe to auth changes:", e);
      return () => {};
    }
  }
  return () => {};
};

export const getActiveSession = async (): Promise<User | null> => {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data } = await supabase.auth.getSession();
      if (data.session?.user) {
        return {
          id: data.session.user.id,
          email: data.session.user.email!,
          name: data.session.user.user_metadata.name || 'User',
          avatarUrl: data.session.user.user_metadata.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.session.user.id}`
        };
      }
      return null;
    } catch (e) {
      console.warn("Supabase session fetch failed, falling back to local:", e);
    }
  }

  // Fallback
  const data = localStorage.getItem(SESSION_KEY);
  return data ? JSON.parse(data) : null;
};

export const getAllUsers = async (): Promise<User[]> => {
  // In a real app with Supabase, you'd query a 'profiles' table here.
  // For now, we'll return cached local users to avoid breaking the UI if tables don't exist.
  return getUsersDB(); 
};

export const login = async (email: string, password: string): Promise<User> => {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) {
      // Handle the "Email not confirmed" case specifically
      if (error.message.includes("Email not confirmed")) {
        throw new Error("Please check your email to confirm your account before logging in.");
      }
      throw new Error(error.message);
    }

    if (data.user) {
      return {
        id: data.user.id,
        email: data.user.email!,
        name: data.user.user_metadata.name || 'User',
        avatarUrl: data.user.user_metadata.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.user.id}`
      };
    }
    throw new Error("Login failed");
  }

  // Fallback Logic
  await new Promise(r => setTimeout(r, 1000));
  if (!email.includes('@')) throw new Error("Invalid email format");
  
  const users = getUsersDB();
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  
  if (!user) throw new Error("User not found. Please register.");
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  return user;
};

export const register = async (name: string, email: string, password: string): Promise<User> => {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}&backgroundColor=b6e3f4`
        }
      }
    });

    if (error) throw new Error(error.message);

    // If user is created but no session, email confirmation is required
    if (data.user && !data.session) {
      throw new Error("Account created! Please check your email to confirm your registration before logging in.");
    }

    if (data.user) {
      return {
        id: data.user.id,
        email: data.user.email!,
        name: name,
        avatarUrl: data.user.user_metadata.avatarUrl
      };
    }
    throw new Error("Registration failed");
  }

  // Fallback Logic
  await new Promise(r => setTimeout(r, 1000));
  if (!name || !email || !password) throw new Error("All fields are required");
  
  const users = getUsersDB();
  const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existing) throw new Error("User already exists. Please login.");

  const newUser: User = {
    id: `user-${Date.now()}`,
    name: name,
    email: email,
    avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}&backgroundColor=b6e3f4`
  };
  saveToDB(newUser);
  localStorage.setItem(SESSION_KEY, JSON.stringify(newUser));
  return newUser;
};

export const updateUserAvatar = async (userId: string, avatarUrl: string): Promise<User> => {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.auth.updateUser({
      data: { avatarUrl }
    });
    if (error) throw new Error(error.message);
    if (data.user) {
      return {
        id: data.user.id,
        email: data.user.email!,
        name: data.user.user_metadata.name,
        avatarUrl: data.user.user_metadata.avatarUrl
      };
    }
  }

  // Fallback Logic
  await new Promise(r => setTimeout(r, 500));
  const users = getUsersDB();
  const user = users.find(u => u.id === userId);
  if (!user) throw new Error("User not found");
  
  const updatedUser = { ...user, avatarUrl };
  saveToDB(updatedUser);
  localStorage.setItem(SESSION_KEY, JSON.stringify(updatedUser));
  return updatedUser;
};

export const logout = async (): Promise<void> => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
      return;
    }
    await new Promise(r => setTimeout(r, 500));
    localStorage.removeItem(SESSION_KEY);
    return;
};

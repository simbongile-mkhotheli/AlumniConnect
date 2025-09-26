import React, { createContext, useContext, useReducer, useEffect } from 'react';
import type { ReactNode } from 'react';
import api from 'src/services/api';
import { MockDataLoader } from '../utils/mockDataLoader';
import { resolveMockEnabled } from '../services/useMockApi';
import { ApiService } from '@shared/services/apiService';
import { API_ENDPOINTS } from '../services/endpoints';
import type { DbUser, Badge, ProfileRole } from '../types';
import { computeBadges } from '../services/profileMapping';

// User Profile Interface
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: ProfileRole | 'mentee';
  profileImage?: string;
  initials: string;
  isActive: boolean;
  joinDate: string;
  lastLogin: string;
  impactScore: number;
  badges: Badge[];
  // Professional & profile fields surfaced from DbUser for editing
  company?: string;
  jobTitle?: string;
  location?: string;
  bio?: string;
  skills: string[];
  interests: string[];
  preferences: {
    theme: 'light' | 'dark' | 'auto';
    notifications: {
      email: boolean;
      push: boolean;
      events: boolean;
      mentorship: boolean;
      opportunities: boolean;
    };
    privacy: {
      profileVisible: boolean;
      contactVisible: boolean;
      activityVisible: boolean;
    };
  };
}

// User State Interface
export interface UserState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// User Actions
export type UserAction =
  | { type: 'SET_USER'; payload: UserProfile }
  | { type: 'CLEAR_USER' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'UPDATE_PROFILE'; payload: Partial<UserProfile> }
  | { type: 'UPDATE_PREFERENCES'; payload: Partial<UserProfile['preferences']> }
  | { type: 'UPDATE_THEME'; payload: 'light' | 'dark' | 'auto' };

// Initial State
const initialState: UserState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

// Transform DbUser from db.json to UserProfile interface

const transformDbUserToUserProfile = (dbUser: DbUser): UserProfile => {
  const getInitials = (fullName: string) => {
    return fullName.split(' ').map(name => name.charAt(0)).join('').toUpperCase();
  };

  const calculateImpactScore = (user: DbUser) => {
    // Calculate realistic impact score based on user data
    let score = 0;
    score += user.role === 'admin' ? 200 : 0;
    score += user.role === 'mentor' ? 150 : 0;
    score += user.role === 'alumni' ? 100 : 0;
    score += user.isVerified ? 100 : 0;
    score += user.status === 'active' ? 100 : 50;
    score += user.skills.length * 10;
    score += user.interests.length * 5;
    // Remove randomness during tests for deterministic assertions
    if (process.env.NODE_ENV !== 'test') {
      score += Math.floor(Math.random() * 300);
    }
    return score;
  };

  return {
    id: dbUser.id,
    name: dbUser.fullName,
    email: dbUser.email,
  role: dbUser.role,
    profileImage: dbUser.avatar,
    initials: getInitials(dbUser.fullName),
    isActive: dbUser.status === 'active',
    joinDate: new Date(dbUser.createdAt).toISOString().split('T')[0],
    lastLogin: dbUser.lastLoginDate || dbUser.updatedAt || new Date().toISOString(),
    impactScore: calculateImpactScore(dbUser),
    badges: computeBadges(dbUser),
    company: dbUser.company,
    jobTitle: dbUser.jobTitle,
    location: dbUser.location,
    bio: dbUser.bio,
    skills: [...dbUser.skills],
    interests: [...dbUser.interests],
    preferences: {
      theme: 'light',
      notifications: {
        email: true,
        push: dbUser.status === 'active',
        events: true,
        mentorship: dbUser.role === 'mentor',
        opportunities: dbUser.role === 'alumni' || dbUser.role === 'student',
      },
      privacy: {
        profileVisible: dbUser.isVerified,
        contactVisible: dbUser.status === 'active',
        activityVisible: dbUser.status === 'active',
      },
    },
  };
};

// Service to get users - unified mock/real API approach
const userService = {
  async getAllUsers(): Promise<DbUser[]> {
    try {
      if (resolveMockEnabled()) {
        return await MockDataLoader.getUsers();
      } else {
        // Real backend path
        const res = await ApiService.getPaginated<DbUser>(API_ENDPOINTS.USERS.BASE, 1, 1000);
        if (res.success && Array.isArray(res.data)) {
          return res.data as DbUser[];
        }
        return [];
      }
    } catch (error) {
      console.error('Error fetching all users:', error);
      return [];
    }
  },

  async getUserByEmail(email: string): Promise<DbUser | null> {
    try {
      const users = await userService.getAllUsers();
      return users.find(user => user.email.toLowerCase() === email.toLowerCase()) || null;
    } catch (error) {
      console.error('Error fetching user by email:', error);
      return null;
    }
  },

  async getUserById(id: string): Promise<DbUser | null> {
    try {
      if (!resolveMockEnabled()) {
        // Try direct API call first for real backend
        const res = await ApiService.get<DbUser>(`${API_ENDPOINTS.USERS.BASE}/${id}`);
        if (res.success && res.data) {
          return res.data as DbUser;
        }
      }
      
      // Fall back to searching in all users (for both mock and real API)
      const users = await userService.getAllUsers();
      return users.find(user => user.id === id) || null;
    } catch (error) {
      console.error('Error fetching user by ID:', error);
      return null;
    }
  }
};

// Reducer
function userReducer(state: UserState, action: UserAction): UserState {
  switch (action.type) {
    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };

    case 'CLEAR_USER':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };

    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };

    case 'UPDATE_PROFILE':
      if (!state.user) return state;
      return {
        ...state,
        user: {
          ...state.user,
          ...action.payload,
        },
      };

    case 'UPDATE_PREFERENCES':
      if (!state.user) return state;
      return {
        ...state,
        user: {
          ...state.user,
          preferences: {
            ...state.user.preferences,
            ...action.payload,
          },
        },
      };

    case 'UPDATE_THEME':
      if (!state.user) return state;
      return {
        ...state,
        user: {
          ...state.user,
          preferences: {
            ...state.user.preferences,
            theme: action.payload,
          },
        },
      };

    default:
      return state;
  }
}

// Context
const UserContext = createContext<{
  state: UserState;
  dispatch: React.Dispatch<UserAction>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  updatePreferences: (
    preferences: Partial<UserProfile['preferences']>
  ) => Promise<void>;
  switchUser: (id: string) => Promise<void>;
  updateProfessionalInfo?: (updates: Partial<Pick<UserProfile, 'company' | 'jobTitle' | 'location' | 'bio' | 'skills' | 'interests'>>) => Promise<{ success: boolean; error?: string }>;
} | null>(null);

// Provider Component
interface UserProviderProps {
  children: ReactNode;
  initialUser?: UserProfile; // test override to skip async initialization
}

export function UserProvider({ children, initialUser }: UserProviderProps) {
  const [state, dispatch] = useReducer(userReducer, initialState);

  // Auto-login for development (simulate existing session)
  useEffect(() => {
    if (initialUser) {
      dispatch({ type: 'SET_USER', payload: initialUser });
      return;
    }
    const initializeUser = async () => {
      dispatch({ type: 'SET_LOADING', payload: true });

      try {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Check for existing session (localStorage for demo)
        const savedUser = localStorage.getItem('alumniConnect_user');
        if (savedUser) {
          const cached: UserProfile = JSON.parse(savedUser);

            // Hardcoded legacy IDs -> purge
          if (cached.id && (cached.id === 'user-001' || cached.id === 'user-002' || cached.id.startsWith('user-00'))) {
            console.log('🔄 Detected legacy hardcoded user cache. Clearing.');
            localStorage.removeItem('alumniConnect_user');
          } else {
            // Reconcile with current db.json (name / role might have changed)
            const allUsers = await userService.getAllUsers();
            const source = allUsers.find(u => u.id === cached.id);
            if (source) {
              const fresh = transformDbUserToUserProfile(source);
              // Detect mismatch (e.g., old First29 Last29 Administrator vs new alumni names)
              if (cached.name !== fresh.name || cached.role !== fresh.role) {
                console.log('♻️ Updating cached user profile to match db.json changes:', { old: cached.name, new: fresh.name, oldRole: cached.role, newRole: fresh.role });
                localStorage.setItem('alumniConnect_user', JSON.stringify(fresh));
                dispatch({ type: 'SET_USER', payload: fresh });
                return;
              }
              // Use cached but ensure badges/impact recomputed (in case rules changed)
              dispatch({ type: 'SET_USER', payload: fresh });
              return;
            } else {
              console.log('⚠️ Cached user not found in db.json anymore. Reinitializing with first active user.');
              localStorage.removeItem('alumniConnect_user');
            }
          }
        }

        // No valid cache -> choose first active user (all users now alumni)
        const users = await userService.getAllUsers();
        const defaultUser = users.find(user => user.status === 'active') || users[0];
        if (defaultUser) {
          const userProfile = transformDbUserToUserProfile(defaultUser);
          dispatch({ type: 'SET_USER', payload: userProfile });
          localStorage.setItem('alumniConnect_user', JSON.stringify(userProfile));
          console.log('🔐 Initialized with user from db.json:', defaultUser.fullName);
        } else {
          throw new Error('No users found in database');
        }
      } catch (error) {
        dispatch({
          type: 'SET_ERROR',
          payload: 'Failed to initialize user session',
        });
      }
    };

    initializeUser();
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Realistic authentication using db.json data
      if (email && password) {
        const dbUser = await userService.getUserByEmail(email);
        
        if (dbUser) {
          const userProfile = transformDbUserToUserProfile(dbUser);
          dispatch({ type: 'SET_USER', payload: userProfile });
          localStorage.setItem('alumniConnect_user', JSON.stringify(userProfile));
          console.log('🔐 User logged in from db.json:', dbUser.fullName);
        } else {
          throw new Error('User not found in database');
        }
      } else {
        throw new Error('Invalid credentials');
      }
    } catch (error) {
      dispatch({
        type: 'SET_ERROR',
        payload: error instanceof Error ? error.message : 'Login failed',
      });
    }
  };

  // Logout function
  const logout = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));

      // Clear user data
      dispatch({ type: 'CLEAR_USER' });
      localStorage.removeItem('alumniConnect_user');

      // Redirect to login or home page
      window.location.href = '/';
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Logout failed' });
    }
  };

  // Update profile function
  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!state.user) return;

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      const updatedUser = { ...state.user, ...updates };
      dispatch({ type: 'UPDATE_PROFILE', payload: updates });
      localStorage.setItem('alumniConnect_user', JSON.stringify(updatedUser));
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update profile' });
    }
  };

  // Update preferences function
  const updatePreferences = async (
    preferences: Partial<UserProfile['preferences']>
  ) => {
    if (!state.user) return;

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));

      dispatch({ type: 'UPDATE_PREFERENCES', payload: preferences });

      const updatedUser = {
        ...state.user,
        preferences: { ...state.user.preferences, ...preferences },
      };
      localStorage.setItem('alumniConnect_user', JSON.stringify(updatedUser));
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update preferences' });
    }
  };

  // Dev helper: switch active user by id
  const switchUser = async (id: string) => {
    try {
      const dbUser = await userService.getUserById(id);
      if (!dbUser) throw new Error('User not found');
      const profile = transformDbUserToUserProfile(dbUser);
      dispatch({ type: 'SET_USER', payload: profile });
      localStorage.setItem('alumniConnect_user', JSON.stringify(profile));
      console.log('👤 Switched active user to:', profile.name);
    } catch (e) {
      console.error('Failed to switch user:', e);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to switch user' });
    }
  };

  // Update professional info (optimistic PATCH placeholder; real API wiring added later)
  const updateProfessionalInfo: NonNullable<ReturnType<typeof useUser>['updateProfessionalInfo']> = async (updates) => {
    if (!state.user) return { success: false, error: 'No active user' };
    const prev = state.user;
    const patchKeys: (keyof typeof updates)[] = ['company','jobTitle','location','bio','skills','interests'];
    const patchPayload: Record<string, any> = {};
    patchKeys.forEach(k => { if (updates[k] !== undefined) patchPayload[k] = updates[k]; });
    if (Object.keys(patchPayload).length === 0) return { success: true };

    // Optimistic UI update
    // If skills or interests changed, badges may also change; we approximate via a lightweight DbUser projection.
    let optimistic = { ...prev, ...updates } as UserProfile;
    if (updates.skills || updates.interests) {
      const dbProjection = {
        id: optimistic.id,
        fullName: optimistic.name,
        email: optimistic.email,
        role: optimistic.role,
        status: optimistic.isActive ? 'active' : 'inactive',
        isVerified: optimistic.badges.includes('Verified'),
        avatar: optimistic.profileImage || '',
        company: optimistic.company || '',
        jobTitle: optimistic.jobTitle || '',
        location: optimistic.location || '',
        bio: optimistic.bio || '',
        skills: optimistic.skills || [],
        interests: optimistic.interests || [],
        graduationYear: (prev as any).graduationYear || 2024,
        createdAt: prev.joinDate,
        updatedAt: new Date().toISOString(),
        lastLoginDate: prev.lastLogin,
      } as unknown as DbUser;
      const newBadges = computeBadges(dbProjection);
      optimistic = { ...optimistic, badges: newBadges };
    }
    // Include badges in optimistic dispatch if they were recomputed so UI reflects changes immediately
    if (optimistic.badges && (updates.skills || updates.interests)) {
      dispatch({ type: 'UPDATE_PROFILE', payload: { ...updates, badges: optimistic.badges } as any });
    } else {
      dispatch({ type: 'UPDATE_PROFILE', payload: updates });
    }

    try {
      await api.patch(`/users/${prev.id}`, patchPayload);
      // Invalidate cached users so future loads get fresh data
      MockDataLoader.clearCache('users');
      // Persist new snapshot
      localStorage.setItem('alumniConnect_user', JSON.stringify(optimistic));
      return { success: true };
    } catch (e) {
      console.error('Failed to PATCH professional info', e);
      // rollback
      // Use a full overwrite rollback to restore badges too
      dispatch({ type: 'SET_USER', payload: prev });
      localStorage.setItem('alumniConnect_user', JSON.stringify(prev));
      return { success: false, error: e instanceof Error ? e.message : 'Failed to update professional info' };
    }
  };

  return (
    <UserContext.Provider
      value={{
        state,
        dispatch,
        login,
        logout,
        updateProfile,
        updatePreferences,
        switchUser,
        updateProfessionalInfo,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

// Custom Hook
export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}

// Convenience hooks
export function useUserProfile() {
  const { state } = useUser();
  return state.user;
}

export function useAuth() {
  const { state, login, logout, switchUser, updateProfessionalInfo } = useUser() as any;
  return {
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    error: state.error,
    login,
    logout,
    switchUser,
    updateProfessionalInfo,
  };
}

import React, { createContext, useContext, useReducer, type ReactNode } from 'react';
import type { Badge } from '../types';

// Import types directly to avoid module resolution issues
export interface Theme {
  theme: 'light' | 'dark';
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'alumni' | 'mentor';
  profileImage?: string;
  isActive: boolean;
  joinDate: string;
}

export interface FilterState {
  status?: string;
  type?: string;
  category?: string;
  location?: string;
  sponsor?: string;
  search?: string;
  tier?: string;
  level?: string;
  performance?: string;
  employment?: string;
  role?: string;
  industry?: string;
  experienceLevel?: string;
  featured?: string;
}

export interface BulkActionState {
  selectedItems: Set<string>;
  isVisible: boolean;
}

// Dashboard view types
export type DashboardView = 'standard' | 'admin';

// Global App State
export interface AppState {
  user: User | null;
  theme: 'light' | 'dark';
  isLoading: boolean;
  error: string | null;
  currentView: DashboardView;

  // Standard dashboard state
  standardDashboard: {
    impactScore: number;
    badges: Badge[];
    recentActivity: any[];
    notifications: any[];
  };

  // Admin dashboard sections
  events: {
    items: any[];
    filters: FilterState;
    bulkActions: BulkActionState;
  };
  sponsors: {
    items: any[];
    filters: FilterState;
    bulkActions: BulkActionState;
  };
  partners: {
    items: any[];
    filters: FilterState;
    bulkActions: BulkActionState;
  };
  chapters: {
    items: any[];
    filters: FilterState;
    bulkActions: BulkActionState;
  };
  opportunities: {
    items: any[];
    filters: FilterState;
    bulkActions: BulkActionState;
  };
  mentorships: {
    items: any[];
    filters: FilterState;
    bulkActions: BulkActionState;
  };
  qaItems: {
    items: any[];
    filters: FilterState;
    bulkActions: BulkActionState;
  };
  spotlights: {
    items: any[];
    filters: FilterState;
    bulkActions: BulkActionState;
  };
}

// Action Types
export type AppAction =
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_THEME'; payload: 'light' | 'dark' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_DASHBOARD_VIEW'; payload: DashboardView }
  | { type: 'UPDATE_IMPACT_SCORE'; payload: number }
  | { type: 'ADD_BADGE'; payload: string }
  | { type: 'UPDATE_RECENT_ACTIVITY'; payload: any[] }
  | { type: 'UPDATE_NOTIFICATIONS'; payload: any[] }
  | {
      type: 'UPDATE_FILTERS';
      payload: { section: string; filters: FilterState };
    }
  | {
      type: 'UPDATE_BULK_ACTIONS';
      payload: { section: string; bulkActions: BulkActionState };
    }
  | {
      type: 'TOGGLE_ITEM_SELECTION';
      payload: { section: string; itemId: string };
    }
  | { type: 'CLEAR_SELECTIONS'; payload: { section: string } }
  | {
      type: 'SELECT_ALL_ITEMS';
      payload: { section: string; itemIds: string[] };
    };

// Initial State
const initialState: AppState = {
  user: null,
  theme: 'light',
  isLoading: false,
  error: null,
  currentView: 'standard',
  standardDashboard: {
    // impactScore & badges now derived from UserContext (single source of truth)
    impactScore: 0,
    badges: [],
    recentActivity: [],
    notifications: [],
  },
  events: {
    items: [],
    filters: {},
    bulkActions: { selectedItems: new Set(), isVisible: false },
  },
  sponsors: {
    items: [],
    filters: {},
    bulkActions: { selectedItems: new Set(), isVisible: false },
  },
  partners: {
    items: [],
    filters: {},
    bulkActions: { selectedItems: new Set(), isVisible: false },
  },
  chapters: {
    items: [],
    filters: {},
    bulkActions: { selectedItems: new Set(), isVisible: false },
  },
  opportunities: {
    items: [],
    filters: {},
    bulkActions: { selectedItems: new Set(), isVisible: false },
  },
  mentorships: {
    items: [],
    filters: {},
    bulkActions: { selectedItems: new Set(), isVisible: false },
  },
  qaItems: {
    items: [],
    filters: {},
    bulkActions: { selectedItems: new Set(), isVisible: false },
  },
  spotlights: {
    items: [],
    filters: {},
    bulkActions: { selectedItems: new Set(), isVisible: false },
  },
};

// Reducer
export function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload };

    case 'SET_THEME':
      return { ...state, theme: action.payload };

    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };

    case 'SET_ERROR':
      return { ...state, error: action.payload };

    case 'SET_DASHBOARD_VIEW':
      return { ...state, currentView: action.payload };

    // impactScore & badges mutations removed; managed by UserContext derived fields

    case 'UPDATE_RECENT_ACTIVITY':
      return {
        ...state,
        standardDashboard: {
          ...state.standardDashboard,
          recentActivity: action.payload,
        },
      };

    case 'UPDATE_NOTIFICATIONS':
      return {
        ...state,
        standardDashboard: {
          ...state.standardDashboard,
          notifications: action.payload,
        },
      };

    case 'UPDATE_FILTERS': {
      const section = action.payload.section as keyof AppState;
      const sectionState = state[section];

      if (process.env.NODE_ENV !== 'production') {
        console.debug(`[AppContext] UPDATE_FILTERS for ${section}:`, {
          sectionExists: !!sectionState,
          hasFilters: sectionState && typeof sectionState === 'object' && 'filters' in sectionState,
          currentFilters: sectionState && typeof sectionState === 'object' && 'filters' in sectionState ? sectionState.filters : null,
          newFilters: action.payload.filters
        });
      }

      if (
        sectionState &&
        typeof sectionState === 'object' &&
        'filters' in sectionState
      ) {
        return {
          ...state,
          [section]: {
            ...sectionState,
            filters: action.payload.filters,
          },
        };
      }
      if (process.env.NODE_ENV !== 'production') {
        console.warn(`[AppContext] Cannot update filters for section ${section} - section not found or missing filters property`);
      }
      return state;
    }

    case 'UPDATE_BULK_ACTIONS': {
      const section = action.payload.section as keyof AppState;
      const sectionState = state[section];

      if (
        sectionState &&
        typeof sectionState === 'object' &&
        'bulkActions' in sectionState
      ) {
        return {
          ...state,
          [section]: {
            ...sectionState,
            bulkActions: action.payload.bulkActions,
          },
        };
      }
      return state;
    }

    case 'TOGGLE_ITEM_SELECTION': {
      const section = action.payload.section as keyof AppState;
      const sectionState = state[section];

      if (
        sectionState &&
        typeof sectionState === 'object' &&
        'bulkActions' in sectionState
      ) {
        const currentSelected = new Set(sectionState.bulkActions.selectedItems);
        const itemId = action.payload.itemId;

        if (currentSelected.has(itemId)) {
          currentSelected.delete(itemId);
        } else {
          currentSelected.add(itemId);
        }

        return {
          ...state,
          [section]: {
            ...sectionState,
            bulkActions: {
              selectedItems: currentSelected,
              isVisible: currentSelected.size > 0,
            },
          },
        };
      }
      return state;
    }

    case 'CLEAR_SELECTIONS': {
      const section = action.payload.section as keyof AppState;
      const sectionState = state[section];

      if (
        sectionState &&
        typeof sectionState === 'object' &&
        'bulkActions' in sectionState
      ) {
        return {
          ...state,
          [section]: {
            ...sectionState,
            bulkActions: {
              selectedItems: new Set(),
              isVisible: false,
            },
          },
        };
      }
      return state;
    }

    case 'SELECT_ALL_ITEMS': {
      const section = action.payload.section as keyof AppState;
      const sectionState = state[section];

      if (
        sectionState &&
        typeof sectionState === 'object' &&
        'bulkActions' in sectionState
      ) {
        return {
          ...state,
          [section]: {
            ...sectionState,
            bulkActions: {
              selectedItems: new Set(action.payload.itemIds),
              isVisible: action.payload.itemIds.length > 0,
            },
          },
        };
      }
      return state;
    }

    default:
      return state;
  }
}

// Context
const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | null>(null);

// Provider Component
interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

// Custom Hook
export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}

// Dashboard view switching hooks
export function useDashboardView() {
  const { state, dispatch } = useAppContext();

  const switchToAdmin = () =>
    dispatch({ type: 'SET_DASHBOARD_VIEW', payload: 'admin' });
  const switchToStandard = () =>
    dispatch({ type: 'SET_DASHBOARD_VIEW', payload: 'standard' });

  return {
    currentView: state.currentView,
    switchToAdmin,
    switchToStandard,
    isAdmin: state.currentView === 'admin',
    isStandard: state.currentView === 'standard',
  };
}

// Standard dashboard hooks
export function useStandardDashboard() {
  const { state, dispatch } = useAppContext();
  // impactScore & badges now sourced from UserContext; only retain activity & notifications helpers
  const updateRecentActivity = (activity: any[]) =>
    dispatch({ type: 'UPDATE_RECENT_ACTIVITY', payload: activity });

  const updateNotifications = (notifications: any[]) =>
    dispatch({ type: 'UPDATE_NOTIFICATIONS', payload: notifications });

  return {
    ...state.standardDashboard,
    updateRecentActivity,
    updateNotifications,
  };
}

// Selector Hooks for specific sections
export function useEventsState() {
  const { state } = useAppContext();
  return state.events;
}

export function useSponsorsState() {
  const { state } = useAppContext();
  return state.sponsors;
}

export function usePartnersState() {
  const { state } = useAppContext();
  return state.partners;
}

export function useChaptersState() {
  const { state } = useAppContext();
  return state.chapters;
}

export function useOpportunitiesState() {
  const { state } = useAppContext();
  return state.opportunities;
}

export function useMentorshipsState() {
  const { state } = useAppContext();
  return state.mentorships;
}

export function useQAState() {
  const { state } = useAppContext();
  return state.qaItems;
}

export function useSpotlightsState() {
  const { state } = useAppContext();
  return state.spotlights;
}

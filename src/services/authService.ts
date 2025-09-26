import type { UserProfile } from '../contexts/UserContext';

// Mock authentication service
export class AuthService {
  private static readonly STORAGE_KEY = 'alumniConnect_user';
  private static readonly TOKEN_KEY = 'alumniConnect_token';

  // Mock user data for different roles
  private static mockUsers: Record<string, UserProfile> = {
    'sarah.johnson@alumni.com': {
      id: 'user-001',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@alumni.com',
      role: 'alumni',
      initials: 'SJ',
      isActive: true,
      joinDate: '2023-01-15',
      lastLogin: new Date().toISOString(),
      impactScore: 847,
      badges: ['Mentor', 'Contributor', 'Innovator'],
  skills: ['javascript','react'],
  interests: ['networking','career'],
      preferences: {
        theme: 'light',
        notifications: {
          email: true,
          push: true,
          events: true,
          mentorship: true,
          opportunities: true,
        },
        privacy: {
          profileVisible: true,
          contactVisible: true,
          activityVisible: true,
        },
      },
    },
    'admin@alumni.com': {
      id: 'admin-001',
      name: 'Admin User',
      email: 'admin@alumni.com',
      role: 'admin',
      initials: 'AU',
      isActive: true,
      joinDate: '2022-01-01',
      lastLogin: new Date().toISOString(),
      impactScore: 1250,
      badges: ['Administrator', 'Platform Manager', 'Community Leader'],
  skills: ['leadership','strategy'],
  interests: ['community','growth'],
      preferences: {
        theme: 'dark',
        notifications: {
          email: true,
          push: true,
          events: true,
          mentorship: true,
          opportunities: true,
        },
        privacy: {
          profileVisible: true,
          contactVisible: true,
          activityVisible: true,
        },
      },
    },
    'mentor@alumni.com': {
      id: 'mentor-001',
      name: 'Michael Chen',
      email: 'mentor@alumni.com',
      role: 'mentor',
      initials: 'MC',
      isActive: true,
      joinDate: '2022-06-15',
      lastLogin: new Date().toISOString(),
      impactScore: 1120,
      badges: ['Senior Mentor', 'Tech Expert', 'Career Guide'],
  skills: ['mentoring','typescript'],
  interests: ['education','technology'],
      preferences: {
        theme: 'auto',
        notifications: {
          email: true,
          push: false,
          events: true,
          mentorship: true,
          opportunities: false,
        },
        privacy: {
          profileVisible: true,
          contactVisible: false,
          activityVisible: true,
        },
      },
    },
  };

  /**
   * Authenticate user with email and password
   */
  static async login(
    email: string,
    password: string
  ): Promise<{ user: UserProfile; token: string }> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Mock authentication - in real app, this would validate against backend
    const user = this.mockUsers[email.toLowerCase()];

    if (!user || !password) {
      throw new Error('Invalid email or password');
    }

    // Generate mock token
    const token = this.generateMockToken(user.id);

    // Update last login
    user.lastLogin = new Date().toISOString();

    // Store in localStorage
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(user));
    localStorage.setItem(this.TOKEN_KEY, token);

    return { user, token };
  }

  /**
   * Logout user
   */
  static async logout(): Promise<void> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Clear localStorage
    localStorage.removeItem(this.STORAGE_KEY);
    localStorage.removeItem(this.TOKEN_KEY);
  }

  /**
   * Get current user from storage
   */
  static getCurrentUser(): UserProfile | null {
    try {
      const userJson = localStorage.getItem(this.STORAGE_KEY);
      return userJson ? JSON.parse(userJson) : null;
    } catch (error) {
      console.error('Error parsing user from storage:', error);
      return null;
    }
  }

  /**
   * Get current token from storage
   */
  static getCurrentToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Check if user is authenticated
   */
  static isAuthenticated(): boolean {
    const user = this.getCurrentUser();
    const token = this.getCurrentToken();
    return !!(user && token);
  }

  /**
   * Refresh user session
   */
  static async refreshSession(): Promise<UserProfile | null> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const currentUser = this.getCurrentUser();
    if (!currentUser) {
      return null;
    }

    // In real app, this would validate token with backend
    const token = this.getCurrentToken();
    if (!token || this.isTokenExpired(token)) {
      this.logout();
      return null;
    }

    // Update last login
    currentUser.lastLogin = new Date().toISOString();
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(currentUser));

    return currentUser;
  }

  /**
   * Update user profile
   */
  static async updateProfile(
    updates: Partial<UserProfile>
  ): Promise<UserProfile> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const currentUser = this.getCurrentUser();
    if (!currentUser) {
      throw new Error('No authenticated user');
    }

    const updatedUser = { ...currentUser, ...updates };
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedUser));

    return updatedUser;
  }

  /**
   * Update user preferences
   */
  static async updatePreferences(
    preferences: Partial<UserProfile['preferences']>
  ): Promise<UserProfile> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const currentUser = this.getCurrentUser();
    if (!currentUser) {
      throw new Error('No authenticated user');
    }

    const updatedUser = {
      ...currentUser,
      preferences: { ...currentUser.preferences, ...preferences },
    };

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedUser));

    return updatedUser;
  }

  /**
   * Generate mock JWT token
   */
  private static generateMockToken(userId: string): string {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(
      JSON.stringify({
        sub: userId,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60, // 24 hours
      })
    );
    const signature = btoa(`mock-signature-${userId}`);

    return `${header}.${payload}.${signature}`;
  }

  /**
   * Check if token is expired (mock implementation)
   */
  private static isTokenExpired(token: string): boolean {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return true;

      const payload = JSON.parse(atob(parts[1]));
      const now = Math.floor(Date.now() / 1000);

      return payload.exp < now;
    } catch (error) {
      return true;
    }
  }

  /**
   * Get available mock users for testing
   */
  static getMockUsers(): Array<{ email: string; role: string; name: string }> {
    return Object.values(this.mockUsers).map(user => ({
      email: user.email,
      role: user.role,
      name: user.name,
    }));
  }
}

import api from '../config/api';

export const authService = {
  // Login
  async login(credentials) {
    const response = await api.post('/auth/login', credentials);
    const { access_token } = response.data;

    // Store token
    localStorage.setItem('access_token', access_token);

    return { access_token };
  },

  // Register
  async register(userData) {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  // Logout
  logout() {
    localStorage.removeItem('access_token');
  },

  // Get current user
  getCurrentUser() {
    // Not returned by backend on login; could decode JWT here if needed
    return null;
  },

  // Check if user is authenticated
  isAuthenticated() {
    return !!localStorage.getItem('access_token');
  },
};
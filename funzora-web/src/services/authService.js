const AUTH_TOKEN = 'token';
const USER_DATA = 'userData';
const USER_ROLE = 'userRole';

export const authService = {
  login: (token, role, userData) => {
    localStorage.setItem(AUTH_TOKEN, token);
    localStorage.setItem(USER_ROLE, role);
    localStorage.setItem(USER_DATA, JSON.stringify(userData));
  },

  logout: () => {
    localStorage.removeItem(AUTH_TOKEN);
    localStorage.removeItem(USER_ROLE);
    localStorage.removeItem(USER_DATA);
  },

  getUser: () => {
    const userData = localStorage.getItem(USER_DATA);
    const role = localStorage.getItem(USER_ROLE);
    if (userData && role) {
      return { ...JSON.parse(userData), role };
    }
    return null;
  },

  getToken: () => localStorage.getItem(AUTH_TOKEN),

  isAuthenticated: () => !!localStorage.getItem(AUTH_TOKEN),

  hasRole: (requiredRole) => {
    const user = authService.getUser();
    return user?.role === requiredRole;
  },

  updateUser: (userData) => {
    const currentUser = authService.getUser();
    const updatedUser = { ...currentUser, ...userData };
    localStorage.setItem(USER_DATA, JSON.stringify(updatedUser));
  }
}; 
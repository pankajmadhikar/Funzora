// Dummy users for testing
const DUMMY_USERS = {
  admin: {
    email: 'admin@example.com',
    password: 'admin123',
    role: 'admin',
    name: 'Admin User',
    id: 'admin_1'
  },
  user: {
    email: 'user@example.com',
    password: 'user123',
    role: 'user',
    name: 'Regular User',
    id: 'user_1'
  }
};

// Simulate network delay
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

// Mock authentication service
export const loginUser = async (email, password, isAdmin) => {
  // This is a mock implementation. In a real app, this would make an API call
  return new Promise((resolve, reject) => {
    // Simulate API call delay
    setTimeout(() => {
      // Admin credentials check
      if (email === 'admin@example.com' && password === 'admin123') {
        resolve({
          token: 'admin-mock-token',
          role: 'admin',
          name: 'Admin User',
          email: 'admin@example.com',
          createdAt: new Date().toISOString(),
        });
      }
      // Regular user check (in a real app, this would verify against a database)
      else if (email.includes('@') && password.length >= 6) {
        resolve({
          token: 'user-mock-token',
          role: 'user',
          name: email.split('@')[0],
          email: email,
          createdAt: new Date().toISOString(),
        });
      } else {
        reject(new Error('Invalid credentials'));
      }
    }, 1000);
  });
};

export const registerUser = async (userData) => {
  // Implementation for user registration
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        token: 'user-mock-token',
        name: userData.name,
        email: userData.email,
        createdAt: new Date().toISOString(),
      });
    }, 1000);
  });
};

export const checkAuthStatus = () => {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('userRole');
  
  if (token && userRole) {
    return {
      isAuthenticated: true,
      role: userRole
    };
  }
  
  return {
    isAuthenticated: false,
    role: null
  };
};

export const logout = async () => {
  await delay(300);
  localStorage.removeItem('token');
  localStorage.removeItem('userRole');
  return { success: true };
}; 
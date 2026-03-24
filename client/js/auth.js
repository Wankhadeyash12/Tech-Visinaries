// Authentication Helper Functions

const isLoggedIn = () => {
  return !!localStorage.getItem('token');
};

const getLoggedInUser = () => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

const setLoggedInUser = (user, token) => {
  localStorage.setItem('user', JSON.stringify(user));
  localStorage.setItem('token', token);
};

const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/login';
};

const redirectIfNotLoggedIn = () => {
  if (!isLoggedIn()) {
    window.location.href = '/login';
  }
};

const redirectIfNotRole = (requiredRole) => {
  const user = getLoggedInUser();
  if (!user || user.role !== requiredRole) {
    alert('Access denied. You do not have permission to access this page.');
    window.location.href = '/';
  }
};

const redirectIfLoggedIn = () => {
  if (isLoggedIn()) {
    const user = getLoggedInUser();
    if (user.role === 'organizer') {
      window.location.href = '/organizer-dashboard';
    } else {
      window.location.href = '/participant-dashboard';
    }
  }
};

// Display user info in navigation
const updateNavigation = () => {
  const user = getLoggedInUser();
  const navContainer = document.getElementById('nav-user-info');
  
  if (navContainer) {
    if (user) {
      navContainer.innerHTML = `
        <span>Welcome, ${user.name}!</span>
        <button onclick="logout()" style="margin-left: 10px; padding: 8px 16px; background-color: #ff6b6b; color: white; border: none; border-radius: 4px; cursor: pointer;">
          Logout
        </button>
      `;
    }
  }
};

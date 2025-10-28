import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

const api = axios.create({
  baseURL: API_URL,
});

// Function to handle login
const login = (email, password) => {
  return api.post('/auth/login.php', { email, password })
    .then(response => {
      if (response.data.jwt) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
        localStorage.setItem('token', response.data.jwt);
      }
      return response.data;
    });
};

// Function to handle logout
const logout = () => {
  localStorage.removeItem('user');
  localStorage.removeItem('token');
};

// Function to get the current user from localStorage
const getCurrentUser = () => {
  return JSON.parse(localStorage.getItem('user'));
};

const authService = {
  login,
  logout,
  getCurrentUser,
};

export default authService;
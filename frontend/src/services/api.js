import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:8000/api/',
});

// Automatically attach JWT token to every request if it exists
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('access');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;
export const registerUser = async (data) => {
  return await API.post('auth/register/', data);
};

export const loginUser = async (data) => {
  return await API.post('auth/login/', data);
};

export const getUser = async () => {
  return await API.get('auth/user/');
};

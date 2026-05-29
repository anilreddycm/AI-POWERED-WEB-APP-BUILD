import api from './api.js';

export const register = async (name, email, password) => {
    const response = await api.post('/auth/register', { name, email, password });
    return response.data.data;
};

export const emailLogin = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data.data;
};

export const logout = async () => {
    const response = await api.post('/auth/logout');
    return response.data.data;
};

export const googleLogin = async (credential) => {
    const response = await api.post('/auth/google', { credential });
    return response.data.data;
};

export const getAuthConfig = async () => {
    const response = await api.get('/auth/config');
    return response.data.data;
};

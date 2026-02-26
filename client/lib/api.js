const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const getToken = () => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('oriki_token');
};

export const api = async (endpoint, { method = 'GET', body, isFormData = false } = {}) => {
    const token = getToken();
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    if (!isFormData) headers['Content-Type'] = 'application/json';

    const res = await fetch(`${API_BASE}${endpoint}`, {
        method,
        headers,
        body: isFormData ? body : body ? JSON.stringify(body) : undefined,
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || `Request failed: ${res.status}`);
    return data;
};

// Auth
export const authAPI = {
    register: (data) => api('/auth/register', { method: 'POST', body: data }),
    login: (data) => api('/auth/login', { method: 'POST', body: data }),
    me: () => api('/auth/me'),
    updateProfile: (data) => api('/auth/profile', { method: 'PUT', body: data }),
    changePassword: (data) => api('/auth/change-password', { method: 'PUT', body: data }),
};

// Categories
export const categoryAPI = {
    getAll: () => api('/categories'),
    getBySlug: (slug) => api(`/categories/${slug}`),
    create: (data) => api('/categories', { method: 'POST', body: data }),
    update: (id, data) => api(`/categories/${id}`, { method: 'PUT', body: data }),
    delete: (id) => api(`/categories/${id}`, { method: 'DELETE' }),
};

// Posts
export const postAPI = {
    getAll: (params = {}) => api(`/posts?${new URLSearchParams(params)}`),
    getById: (id) => api(`/posts/${id}`),
    getBySlug: (slug) => api(`/posts/slug/${slug}`),
    create: (data) => api('/posts', { method: 'POST', body: data }),
    update: (id, data) => api(`/posts/${id}`, { method: 'PUT', body: data }),
    delete: (id) => api(`/posts/${id}`, { method: 'DELETE' }),
    like: (id) => api(`/posts/${id}/like`, { method: 'POST' }),
};

// Museum 3D
export const museumAPI = {
    getAll: (params = {}) => api(`/museum?${new URLSearchParams(params)}`),
    getById: (id) => api(`/museum/${id}`),
    create: (formData) => api('/museum', { method: 'POST', body: formData, isFormData: true }),
    update: (id, data) => api(`/museum/${id}`, { method: 'PUT', body: data }),
    delete: (id) => api(`/museum/${id}`, { method: 'DELETE' }),
    like: (id) => api(`/museum/${id}/like`, { method: 'POST' }),
};

// Lessons
export const lessonAPI = {
    getAll: (params = {}) => api(`/lessons?${new URLSearchParams(params)}`),
    getById: (id) => api(`/lessons/${id}`),
    getBySlug: (slug) => api(`/lessons/slug/${slug}`),
    create: (data) => api('/lessons', { method: 'POST', body: data }),
    update: (id, data) => api(`/lessons/${id}`, { method: 'PUT', body: data }),
    delete: (id) => api(`/lessons/${id}`, { method: 'DELETE' }),
};

// Subscriptions
export const subscriptionAPI = {
    initiate: (data) => api('/subscriptions/initiate', { method: 'POST', body: data }),
    verify: (reference) => api('/subscriptions/verify', { method: 'POST', body: { reference } }),
    status: () => api('/subscriptions/status'),
    cancel: () => api('/subscriptions/cancel', { method: 'POST' }),
};

// Favorites
export const favoriteAPI = {
    getAll: () => api('/favorites'),
    togglePost: (id) => api(`/favorites/post/${id}`, { method: 'POST' }),
    toggleMuseum: (id) => api(`/favorites/museum/${id}`, { method: 'POST' }),
};

// Sub-accounts
export const subAccountAPI = {
    getAll: () => api('/subaccounts'),
    create: (data) => api('/subaccounts', { method: 'POST', body: data }),
    delete: (id) => api(`/subaccounts/${id}`, { method: 'DELETE' }),
};

// Admin
export const adminAPI = {
    getStats: () => api('/admin/stats'),

    getUsers: (params = {}) => api(`/admin/users?${new URLSearchParams(params)}`),
    updateUser: (id, data) => api(`/admin/users/${id}`, { method: 'PUT', body: data }),
    deleteUser: (id) => api(`/admin/users/${id}`, { method: 'DELETE' }),
    createAdmin: (data) => api('/admin/create-admin', { method: 'POST', body: data }),
    uploadImage: (formData) => api('/admin/upload-image', { method: 'POST', body: formData, isFormData: true }),
    deleteImage: (public_id) => api('/admin/delete-image', { method: 'DELETE', body: { public_id } }),
};

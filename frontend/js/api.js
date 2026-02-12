const API_BASE = '/api';

const api = {
    async request(endpoint, options = {}) {
        const token = localStorage.getItem('token');
        const headers = {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
            ...options.headers
        };

        const response = await fetch(`${API_BASE}${endpoint}`, {
            ...options,
            headers
        });

        if (response.status === 204) return null;

        const data = await response.json();

        if (!response.ok) {
            if (response.status === 401 && !endpoint.includes('/auth')) {
                localStorage.removeItem('token');
                window.location.reload();
            }
            throw new Error(data.message || 'Something went wrong');
        }

        return data;
    },

    auth: {
        login: (credentials) => api.request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
        register: (userData) => api.request('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
        getProfile: () => api.request('/users/profile'),
        updateProfile: (data) => api.request('/users/profile', { method: 'PUT', body: JSON.stringify(data) })
    },

    admin: {
        getWarehouses: () => api.request('/warehouses'),
        createWarehouse: (data) => api.request('/warehouses', { method: 'POST', body: JSON.stringify(data) }),
        deleteWarehouse: (id) => api.request(`/warehouses/${id}`, { method: 'DELETE' }),
        registerManager: (data) => api.request('/admin/register-manager', { method: 'POST', body: JSON.stringify(data) }),
        getAllItems: () => api.request('/admin/all-items'),
        getAllUsers: () => api.request('/admin/all-users')
    },

    manager: {
        registerWorker: (data) => api.request('/manager/register-worker', { method: 'POST', body: JSON.stringify(data) }),
        getStaff: () => api.request('/manager/staff'),
        getItems: () => api.request('/manager/items'),
        getWarehouse: () => api.request('/manager/warehouse'),
        deleteItem: (id) => api.request(`/resource/${id}`, { method: 'DELETE' })
    },

    worker: {
        getPending: () => api.request('/worker/pending-items'),
        updateStatus: (id, status) => api.request(`/resource/${id}`, { method: 'PUT', body: JSON.stringify({ status }) }),
        getInventory: () => api.request('/worker/inventory')
    },

    supplier: {
        createItem: (data) => api.request('/resource', { method: 'POST', body: JSON.stringify(data) }),
        getMyItems: () => api.request('/resource'),
        pickupItem: (id) => api.request(`/resource/${id}/pickup`, { method: 'PUT' })
    }
};

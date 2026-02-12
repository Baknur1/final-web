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
            let msg = data.message || 'Error occurred';
            if (msg.length > 60) msg = msg.substring(0, 57) + '...';
            throw new Error(msg);
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
        getWarehouses: () => api.request('/admin/warehouses'),
        createWarehouse: (data) => api.request('/admin/warehouses', { method: 'POST', body: JSON.stringify(data) }),
        deleteWarehouse: (id) => api.request(`/admin/warehouses/${id}`, { method: 'DELETE' }),
        registerManager: (data) => api.request('/admin/register-manager', { method: 'POST', body: JSON.stringify(data) }),
        getAllItems: () => api.request('/admin/all-items'),
        getAllUsers: () => api.request('/admin/all-users'),
        deleteUser: (id) => api.request(`/admin/users/${id}`, { method: 'DELETE' }),
        getAuditLogs: () => api.request('/admin/audit-logs')
    },

    manager: {
        registerWorker: (data) => api.request('/manager/register-worker', { method: 'POST', body: JSON.stringify(data) }),
        getStaff: () => api.request('/manager/staff'),
        getItems: () => api.request('/manager/items'),
        getWarehouse: () => api.request('/manager/warehouse'),
        deleteItem: (id) => api.request(`/manager/items/${id}`, { method: 'DELETE' }),
        deleteWorker: (id) => api.request(`/manager/staff/${id}`, { method: 'DELETE' })
    },

    worker: {
        getPending: () => api.request('/worker/pending-items'),
        scanItem: (id, data) => api.request(`/worker/items/${id}/scan`, { method: 'PUT', body: JSON.stringify(data) }),
        outgoingItem: (data) => api.request('/worker/items/outgoing', { method: 'POST', body: JSON.stringify(data) }),
        getInventory: () => api.request('/worker/inventory')
    },

    supplier: {
        createItem: (data) => api.request('/supplier/items', { method: 'POST', body: JSON.stringify(data) }),
        getMyItems: () => api.request('/supplier/items'),
        pickupItem: (id) => api.request(`/supplier/items/${id}/pickup`, { method: 'PUT' }),
        getMatchingWarehouses: (dims) => api.request(`/supplier/matching-warehouses?length=${dims.length}&width=${dims.width}&height=${dims.height}`)
    }
};

// Core State
const state = {
    user: null,
    view: 'auth',
    warehouses: []
};

// DOM Elements
const mainContent = document.getElementById('main-content');
const navbar = document.getElementById('navbar');
const userDisplayName = document.getElementById('user-display-name');
const logoutBtn = document.getElementById('logout-btn');
const modalOverlay = document.getElementById('modal-container');
const modalTitle = document.getElementById('modal-title');
const modalBody = document.getElementById('modal-content');
const closeModal = document.getElementById('close-modal');

// --- Initialization ---

async function init() {
    setupEventListeners();
    const token = localStorage.getItem('token');
    if (token) {
        try {
            state.user = await api.auth.getProfile();
            showDashboard();
        } catch (e) {
            localStorage.removeItem('token');
            renderAuth();
        }
    } else {
        renderAuth();
    }
}

function setupEventListeners() {
    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('token');
        state.user = null;
        renderAuth();
    });

    closeModal.addEventListener('click', () => modalOverlay.classList.add('hidden'));

    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const view = item.getAttribute('data-link');
            switchView(view);
        });
    });
}

// --- View Router ---

function switchView(view) {
    state.view = view;
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    document.querySelector(`[data-link="${view}"]`)?.classList.add('active');

    switch (view) {
        case 'dashboard': renderDashboard(); break;
        case 'inventory': renderInventory(); break;
        case 'staff': renderStaff(); break;
        case 'warehouses': renderWarehouses(); break;
    }
}

// --- Views ---

function renderAuth() {
    navbar.classList.add('hidden');
    mainContent.innerHTML = `
        <div class="auth-container glass fade-in">
            <div class="auth-header">
                <i class="fas fa-cube fa-3x" style="color: var(--primary); margin-bottom: 1rem;"></i>
                <h1>Welcome to Nexus</h1>
                <p>Sign in to your warehouse portal</p>
            </div>
            <form id="login-form">
                <div class="form-group">
                    <label>Email Address</label>
                    <input type="email" id="email" placeholder="admin@admin.com" required>
                </div>
                <div class="form-group">
                    <label>Password</label>
                    <input type="password" id="password" placeholder="••••••••" required>
                </div>
                <button type="submit" class="btn btn-primary" style="width: 100%">Sign In</button>
            </form>
            <p style="text-align: center; margin-top: 1.5rem; color: var(--text-dim); font-size: 0.9rem;">
                Don't have an account? <a href="#" id="show-register" style="color: var(--primary); text-decoration: none;">Register as Supplier</a>
            </p>
        </div>
    `;

    document.getElementById('login-form').onsubmit = async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        try {
            const res = await api.auth.login({ email, password });
            localStorage.setItem('token', res.token);
            state.user = res.user;
            showDashboard();
        } catch (err) {
            notify(err.message, 'danger');
        }
    };

    document.getElementById('show-register').onclick = renderRegister;
}

function renderRegister() {
    mainContent.innerHTML = `
        <div class="auth-container glass fade-in">
            <div class="auth-header">
                <h1>Create Account</h1>
                <p>Register as a Supplier to Nexis</p>
            </div>
            <form id="register-form">
                <div class="form-group">
                    <label>Username</label>
                    <input type="text" id="reg-username" required>
                </div>
                <div class="form-group">
                    <label>Email Address</label>
                    <input type="email" id="reg-email" required>
                </div>
                <div class="form-group">
                    <label>Password</label>
                    <input type="password" id="reg-password" required>
                </div>
                <button type="submit" class="btn btn-primary" style="width: 100%">Register</button>
            </form>
            <p style="text-align: center; margin-top: 1.5rem; color: var(--text-dim); font-size: 0.9rem;">
                Already have an account? <a href="#" id="show-login" style="color: var(--primary); text-decoration: none;">Sign In</a>
            </p>
        </div>
    `;

    document.getElementById('register-form').onsubmit = async (e) => {
        e.preventDefault();
        const username = document.getElementById('reg-username').value;
        const email = document.getElementById('reg-email').value;
        const password = document.getElementById('reg-password').value;
        try {
            await api.auth.register({ username, email, password, role: 'supplier' });
            notify('Registration successful! Please login.', 'success');
            renderAuth();
        } catch (err) {
            notify(err.message, 'danger');
        }
    };

    document.getElementById('show-login').onclick = renderAuth;
}

function showDashboard() {
    navbar.classList.remove('hidden');
    userDisplayName.textContent = state.user.username;

    // Role based nav visibility
    document.getElementById('nav-staff').classList.toggle('hidden', !['super_admin', 'manager'].includes(state.user.role));
    document.getElementById('nav-warehouses').classList.toggle('hidden', state.user.role !== 'super_admin');

    switchView('dashboard');
}

async function renderDashboard() {
    mainContent.innerHTML = '<div class="loader"><div class="spinner"></div></div>';

    let content = `
        <div class="fade-in">
            <header style="margin-bottom: 2rem;">
                <h1 style="font-size: 2.5rem; margin-bottom: 0.5rem;">Hello, ${state.user.username}</h1>
                <p style="color: var(--text-dim)">Role: <span class="badge badge-shipped">${state.user.role.replace('_', ' ')}</span></p>
            </header>
            <div class="grid">
    `;

    // Role specific widgets
    if (state.user.role === 'super_admin') {
        const warehouses = await api.admin.getWarehouses();
        const users = await api.admin.getAllUsers();
        const items = await api.admin.getAllItems();
        content += `
            <div class="card glass">
                <h3>Total Warehouses</h3>
                <p style="font-size: 2rem; color: var(--primary);">${warehouses.length}</p>
            </div>
            <div class="card glass">
                <h3>System Users</h3>
                <p style="font-size: 2rem; color: var(--accent);">${users.length}</p>
            </div>
            <div class="card glass">
                <h3>Total Items</h3>
                <p style="font-size: 2rem; color: var(--primary);">${items.length}</p>
            </div>
        `;
    } else if (state.user.role === 'manager') {
        const warehouse = await api.manager.getWarehouse();
        const items = await api.manager.getItems();
        const staff = await api.manager.getStaff();
        content += `
            <div class="card glass">
                <h3>My Warehouse</h3>
                <p style="font-weight: 600;">${warehouse?.name || 'Assigned'}</p>
                <p style="font-size: 0.8rem; color: var(--text-dim);">${warehouse?.address || 'N/A'}</p>
            </div>
            <div class="card glass">
                <h3>Active Staff</h3>
                <p style="font-size: 2rem; color: var(--accent);">${staff.length}</p>
            </div>
             <div class="card glass">
                <h3>Warehouse Items</h3>
                <p style="font-size: 2rem; color: var(--primary);">${items.length}</p>
            </div>
        `;
    } else if (state.user.role === 'worker') {
        const pending = await api.worker.getPending();
        const inventory = await api.worker.getInventory();
        content += `
            <div class="card glass">
                <h3>Pending Inspect</h3>
                <p style="font-size: 2rem; color: #f59e0b;">${pending.length}</p>
            </div>
            <div class="card glass">
                <h3>Total Inventory</h3>
                <p style="font-size: 2rem; color: var(--accent);">${inventory.length}</p>
            </div>
        `;
    } else if (state.user.role === 'supplier') {
        const items = await api.supplier.getMyItems();
        content += `
            <div class="card glass">
                <h3>My Requests</h3>
                <p style="font-size: 2rem; color: var(--primary);">${items.length}</p>
            </div>
            <div class="card glass">
                <h3>Pending Approval</h3>
                <p style="font-size: 2rem; color: #f59e0b;">${items.filter(i => i.status === 'pending').length}</p>
            </div>
        `;
    }

    content += `</div></div>`;
    mainContent.innerHTML = content;
}

async function renderInventory() {
    mainContent.innerHTML = `
        <div class="fade-in">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                <h1>Inventory Management</h1>
                ${state.user.role === 'supplier' ? '<button class="btn btn-primary" id="add-item-btn"><i class="fas fa-plus"></i> New Request</button>' : ''}
            </div>
            <div class="table-container glass">
                <table id="items-table">
                    <thead>
                        <tr>
                            <th>Item Name</th>
                            <th>Quantity</th>
                            <th>Dimensions (LxWxH)</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody id="items-body"></tbody>
                </table>
            </div>
        </div>
    `;

    if (state.user.role === 'supplier') {
        document.getElementById('add-item-btn').onclick = showAddItemModal;
    }

    refreshItems();
}

async function refreshItems() {
    const tbody = document.getElementById('items-body');
    if (!tbody) return;
    tbody.innerHTML = '<tr><td colspan="5" style="text-align: center">Loading...</td></tr>';

    try {
        let items = [];
        if (state.user.role === 'supplier') items = await api.supplier.getMyItems();
        else if (state.user.role === 'worker') {
            const pending = await api.worker.getPending();
            const inv = await api.worker.getInventory();
            items = [...pending, ...inv];
        } else if (state.user.role === 'manager') items = await api.manager.getItems();
        else items = await api.admin.getAllItems();

        if (items.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align: center">No items found</td></tr>';
            return;
        }

        tbody.innerHTML = items.map(item => `
            <tr>
                <td>${item.name}</td>
                <td>${item.quantity}</td>
                <td>${item.length}x${item.width}x${item.height}</td>
                <td><span class="badge badge-${item.status}">${item.status}</span></td>
                <td>
                    <div style="display: flex; gap: 8px;">
                        ${state.user.role === 'worker' && item.status === 'pending' ? `
                            <button class="btn btn-primary" style="padding: 4px 10px; font-size: 0.8rem;" onclick="updateStatus('${item.id}', 'accepted')">Accept</button>
                            <button class="btn" style="padding: 4px 10px; font-size: 0.8rem; background: var(--danger); color: white;" onclick="updateStatus('${item.id}', 'rejected')">Reject</button>
                        ` : ''}
                        ${state.user.role === 'manager' ? `
                            <button class="icon-btn" style="color: var(--danger);" onclick="deleteItem('${item.id}')"><i class="fas fa-trash"></i></button>
                        ` : ''}
                        ${state.user.role === 'supplier' && item.status === 'accepted' ? `
                            <button class="btn btn-primary" style="padding: 4px 10px; font-size: 0.8rem;" onclick="pickupItem('${item.id}')">Pickup</button>
                        ` : ''}
                    </div>
                </td>
            </tr>
        `).join('');
    } catch (e) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--danger)">${e.message}</td></tr>`;
    }
}

async function renderStaff() {
    mainContent.innerHTML = `
        <div class="fade-in">
             <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                <h1>Staff Management</h1>
                <button class="btn btn-primary" id="add-staff-btn"><i class="fas fa-plus"></i> Add Staff</button>
            </div>
            <div class="table-container glass">
                <table>
                    <thead>
                        <tr>
                            <th>Username</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Warehouse ID</th>
                        </tr>
                    </thead>
                    <tbody id="staff-body"></tbody>
                </table>
            </div>
        </div>
    `;

    document.getElementById('add-staff-btn').onclick = showAddStaffModal;
    refreshStaff();
}

async function refreshStaff() {
    const tbody = document.getElementById('staff-body');
    if (!tbody) return;
    try {
        let staff = [];
        if (state.user.role === 'super_admin') staff = await api.admin.getAllUsers();
        else staff = await api.manager.getStaff();

        tbody.innerHTML = staff.map(s => `
            <tr>
                <td>${s.username}</td>
                <td>${s.email}</td>
                <td><span class="badge badge-shipped">${s.role}</span></td>
                <td>${s.warehouse_id || 'N/A'}</td>
            </tr>
        `).join('');
    } catch (e) {
        notify(e.message, 'danger');
    }
}

async function renderWarehouses() {
    mainContent.innerHTML = `
        <div class="fade-in">
             <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                <h1>Warehouse Control</h1>
                <button class="btn btn-primary" id="add-warehouse-btn"><i class="fas fa-plus"></i> New Warehouse</button>
            </div>
            <div class="grid" id="warehouses-grid"></div>
        </div>
    `;

    document.getElementById('add-warehouse-btn').onclick = showAddWarehouseModal;
    refreshWarehouses();
}

async function refreshWarehouses() {
    const grid = document.getElementById('warehouses-grid');
    if (!grid) return;
    try {
        const warehouses = await api.admin.getWarehouses();
        grid.innerHTML = warehouses.map(w => `
            <div class="card glass">
                <div style="display: flex; justify-content: space-between;">
                    <h3>${w.name}</h3>
                    <button class="icon-btn" onclick="deleteWarehouse('${w.id}')"><i class="fas fa-trash"></i></button>
                </div>
                <p style="color: var(--text-dim); margin-top: 10px;"><i class="fas fa-location-dot"></i> ${w.address}</p>
                <p style="font-size: 0.8rem; margin-top: 10px;">Shelf Size: ${w.shelf_length}x${w.shelf_width}x${w.shelf_height}</p>
            </div>
        `).join('');
    } catch (e) {
        notify(e.message, 'danger');
    }
}

// --- Modals ---

function showAddWarehouseModal() {
    modalTitle.textContent = 'Add New Warehouse';
    modalBody.innerHTML = `
        <form id="warehouse-form">
            <div class="form-group">
                <label>Warehouse Name</label>
                <input type="text" id="w-name" required>
            </div>
            <div class="form-group">
                <label>Address</label>
                <input type="text" id="w-address" required>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px;">
                <div class="form-group">
                    <label>Shelf Length</label>
                    <input type="number" id="w-l" required>
                </div>
                <div class="form-group">
                    <label>Shelf Width</label>
                    <input type="number" id="w-w" required>
                </div>
                <div class="form-group">
                    <label>Shelf Height</label>
                    <input type="number" id="w-h" required>
                </div>
            </div>
            <button type="submit" class="btn btn-primary" style="width: 100%">Create Warehouse</button>
        </form>
    `;

    document.getElementById('warehouse-form').onsubmit = async (e) => {
        e.preventDefault();
        try {
            await api.admin.createWarehouse({
                name: document.getElementById('w-name').value,
                address: document.getElementById('w-address').value,
                shelf_length: document.getElementById('w-l').value,
                shelf_width: document.getElementById('w-w').value,
                shelf_height: document.getElementById('w-h').value
            });
            modalOverlay.classList.add('hidden');
            refreshWarehouses();
            notify('Warehouse created', 'success');
        } catch (err) { notify(err.message, 'danger'); }
    }
    modalOverlay.classList.remove('hidden');
}

async function showAddStaffModal() {
    modalTitle.textContent = 'Register Staff';
    const warehouses = await api.admin.getWarehouses();
    const isManager = state.user.role === 'manager';

    modalBody.innerHTML = `
        <form id="staff-form">
             <div class="form-group">
                <label>Username</label>
                <input type="text" id="s-username" required>
            </div>
            <div class="form-group">
                <label>Email</label>
                <input type="email" id="s-email" required>
            </div>
            <div class="form-group">
                <label>Password</label>
                <input type="password" id="s-pass" required>
            </div>
            ${!isManager ? `
            <div class="form-group">
                <label>Role</label>
                <select id="s-role">
                    <option value="manager">Manager</option>
                    <option value="worker">Worker</option>
                </select>
            </div>
            ` : ''}
            <div class="form-group">
                <label>Warehouse</label>
                <select id="s-warehouse" ${isManager ? 'disabled' : ''}>
                    ${warehouses.map(w => `<option value="${w.id}" ${state.user.warehouse_id == w.id ? 'selected' : ''}>${w.name}</option>`).join('')}
                </select>
            </div>
            <button type="submit" class="btn btn-primary" style="width: 100%">Create User</button>
        </form>
    `;

    document.getElementById('staff-form').onsubmit = async (e) => {
        e.preventDefault();
        const data = {
            username: document.getElementById('s-username').value,
            email: document.getElementById('s-email').value,
            password: document.getElementById('s-pass').value
        };

        const whId = document.getElementById('s-warehouse').value;
        if (whId && whId !== 'undefined' && whId !== 'null') {
            data.warehouse_id = whId;
        }

        try {
            if (isManager) {
                await api.manager.registerWorker(data);
            } else {
                const role = document.getElementById('s-role').value;
                if (role === 'manager') await api.admin.registerManager(data);
                else await api.manager.registerWorker(data);
            }
            modalOverlay.classList.add('hidden');
            refreshStaff();
            notify('Staff registered', 'success');
        } catch (err) { notify(err.message, 'danger'); }
    }
    modalOverlay.classList.remove('hidden');
}

async function showAddItemModal() {
    modalTitle.textContent = 'Create Item Request';
    const warehouses = await api.admin.getWarehouses();
    modalBody.innerHTML = `
        <form id="item-form">
             <div class="form-group">
                <label>Item Name</label>
                <input type="text" id="i-name" required>
            </div>
            <div class="form-group">
                <label>Quantity</label>
                <input type="number" id="i-qty" required>
            </div>
            <div class="form-group">
                <label>Select Warehouse</label>
                <select id="i-warehouse">
                    ${warehouses.map(w => `<option value="${w.id}">${w.name} (${w.address})</option>`).join('')}
                </select>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px;">
                <div class="form-group">
                    <label>Length</label>
                    <input type="number" id="i-l" required>
                </div>
                <div class="form-group">
                    <label>Width</label>
                    <input type="number" id="i-w" required>
                </div>
                <div class="form-group">
                    <label>Height</label>
                    <input type="number" id="i-h" required>
                </div>
            </div>
            <button type="submit" class="btn btn-primary" style="width: 100%">Submit Request</button>
        </form>
    `;

    document.getElementById('item-form').onsubmit = async (e) => {
        e.preventDefault();
        try {
            await api.supplier.createItem({
                name: document.getElementById('i-name').value,
                quantity: document.getElementById('i-qty').value,
                warehouse_id: document.getElementById('i-warehouse').value,
                length: document.getElementById('i-l').value,
                width: document.getElementById('i-w').value,
                height: document.getElementById('i-h').value
            });
            modalOverlay.classList.add('hidden');
            refreshItems();
            notify('Item request submitted', 'success');
        } catch (err) { notify(err.message, 'danger'); }
    }
    modalOverlay.classList.remove('hidden');
}

// --- Global Actions (attached to window for onclick) ---

window.updateStatus = async (id, status) => {
    try {
        await api.worker.updateStatus(id, status);
        notify(`Item ${status}`, 'success');
        refreshItems();
    } catch (e) { notify(e.message, 'danger'); }
};

window.deleteItem = async (id) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    try {
        await api.manager.deleteItem(id);
        notify('Item deleted', 'success');
        refreshItems();
    } catch (e) { notify(e.message, 'danger'); }
};

window.pickupItem = async (id) => {
    try {
        await api.supplier.pickupItem(id);
        notify('Item picked up for delivery', 'success');
        refreshItems();
    } catch (e) { notify(e.message, 'danger'); }
};

window.deleteWarehouse = async (id) => {
    if (!confirm('Delete this warehouse? This cannot be undone.')) return;
    try {
        await api.admin.deleteWarehouse(id);
        notify('Warehouse removed', 'success');
        refreshWarehouses();
    } catch (e) { notify(e.message, 'danger'); }
};

function notify(text, type = 'success') {
    const container = document.getElementById('notification-container');
    const el = document.createElement('div');
    el.className = `glass fade-in`;
    el.style.cssText = `
        padding: 0.8rem 1.5rem;
        border-radius: 8px;
        margin-top: 10px;
        border-right: 4px solid ${type === 'danger' ? 'var(--danger)' : 'var(--accent)'};
        background: rgba(0, 0, 0, 0.4);
        backdrop-filter: blur(10px);
        font-weight: 500;
        font-size: 0.9rem;
        color: white;
        display: flex;
        align-items: center;
        gap: 10px;
        min-width: 210px;
        max-width: 450px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.3);
    `;
    el.innerHTML = `<span>${type === 'danger' ? '⚠️' : '✅'}</span> <span>${text}</span>`;
    container.appendChild(el);
    setTimeout(() => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(-10px)';
        el.style.transition = 'all 0.5s ease';
        setTimeout(() => el.remove(), 500);
    }, 4000);
}

// Start
init();

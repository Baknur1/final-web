const admin = {
    renderStaff: async () => {
        const mainContent = document.getElementById('main-content');
        mainContent.innerHTML = `
            <div class="fade-in">
                 <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                    <h1>Workforce Overview</h1>
                    <button class="btn btn-primary" id="add-staff-btn"><i class="fas fa-plus"></i> New Account</button>
                </div>
                <div class="glass" style="padding: 1rem; border-radius: 12px; margin-bottom: 2rem; display: flex; gap: 15px;">
                    <div style="flex: 1; position: relative;">
                        <i class="fas fa-search" style="position: absolute; left: 15px; top: 50%; transform: translateY(-50%); color: var(--text-dim);"></i>
                        <input type="text" id="staff-search" placeholder="Search by name or email..." style="width: 100%; padding-left: 45px; background: rgba(0,0,0,0.2); border: 1px solid var(--glass-border);">
                    </div>
                </div>
                <div id="staff-content"></div>
            </div>
        `;
        document.getElementById('add-staff-btn').onclick = admin.showAddStaffModal;
        document.getElementById('staff-search').oninput = admin.refreshStaff;
        admin.refreshStaff();
    },

    refreshStaff: async () => {
        const content = document.getElementById('staff-content');
        if (!content) return;
        const search = document.getElementById('staff-search').value.toLowerCase();

        try {
            const [staff, warehouses] = await Promise.all([
                state.user.role === 'super_admin' ? api.admin.getAllUsers() : api.manager.getStaff(),
                api.admin.getWarehouses()
            ]);
            const whMap = Object.fromEntries(warehouses.map(w => [w.id, w]));

            const filtered = staff.filter(s =>
                s.username.toLowerCase().includes(search) ||
                s.email.toLowerCase().includes(search)
            );

            if (search) {
                content.innerHTML = `
                    <div class="table-container glass">
                        <table>
                            <thead><tr><th>Entity</th><th>Contact</th><th>Role</th><th>Node</th><th>Action</th></tr></thead>
                            <tbody>
                                ${filtered.map(s => {
                    const wh = whMap[s.warehouse_id];
                    const isSelf = s.id === state.user.id;
                    return `
                                    <tr>
                                        <td><strong>${s.username}</strong> ${isSelf ? '<span class="badge badge-shipped">YOU</span>' : ''}</td>
                                        <td>${s.email}</td>
                                        <td><span class="badge badge-shipped">${s.role.toUpperCase()}</span></td>
                                        <td>${wh?.name || 'Global'}</td>
                                        <td>${isSelf ? '' : `<button class="icon-btn" style="color:var(--danger)" onclick="admin.deleteUser('${s.id}')"><i class="fas fa-user-minus"></i></button>`}</td>
                                    </tr>`;
                }).join('') || '<tr><td colspan="5" style="text-align:center">No matches found</td></tr>'}
                            </tbody>
                        </table>
                    </div>`;
                return;
            }

            if (state.user.role === 'super_admin') {
                const grouped = {};
                warehouses.forEach(w => grouped[w.id] = { name: w.name, staff: [] });
                grouped['global'] = { name: 'Corporate / Unassigned', staff: [] };

                const suppliers = staff.filter(s => s.role === 'supplier');
                const nonSuppliers = staff.filter(s => s.role !== 'supplier');

                const items = await api.admin.getAllItems();
                const refundItems = items.filter(i => i.defects > 0);

                nonSuppliers.forEach(s => {
                    const gid = s.warehouse_id || 'global';
                    if (grouped[gid]) grouped[gid].staff.push(s);
                    else grouped['global'].staff.push(s);
                });

                let sectionsHtml = '';

                // 2. Staff by Warehouse (Moved Refund Queue to Dashboard)
                sectionsHtml += Object.entries(grouped)
                    .filter(([_, group]) => group.staff.length > 0 || group.name !== 'Corporate / Unassigned')
                    .map(([id, group]) => `
                    <details class="glass-dropdown" style="margin-bottom: 1rem;" open>
                        <summary style="padding: 1rem; cursor: pointer; display: flex; justify-content: space-between; align-items: center; list-style: none;">
                            <span style="font-weight: 600;"><i class="fas ${id === 'global' ? 'fa-sitemap' : 'fa-warehouse'}" style="margin-right: 10px; color: var(--primary);"></i> ${group.name}</span>
                            <span class="badge badge-shipped">${group.staff.length} Members</span>
                        </summary>
                        <div style="padding: 0 1rem 1rem 1rem;">
                            <div class="table-container" style="background: transparent; border: none; box-shadow: none;">
                                <table style="font-size: 0.9rem;">
                                    <tbody>
                                        ${group.staff.map(s => `
                                            <tr>
                                                <td style="width: 30%;"><strong>${s.username}</strong></td>
                                                <td style="width: 30%; color: var(--text-dim);">${s.email}</td>
                                                <td style="width: 20%;"><span class="badge badge-shipped" style="font-size: 0.76rem;">${s.role.toUpperCase()}</span></td>
                                                <td style="text-align: right;">
                                                    ${s.id === state.user.id ? '' : `<button class="icon-btn" style="color:var(--danger); padding: 4px;" onclick="admin.deleteUser('${s.id}')"><i class="fas fa-user-minus"></i></button>`}
                                                </td>
                                            </tr>
                                        `).join('') || '<tr><td colspan="4" style="text-align:center; color: var(--text-dim);">Unstaffed Node</td></tr>'}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </details>
                `).join('');

                // 3. Supplier Group
                if (suppliers.length > 0) {
                    sectionsHtml += `
                    <details class="glass-dropdown" style="margin-bottom: 1rem;">
                        <summary style="padding: 1rem; cursor: pointer; display: flex; justify-content: space-between; align-items: center; list-style: none;">
                            <span style="font-weight: 600;"><i class="fas fa-truck-moving" style="margin-right: 10px; color: var(--accent);"></i> Supplier Directory</span>
                            <span class="badge badge-accepted">${suppliers.length} Partners</span>
                        </summary>
                        <div style="padding: 0 1rem 1rem 1rem;">
                            <div class="table-container" style="background: transparent; border: none; box-shadow: none;">
                                <table style="font-size: 0.9rem;">
                                    <thead><tr><th>Partner</th><th>Contact</th><th>Nodes in Use</th><th>Action</th></tr></thead>
                                    <tbody>
                                        ${suppliers.map(s => {
                        const sItems = items.filter(i => (i.user_id?._id || i.user_id) === s.id);
                        const usedWhIds = [...new Set(sItems.map(i => i.warehouse_id?._id || i.warehouse_id))];
                        const usedWhNames = usedWhIds.map(id => warehouses.find(w => w.id === id)?.name).filter(Boolean);
                        return `
                                            <tr>
                                                <td><strong>${s.username}</strong></td>
                                                <td style="color: var(--text-dim);">${s.email}</td>
                                                <td>
                                                    ${usedWhNames.map(name => `<span class="badge" style="cursor:pointer; font-size: 0.7rem; margin-right: 5px; background: rgba(255,255,255,0.05);" onclick="admin.refreshStaff()">${name}</span>`).join('') || 'None'}
                                                </td>
                                                <td style="text-align: right;">
                                                    <button class="icon-btn" style="color:var(--danger); padding: 4px;" onclick="admin.deleteUser('${s.id}')"><i class="fas fa-user-minus"></i></button>
                                                </td>
                                            </tr>`;
                    }).join('')}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </details>`;
                }

                content.innerHTML = sectionsHtml;
            } else {
                content.innerHTML = `
                    <div class="table-container glass">
                        <table>
                        <thead><tr><th>Personnel</th><th>Email</th><th>Role</th><th>Action</th></tr></thead>
                        <tbody>
                            ${staff.map(s => `
                                <tr>
                                    <td><strong>${s.username}</strong></td>
                                    <td>${s.email}</td>
                                    <td><span class="badge badge-shipped">${s.role}</span></td>
                                    <td>${s.id === state.user.id ? '' : `<button class="icon-btn" style="color:var(--danger)" onclick="admin.deleteUser('${s.id}')"><i class="fas fa-user-minus"></i></button>`}</td>
                                </tr>`).join('')}
                        </tbody>
                        </table>
                    </div>`;
            }
        } catch (e) { notify(e.message, 'danger'); }
    },

    showWhDetail: async (id) => {
        if (!id || id === 'Global' || id === 'undefined') return;
        try {
            const [warehouses, allItems] = await Promise.all([
                api.admin.getWarehouses(),
                state.user.role === 'super_admin' ? api.admin.getAllItems() : Promise.resolve([])
            ]);
            const wh = warehouses.find(w => w.id === id);
            if (!wh) return;

            const whItems = allItems.filter(i => (i.warehouse_id?._id || i.warehouse_id) === id);

            modalTitle.textContent = `Node: ${wh.name}`;
            modalBody.innerHTML = `
                <div class="glass" style="padding: 1.5rem; border-radius: 12px; margin-bottom: 1.5rem;">
                    <p><strong><i class="fas fa-location-dot"></i> Address:</strong> ${wh.address}</p>
                    <p style="margin-top: 10px;"><strong><i class="fas fa-expand"></i> Shelf:</strong> ${wh.shelf_length} x ${wh.shelf_width} x ${wh.shelf_height}</p>
                </div>
                ${state.user.role === 'super_admin' ? `
                <h4>Inventory in this Node (${whItems.length})</h4>
                <div class="table-container glass" style="margin-top: 10px; max-height: 300px; overflow-y: auto;">
                    <table>
                        <thead>
                            <tr>
                                <th>Item</th>
                                <th>Qty</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${whItems.map(i => `
                                <tr>
                                    <td>${i.name}</td>
                                    <td>${i.quantity}</td>
                                    <td><span class="badge badge-${i.status}">${i.status}</span></td>
                                    <td><button class="icon-btn" style="color:var(--primary)" onclick="admin.showItemDetail('${i.id}')"><i class="fas fa-eye"></i></button></td>
                                </tr>
                            `).join('') || '<tr><td colspan="4" style="text-align:center">No items</td></tr>'}
                        </tbody>
                    </table>
                </div>
                ` : ''}
            `;
            modalOverlay.classList.remove('hidden');
        } catch (e) { notify('Could not load warehouse info', 'danger'); }
    },

    showItemDetail: async (id) => {
        try {
            const [items, logs] = await Promise.all([api.admin.getAllItems(), api.admin.getAuditLogs()]);
            const item = items.find(i => i.id === id);
            if (!item) return;

            const itemLogs = logs.filter(l => l.details?.itemId === id);

            modalTitle.textContent = `Logistics Life-cycle: ${item.name}`;
            modalBody.innerHTML = `
                <div class="glass" style="padding: 1rem; border-radius: 12px; margin-bottom: 1.5rem; display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <p style="color:var(--text-dim); font-size: 0.75rem;">Current Node</p>
                        <strong>${item.warehouse_id?.name || 'N/A'}</strong>
                    </div>
                    <div style="text-align: right;">
                        <p style="color:var(--text-dim); font-size: 0.75rem;">Final Status</p>
                        <span class="badge badge-${item.status}">${item.status.toUpperCase()}</span>
                    </div>
                </div>

                <h4>Event History</h4>
                <div class="table-container glass" style="margin-top: 10px; max-height: 400px; overflow-y: auto;">
                    <table>
                        <thead>
                            <tr>
                                <th>Timestamp</th>
                                <th>Event</th>
                                <th>Executor</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${itemLogs.map(l => `
                                <tr onclick="admin.showLogDetail('${l.id || l._id}')" style="cursor: pointer;">
                                    <td style="font-size: 0.75rem;">${new Date(l.timestamp).toLocaleString()}</td>
                                    <td><span class="badge badge-shipped" style="background: rgba(255,255,255,0.05)">${l.action.replace('ITEM_', '')}</span></td>
                                    <td style="font-size: 0.75rem;">${l.performedBy?.username || 'System'}</td>
                                </tr>
                            `).join('') || '<tr><td colspan="3" style="text-align:center">No records found</td></tr>'}
                        </tbody>
                    </table>
                </div>
            `;
            modalOverlay.classList.remove('hidden');
        } catch (e) { notify('Error fetching item history', 'danger'); }
    },

    showLogDetail: async (logId) => {
        try {
            const logs = await api.admin.getAuditLogs();
            const log = logs.find(l => l.id === logId || l._id === logId);
            if (!log) return;

            const performer = log.performedBy;
            const isIssue = log.action.includes('REJECTED') || log.action.includes('DELETED') || (log.details?.refund > 0);

            modalTitle.textContent = `Logistics Record | ${log.action.replace('ITEM_', '')}`;
            modalBody.innerHTML = `
                <div class="glass" style="padding: 1.5rem; border-radius: 12px; border-left: 4px solid ${isIssue ? 'var(--danger)' : 'var(--primary)'};">
                    <div style="margin-bottom: 1.5rem;">
                        <p style="color:var(--text-dim); font-size: 0.8rem; margin-bottom: 5px;">Operation Objective</p>
                        <h3 style="color:${isIssue ? 'var(--danger)' : 'var(--primary)'};">${log.details?.name || 'Unknown Entity'}</h3>
                    </div>
                    
                    ${log.details?.reason ? `
                    <div style="background: ${isIssue ? 'rgba(239, 68, 68, 0.05)' : 'rgba(255,255,255,0.02)'}; padding: 1.2rem; border-radius: 10px; margin-bottom: 1.5rem; border: 1px solid ${isIssue ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255,255,255,0.05)'};">
                        <p style="color:${isIssue ? '#f87171' : 'var(--text-dim)'}; font-size: 0.75rem; margin-bottom: 8px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Formal Reason / Impact Assessment</p>
                        <p style="font-style: italic; color: #f1f5f9; font-size: 1rem; line-height: 1.6;">"${log.details.reason}"</p>
                    </div>
                    ` : ''}

                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; padding-top: 15px; border-top: 1px solid rgba(255,255,255,0.1);">
                        <div>
                            <p style="color:var(--text-dim); font-size: 0.75rem;">Performed By</p>
                            <p><strong>${performer?.username || 'System'}</strong></p>
                            <p style="font-size: 0.8rem; color: var(--text-dim)">${performer?.email || ''} <span class="badge" style="font-size: 0.6rem; padding: 2px 5px;">${performer?.role || ''}</span></p>
                        </div>
                        <div>
                            <p style="color:var(--text-dim); font-size: 0.75rem;">Node Authority</p>
                            <p><strong>${performer?.warehouse_id?.name || 'Global Nexus'}</strong></p>
                            <p style="font-size: 0.8rem; color: var(--text-dim)">${new Date(log.timestamp).toLocaleString()}</p>
                        </div>
                    </div>

                    ${log.details?.accepted !== undefined ? `
                    <div style="margin-top: 1.5rem; display: flex; gap: 10px;">
                        <span class="badge" style="background: rgba(16,185,129,0.1); color: #10b981;">Accepted: ${log.details.accepted}</span>
                        <span class="badge" style="background: rgba(239,68,68,0.1); color: #ef4444;">Refund Storage: ${log.details.refund}</span>
                    </div>
                    ` : ''}
                </div>
                <button class="btn btn-primary" style="margin-top: 20px; width: 100%" onclick="modalOverlay.classList.add('hidden')">Close Record</button>
            `;
            modalOverlay.classList.remove('hidden');
        } catch (e) { notify('Error loading record details', 'danger'); }
    },

    deleteUser: async (id) => {
        if (!confirm('Permanent delete this user?')) return;
        try {
            if (state.user.role === 'super_admin') await api.admin.deleteUser(id);
            else await api.manager.deleteWorker(id);
            notify('User removed from system', 'success');
            admin.refreshStaff();
        } catch (e) { notify(e.message, 'danger'); }
    },

    showAddStaffModal: async () => {
        modalTitle.textContent = 'Register Staff Members';
        const warehouses = await api.admin.getWarehouses();
        const isManager = state.user.role === 'manager';

        modalBody.innerHTML = `
            <form id="staff-form">
                 <div class="form-group">
                    <label>Full Name</label>
                    <input type="text" id="s-username" required>
                </div>
                <div class="form-group">
                    <label>Work Email</label>
                    <input type="email" id="s-email" required>
                </div>
                <div class="form-group">
                    <label>Initial Password</label>
                    <input type="text" id="s-pass" required>
                </div>
                ${!isManager ? `
                <div class="form-group">
                    <label>Access Tier</label>
                    <select id="s-role" required>
                        <option value="" disabled selected>— Chose an Access Tier —</option>
                        <option value="manager">Logistics Manager</option>
                        <option value="worker">Floor Worker</option>
                    </select>
                </div>
                ` : ''}
                <div class="form-group">
                    <label>Assign to Warehouse</label>
                    <select id="s-warehouse" required ${isManager ? 'disabled' : ''}>
                        <option value="">-- Choose Target Node --</option>
                        ${warehouses.map(w => `<option value="${w.id}" ${state.user.warehouse_id == w.id ? 'selected' : ''}>${w.name}</option>`).join('')}
                    </select>
                </div>
                <button type="submit" class="btn btn-primary" style="width: 100%">Register Account</button>
            </form>
        `;

        document.getElementById('staff-form').onsubmit = admin.handleRegister;
        modalOverlay.classList.remove('hidden');
    },

    handleRegister: async (e) => {
        e.preventDefault();
        const data = {
            username: document.getElementById('s-username').value,
            email: document.getElementById('s-email').value,
            password: document.getElementById('s-pass').value
        };
        const whId = document.getElementById('s-warehouse').value;
        if (whId) data.warehouse_id = whId;

        try {
            if (state.user.role === 'manager') {
                await api.manager.registerWorker(data);
            } else {
                const role = document.getElementById('s-role').value;
                if (role === 'manager') await api.admin.registerManager(data);
                else await api.manager.registerWorker(data);
            }
            modalOverlay.classList.add('hidden');
            admin.refreshStaff();
            notify('Registration complete', 'success');
        } catch (err) { notify(err.message, 'danger'); }
    }
};

const supplier = {
    renderInventory: async () => {
        const mainContent = document.getElementById('main-content');
        mainContent.innerHTML = `
            <div class="fade-in">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                    <h1>My Item Requests</h1>
                    <button class="btn btn-primary" id="add-item-btn"><i class="fas fa-plus"></i> New Request</button>
                </div>
                <div class="table-container glass">
                    <table id="items-table">
                        <thead>
                            <tr>
                                <th>Item Name</th>
                                <th>Qty</th>
                                <th>Unit Size</th>
                                <th>Total Vol</th>
                                <th>Warehouse</th>
                                <th>Cost</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody id="items-body"></tbody>
                    </table>
                </div>
            </div>
        `;
        document.getElementById('add-item-btn').onclick = supplier.showAddItemModal;
        supplier.refreshItems();
    },

    refreshItems: async () => {
        const tbody = document.getElementById('items-body');
        if (!tbody) return;
        try {
            const [items, warehouses] = await Promise.all([api.supplier.getMyItems(), api.admin.getWarehouses()]);
            const whMap = Object.fromEntries(warehouses.map(w => [w.id, w]));

            tbody.innerHTML = items.map(item => {
                const wh = whMap[item.warehouse_id?._id || item.warehouse_id];
                const hasDefects = item.defects > 0;
                const isRejected = item.status === 'rejected';

                return `
                <tr>
                    <td>
                        ${item.name}
                        ${hasDefects ? `<div style="font-size: 0.7rem; color: var(--danger); margin-top: 4px;"><i class="fas fa-undo"></i> ${item.defects} units in Refund Storage</div>` : ''}
                        ${isRejected || hasDefects ? '' : ''}
                    </td>
                    <td>${item.quantity}</td>
                    <td>${item.length}m × ${item.width}m × ${item.height}m</td>
                    <td>${item.total_volume?.toFixed(2) || 'N/A'} m³</td>
                    <td class="warehouse-link" onclick="supplier.showWhDetail('${wh?.id}')">${wh?.name || 'N/A'}</td>
                    <td>$${item.storage_cost?.toFixed(2) || '0.00'}</td>
                    <td><span class="badge badge-${item.status}">${item.status}</span></td>
                    <td>
                        ${(item.status === 'accepted' && item.defects > 0) ? `<button class="btn btn-primary" onclick="supplier.pickup('${item.id}')" style="padding: 4px 10px; font-size: 0.8rem;">Pickup Refund</button>` : ''}
                        ${(item.status === 'shipped') ? `<button class="btn btn-danger" onclick="supplier.retrieve('${item.id}')" style="padding: 4px 10px; font-size: 0.8rem;"><i class="fas fa-undo"></i> Retrieve</button>` : ''}
                    </td>
                </tr>
            `}).join('');
        } catch (e) { notify(e.message, 'danger'); }
    },

    showWhDetail: async (id) => {
        if (!id || id === 'undefined') return;
        try {
            const wh = await api.admin.getWarehouses().then(list => list.find(w => w.id === id));
            if (!wh) return;
            modalTitle.textContent = `Warehouse: ${wh.name}`;
            modalBody.innerHTML = `
                <div class="glass" style="padding: 1.5rem; border-radius: 12px;">
                    <p><strong><i class="fas fa-location-dot"></i> Address:</strong> ${wh.address}</p>
                    <p style="margin-top: 10px;"><strong><i class="fas fa-expand"></i> Dimensions:</strong> ${wh.shelf_length} x ${wh.shelf_width} x ${wh.shelf_height}</p>
                </div>
            `;
            modalOverlay.classList.remove('hidden');
        } catch (e) { notify('Could not load info', 'danger'); }
    },

    showAddItemModal: async () => {
        modalTitle.textContent = 'Create Item Request';
        modalBody.innerHTML = `
            <div class="warning-box glass" style="margin-bottom: 1.5rem; padding: 1rem; border-left: 4px solid #f59e0b; font-size: 0.85rem;">
                <p><strong>⚠️ Storage Policy:</strong> If Quantity > 1, items are stored per piece and you pay for individual occupied space. If your item (like a sofa) has multiple parts but is delivered as 1 set, please indicate Quantity = 1.</p>
            </div>
            <form id="item-form">
                <div class="form-group">
                    <label>Item Name</label>
                    <input type="text" id="i-name" required>
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                    <div class="form-group">
                        <label>Quantity</label>
                        <input type="number" id="i-qty" min="1" value="1" required>
                    </div>
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
                <div class="form-group">
                    <label>Logistics Destination</label>
                    <select id="i-warehouse" required>
                        <option value="" disabled selected>— First enter item dimensions —</option>
                    </select>
                </div>
                <div id="cost-preview" style="margin-bottom: 1.5rem; font-weight: 600; color: var(--accent); border-radius: 8px; background: rgba(16,185,129,0.05); padding: 10px; text-align: center; border: 1px dashed var(--accent); display: none;"></div>
                
                <div style="display: flex; justify-content: center; align-items: center; gap: 12px; margin: 1.5rem 0; padding: 12px; border: 1px solid var(--glass-border); border-radius: 8px; background: rgba(255,255,255,0.02);">
                    <input type="checkbox" id="cost-confirmed" style="width: 18px; height: 18px; cursor: pointer; accent-color: var(--accent); margin: 0;">
                    <label for="cost-confirmed" style="font-size: 0.85rem; cursor: pointer; color: var(--text-main); font-weight: 500; margin: 0;">I acquired the information about the cost</label>
                </div>

                <button type="submit" id="submit-request-btn" class="btn btn-primary" style="width: 100%; transition: all 0.3s; opacity: 0.5; cursor: not-allowed; background: #334155; border: 1px solid #475569;" disabled>Submit Storage Request</button>
            </form>
        `;

        const inputs = ['i-l', 'i-w', 'i-h', 'i-qty'];
        const checkBtn = document.getElementById('cost-confirmed');
        const whSelect = document.getElementById('i-warehouse');
        const submitBtn = document.getElementById('submit-request-btn');

        const validateForm = () => {
            const isConfirmed = checkBtn.checked;
            const isWhSelected = whSelect.value && whSelect.value !== "" && whSelect.value !== "undefined";
            submitBtn.disabled = !(isConfirmed && isWhSelected);
            if (!submitBtn.disabled) {
                submitBtn.style.opacity = "1";
                submitBtn.style.cursor = "pointer";
                submitBtn.style.background = "var(--primary)";
                submitBtn.style.borderColor = "transparent";
            } else {
                submitBtn.style.opacity = "0.5";
                submitBtn.style.cursor = "not-allowed";
                submitBtn.style.background = "#334155";
                submitBtn.style.borderColor = "#475569";
            }
        };

        inputs.forEach(id => {
            document.getElementById(id).oninput = async () => {
                await supplier.updateMatchingWarehouses();
                validateForm();
            };
        });

        checkBtn.onchange = validateForm;
        whSelect.onchange = validateForm;

        document.getElementById('item-form').onsubmit = supplier.handleCreateItem;
        modalOverlay.classList.remove('hidden');
    },

    updateMatchingWarehouses: async () => {
        const l = document.getElementById('i-l').value;
        const w = document.getElementById('i-w').value;
        const h = document.getElementById('i-h').value;
        const qty = document.getElementById('i-qty').value;
        const select = document.getElementById('i-warehouse');
        const preview = document.getElementById('cost-preview');

        if (l && w && h) {
            const vol = l * w * h;
            const totalVol = qty > 1 ? vol * qty : vol;
            preview.style.display = "block";
            preview.textContent = `Estimated Storage Cost: $${(totalVol * 0.1).toFixed(2)} (${totalVol.toFixed(2)} m³ × $0.1/m³)`;

            try {
                const warehouses = await api.supplier.getMatchingWarehouses({ length: l, width: w, height: h });
                select.innerHTML = `<option value="" disabled selected>— Choose Target Node —</option>` +
                    (warehouses.map(wh => `<option value="${wh.id}">${wh.name} (${wh.address})</option>`).join('') || '<option value="">No matching warehouses</option>');
            } catch (e) { notify(e.message, 'danger'); }
        } else {
            preview.style.display = "none";
        }
    },

    handleCreateItem: async (e) => {
        e.preventDefault();
        try {
            const whId = document.getElementById('i-warehouse').value;
            if (!whId || whId === 'undefined') throw new Error('A suitable warehouse must be selected to proceed.');

            await api.supplier.createItem({
                name: document.getElementById('i-name').value,
                quantity: document.getElementById('i-qty').value,
                warehouse_id: whId,
                length: document.getElementById('i-l').value,
                width: document.getElementById('i-w').value,
                height: document.getElementById('i-h').value
            });
            modalOverlay.classList.add('hidden');
            supplier.renderInventory();
            notify('Request submitted', 'success');
        } catch (err) { notify(err.message, 'danger'); }
    },

    pickup: async (id) => {
        try {
            await api.supplier.pickupItem(id);
            notify('Marked for pickup', 'success');
            supplier.refreshItems();
        } catch (e) { notify(e.message, 'danger'); }
    },

    retrieve: async (id) => {
        if (!confirm('Are you sure you want to retrieve this shipped item? This action cannot be undone.')) return;
        try {
            await api.supplier.retrieveItem(id);
            notify('Item retrieved successfully', 'success');
            supplier.refreshItems();
        } catch (e) { notify(e.message, 'danger'); }
    }
};

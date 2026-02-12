const worker = {
    renderDashboard: async () => {
        const pending = await api.worker.getPending();
        const mainContent = document.getElementById('main-content');
        mainContent.innerHTML = `
            <div class="fade-in">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                    <h1>Pending Inspections</h1>
                     <span class="badge badge-shipped" style="cursor: pointer;" onclick="admin.showWhDetail('${state.user.warehouse_id}')">
                        <i class="fas fa-warehouse"></i> My Warehouse
                    </span>
                </div>
                <div class="table-container glass">
                    <table>
                        <thead>
                            <tr>
                                <th>Item Name</th>
                                <th>Expected Qty</th>
                                <th>Supplier Size</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${pending.map(item => `
                                <tr>
                                    <td>${item.name}</td>
                                    <td>${item.quantity}</td>
                                    <td>${item.length}x${item.width}x${item.height}</td>
                                    <td><span class="badge badge-${item.status}">${item.status}</span></td>
                                    <td>
                                        <button class="btn btn-primary" onclick="worker.showScanModal('${item.id}')" style="user-select: none;">Scan & Verify</button>
                                    </td>
                                </tr>
                            `).join('') || '<tr><td colspan="5" style="text-align:center">No pending items</td></tr>'}
                        </tbody>
                    </table>
                </div>

                <div style="margin-top: 3rem; display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                    <h1>Outgoing Shipments</h1>
                    <button class="btn btn-primary" onclick="worker.showOutgoingModal()" style="user-select: none;"><i class="fas fa-truck-ramp-box"></i> New Shipment</button>
                </div>
                <div id="worker-inventory-preview"></div>
            </div>
        `;
        worker.renderInventory();
    },

    renderInventory: async () => {
        const inv = await api.worker.getInventory();
        const container = document.getElementById('worker-inventory-preview');
        if (!container) return;
        container.innerHTML = `
            <div class="table-container glass">
                <table>
                    <thead>
                        <tr>
                            <th>Item Name</th>
                            <th>In Stock</th>
                            <th>Status</th>
                            <th>Volume</th>
                            <th>Last Modified</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${inv.map(item => `
                            <tr>
                                <td>
                                    ${item.name}
                                    ${item.defects > 0 ? `<div style="font-size: 0.7rem; color: var(--danger);"><i class="fas fa-undo"></i> ${item.defects} Refund Storage</div>` : ''}
                                    ${item.status === 'rejected' ? `<div class="warehouse-link" style="font-size: 0.7rem; color: var(--danger);" onclick="admin.showRejectionDetail('${item.id}')"><i class="fas fa-circle-exclamation"></i> Rejection Details</div>` : ''}
                                </td>
                                <td>${item.quantity}</td>
                                <td><span class="badge badge-${item.status}">${item.status}</span></td>
                                <td>${item.total_volume?.toFixed(2)}</td>
                                <td>${new Date(item.arrival_time || item.last_modified).toLocaleString()}</td>
                            </tr>
                        `).join('') || '<tr><td colspan="5" style="text-align:center">Empty inventory</td></tr>'}
                    </tbody>
                </table>
            </div>
        `;
    },

    showScanModal: async (id) => {
        const item = await api.worker.getPending().then(list => list.find(i => i.id === id));
        if (!item) return;

        modalTitle.textContent = 'Scan & Verify Item';
        modalBody.innerHTML = `
            <div class="glass" style="margin-bottom: 1rem; padding: 1rem; border-left: 4px solid var(--primary);">
                <p><strong>Expected:</strong> ${item.quantity} units</p>
            </div>
            <form id="scan-form">
                <div class="form-group">
                    <label>Action</label>
                    <select id="sc-status" required>
                        <option value="accepted">Accept Shipment</option>
                        <option value="rejected">Reject Entire Shipment</option>
                    </select>
                </div>
                <div id="accept-fields">
                    <div class="form-group">
                        <label>Confirm Quantity Received</label>
                        <input type="number" id="sc-qty" value="${item.quantity}" min="0">
                    </div>
                    <div class="form-group">
                        <label>Number of Defective Units (Auto-calculated)</label>
                        <input type="number" id="sc-defects" value="0" readonly style="background: rgba(255,255,255,0.05); color: var(--text-dim);">
                    </div>
                </div>
                <div id="defect-reason-fields" class="hidden">
                    <div class="form-group">
                        <label>Reason for Refund/Defects</label>
                        <textarea id="sc-defect-reason" placeholder="Describe the reason for marking items as defected..."></textarea>
                    </div>
                </div>
                <div id="reject-fields" class="hidden">
                    <div class="form-group">
                        <label>Reason for Entire Rejection</label>
                        <textarea id="sc-reason" placeholder="Why is this batch being returned?"></textarea>
                    </div>
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px;">
                    <div class="form-group">
                        <label>Length</label>
                        <input type="number" id="sc-l" value="${item.length}" required>
                    </div>
                    <div class="form-group">
                        <label>Width</label>
                        <input type="number" id="sc-w" value="${item.width}" required>
                    </div>
                    <div class="form-group">
                        <label>Height</label>
                        <input type="number" id="sc-h" value="${item.height}" required>
                    </div>
                </div>
                <button type="submit" class="btn btn-primary" style="width: 100%; user-select: none;">Submit Verification</button>
            </form>
        `;

        const statusSelect = document.getElementById('sc-status');
        const acceptDiv = document.getElementById('accept-fields');
        const rejectDiv = document.getElementById('reject-fields');
        const qtyInput = document.getElementById('sc-qty');
        const defectInput = document.getElementById('sc-defects');

        const defectReasonDiv = document.getElementById('defect-reason-fields');
        const defectReasonInput = document.getElementById('sc-defect-reason');

        statusSelect.onchange = () => {
            if (statusSelect.value === 'accepted') {
                acceptDiv.classList.remove('hidden');
                rejectDiv.classList.add('hidden');
                triggerDefectCheck();
            } else {
                acceptDiv.classList.add('hidden');
                rejectDiv.classList.remove('hidden');
                defectReasonDiv.classList.add('hidden');
            }
        };

        const triggerDefectCheck = () => {
            const confirmed = parseInt(qtyInput.value) || 0;
            const diff = item.quantity - confirmed;
            defectInput.value = Math.max(0, diff);
            if (diff > 0) defectReasonDiv.classList.remove('hidden');
            else defectReasonDiv.classList.add('hidden');
        };

        qtyInput.addEventListener('input', triggerDefectCheck);

        document.getElementById('scan-form').onsubmit = async (e) => {
            e.preventDefault();
            try {
                const isRejected = statusSelect.value === 'rejected';
                await api.worker.scanItem(id, {
                    status: statusSelect.value,
                    quantity: qtyInput.value,
                    defects: defectInput.value,
                    rejection_reason: isRejected ? document.getElementById('sc-reason').value : defectReasonInput.value,
                    length: document.getElementById('sc-l').value,
                    width: document.getElementById('sc-w').value,
                    height: document.getElementById('sc-h').value
                });
                modalOverlay.classList.add('hidden');
                notify('Inventory updated', 'success');
                worker.renderDashboard();
            } catch (err) { notify(err.message, 'danger'); }
        };
        modalOverlay.classList.remove('hidden');
    },

    showOutgoingModal: async () => {
        const inv = await api.worker.getInventory();
        modalTitle.textContent = 'Ship Items Out';
        modalBody.innerHTML = `
            <form id="outgoing-form">
                <div class="form-group">
                    <label>Select Item from Stock</label>
                    <select id="out-item" required>
                        ${inv.map(i => `<option value="${i.id}">${i.name} (Available: ${i.quantity})</option>`).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label>Quantity to Ship</label>
                    <input type="number" id="out-qty" min="1" required>
                </div>
                <button type="submit" class="btn btn-primary" style="width: 100%">Dispatch Item</button>
            </form>
        `;
        document.getElementById('outgoing-form').onsubmit = async (e) => {
            e.preventDefault();
            try {
                await api.worker.outgoingItem({
                    itemId: document.getElementById('out-item').value,
                    quantity: document.getElementById('out-qty').value
                });
                modalOverlay.classList.add('hidden');
                notify('Shipment successful', 'success');
                worker.renderDashboard();
            } catch (err) { notify(err.message, 'danger'); }
        };
        modalOverlay.classList.remove('hidden');
    }
};

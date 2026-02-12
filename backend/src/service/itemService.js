const { ItemRepository } = require('../repository');

class ItemService {
    async createItem(itemData) {
        const volume = itemData.length * itemData.width * itemData.height;
        const totalVolume = itemData.quantity > 1 ? volume * itemData.quantity : volume;
        const cost = totalVolume * 0.1; // Example rate

        return await ItemRepository.save({
            ...itemData,
            unit_volume: volume,
            total_volume: totalVolume,
            storage_cost: cost,
            status: 'pending',
            last_modified: new Date()
        });
    }

    async getAllItems() {
        return await ItemRepository.findAll();
    }

    async getItemsByWarehouse(warehouseId) {
        return await ItemRepository.find({ warehouse_id: warehouseId });
    }

    async getItemsBySupplier(supplierId) {
        return await ItemRepository.find({ user_id: supplierId });
    }

    async getItemById(id) {
        return await ItemRepository.findById(id);
    }

    async updateStatus(itemId, status) {
        const item = await ItemRepository.findById(itemId);
        if (!item) throw new Error('Item not found');
        return await ItemRepository.save({
            ...item.toObject(),
            status,
            last_modified: new Date()
        });
    }

    async pickupItem(itemId, userId) {
        const item = await ItemRepository.findById(itemId);
        if (!item) throw new Error('Item not found');

        const updated = await ItemRepository.save({
            ...item.toObject(),
            defects: 0,
            status: item.quantity === 0 ? 'shipped' : 'accepted',
            last_modified: new Date()
        });

        const { AuditLog } = require('../repository');
        await AuditLog.create({
            action: 'ITEM_PICKED_UP',
            performedBy: userId,
            details: { itemId, name: item.name, msg: 'Supplier picked up refund/stock' }
        });

        return updated;
    }

    async scanItem(itemId, scanData, userId) {
        const item = await ItemRepository.findById(itemId);
        if (!item) throw new Error('Item not found');

        const isRejected = scanData.status === 'rejected';
        const status = isRejected ? 'rejected' : 'accepted';

        const goodQty = isRejected ? item.quantity : Number(scanData.quantity);
        const totalVolume = item.unit_volume * goodQty;

        const updated = await ItemRepository.save({
            ...item.toObject(),
            ...scanData,
            status,
            quantity: goodQty,
            total_volume: totalVolume,
            storage_cost: totalVolume * 0.1,
            scanned_by: userId,
            arrival_time: new Date(),
            last_modified: new Date()
        });

        const { AuditLog } = require('../repository');
        await AuditLog.create({
            action: isRejected ? 'ITEM_REJECTED' : 'ITEM_SCANNED',
            performedBy: userId,
            details: {
                itemId,
                name: item.name,
                accepted: isRejected ? 0 : Number(scanData.quantity),
                refund: isRejected ? item.quantity : Number(scanData.defects),
                remaining: isRejected ? 0 : goodQty,
                reason: scanData.rejection_reason
            }
        });

        return updated;
    }

    async outgoingItem(itemId, quantity, userId) {
        const item = await ItemRepository.findById(itemId);
        if (!item) throw new Error('Item not found');
        if (item.quantity < quantity) throw new Error('Not enough stock');

        const newQuantity = item.quantity - quantity;
        const totalVolume = item.unit_volume * newQuantity;

        const updated = await ItemRepository.save({
            ...item.toObject(),
            quantity: newQuantity,
            total_volume: totalVolume,
            storage_cost: totalVolume * 0.1,
            shipped_by: userId,
            last_modified: new Date(),
            outgoing_time: new Date()
        });

        const { AuditLog } = require('../repository');
        await AuditLog.create({
            action: 'ITEM_SHIPPED',
            performedBy: userId,
            details: { itemId, name: item.name, quantityShipped: quantity, remaining: newQuantity }
        });

        return updated;
    }

    async deleteItem(itemId, userId) {
        const item = await ItemRepository.findById(itemId);
        if (!item) throw new Error('Item not found');

        const { AuditLog } = require('../repository');
        await AuditLog.create({
            action: 'ITEM_DELETED',
            performedBy: userId,
            details: { itemId, name: item.name, msg: 'Item removed from system' }
        });

        return await ItemRepository.delete(itemId);
    }
}

module.exports = new ItemService();

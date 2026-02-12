const { ItemRepository } = require('../repository');

class ItemService {
    async createItem(itemData) {
        return await ItemRepository.save({
            ...itemData,
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

    async deleteItem(itemId) {
        return await ItemRepository.delete(itemId);
    }
}

module.exports = new ItemService();

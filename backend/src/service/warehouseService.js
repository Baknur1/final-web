const { WarehouseRepository, UserRepository } = require('../repository');

class WarehouseService {
    async createWarehouse(warehouseData) {
        return await WarehouseRepository.save(warehouseData);
    }

    async getAllWarehouses() {
        return await WarehouseRepository.findAll();
    }

    async getWarehouseById(id) {
        return await WarehouseRepository.findById(id);
    }

    async deleteWarehouse(id) {
        return await WarehouseRepository.delete(id);
    }

    async registerStaff(staffData) {
        return await UserRepository.save(staffData);
    }

    async getMatchingWarehouses(dimensions) {
        const warehouses = await WarehouseRepository.findAll();
        return warehouses.filter(w =>
            w.shelf_length >= dimensions.length &&
            w.shelf_width >= dimensions.width &&
            w.shelf_height >= dimensions.height
        );
    }
}

module.exports = new WarehouseService();

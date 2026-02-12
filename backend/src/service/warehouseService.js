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
}

module.exports = new WarehouseService();

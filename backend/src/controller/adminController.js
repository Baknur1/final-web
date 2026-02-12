const WarehouseService = require('../service/warehouseService');
const ItemService = require('../service/itemService');
const AuthService = require('../service/authService');
const { UserRepository } = require('../repository');

class AdminController {
    // Warehouse Management
    async createWarehouse(req, res) {
        try {
            const warehouse = await WarehouseService.createWarehouse(req.body);
            res.status(201).json(warehouse);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async deleteWarehouse(req, res) {
        try {
            await WarehouseService.deleteWarehouse(req.params.id);
            res.status(204).send();
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async getAllWarehouses(req, res) {
        try {
            const warehouses = await WarehouseService.getAllWarehouses();
            res.json(warehouses);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    // Manager Registration
    async registerManager(req, res) {
        try {
            const manager = await AuthService.register({
                ...req.body,
                role: 'manager'
            });
            res.status(201).json(manager);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    // Monitoring
    async getAllItems(req, res) {
        try {
            const items = await ItemService.getAllItems();
            res.json(items);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async getAllUsers(req, res) {
        try {
            const usersList = await UserRepository.findAll();
            const users = usersList.map(u => {
                const userObj = u.toObject ? u.toObject() : u;
                const { password, ...user } = userObj;
                return user;
            });
            res.json(users);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
}

module.exports = new AdminController();

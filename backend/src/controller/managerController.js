const ItemService = require('../service/itemService');
const AuthService = require('../service/authService');
const { UserRepository, WarehouseRepository } = require('../repository');

class ManagerController {
    async registerWorker(req, res) {
        try {
            const warehouse_id = req.user.role === 'super_admin' ? req.body.warehouse_id : req.user.warehouse_id;

            const worker = await AuthService.register({
                ...req.body,
                role: 'worker',
                warehouse_id
            });
            res.status(201).json(worker);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async getWarehouseStaff(req, res) {
        try {
            const staffList = await UserRepository.find({
                warehouse_id: req.user.warehouse_id,
                role: 'worker'
            });
            const staff = staffList.map(u => {
                const userObj = u.toObject ? u.toObject() : u;
                const { password, ...user } = userObj;
                return user;
            });
            res.json(staff);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async getWarehouseItems(req, res) {
        try {
            const items = await ItemService.getItemsByWarehouse(req.user.warehouse_id);
            res.json(items);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async deleteItem(req, res) {
        try {
            const item = await ItemService.getItemById(req.params.id);
            if (!item || item.warehouse_id.toString() !== req.user.warehouse_id.toString()) {
                return res.status(403).json({ message: 'Forbidden: Item not in your warehouse' });
            }
            await ItemService.deleteItem(req.params.id, req.user.id);
            res.status(204).send();
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async getMyWarehouse(req, res) {
        try {
            const warehouse = await WarehouseRepository.findById(req.user.warehouse_id);
            res.json(warehouse);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async deleteWorker(req, res) {
        try {
            const worker = await UserRepository.findById(req.params.id);
            if (!worker || worker.warehouse_id.toString() !== req.user.warehouse_id.toString()) {
                return res.status(403).json({ message: 'Forbidden: Worker not in your warehouse' });
            }
            await UserRepository.delete(req.params.id);
            res.status(204).send();
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
}

module.exports = new ManagerController();

const ItemService = require('../service/itemService');
const WarehouseService = require('../service/warehouseService');

class SupplierController {
    async createItemRequest(req, res) {
        try {
            const item = await ItemService.createItem({
                ...req.body,
                user_id: req.user.id
            });
            res.status(201).json(item);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async getMatchingWarehouses(req, res) {
        try {
            const { length, width, height } = req.query;
            const warehouses = await WarehouseService.getMatchingWarehouses({
                length: Number(length),
                width: Number(width),
                height: Number(height)
            });
            res.json(warehouses);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async getMyItems(req, res) {
        try {
            const items = await ItemService.getItemsBySupplier(req.user.id);
            res.json(items);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async getItemById(req, res) {
        try {
            const item = await ItemService.getItemById(req.params.id);
            if (!item) return res.status(404).json({ message: 'Item not found' });
            res.json(item);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async pickupItem(req, res) {
        try {
            const item = await ItemService.getItemById(req.params.id);
            if (!item) return res.status(404).json({ message: 'Item not found' });

            const itemUserId = item.user_id._id ? item.user_id._id.toString() : item.user_id.toString();
            if (itemUserId !== req.user.id) {
                return res.status(403).json({ message: 'Forbidden: This is not your item' });
            }

            await ItemService.pickupItem(req.params.id, req.user.id);
            res.json({ message: 'Pickup processed' });
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
}

module.exports = new SupplierController();

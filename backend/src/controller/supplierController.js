const ItemService = require('../service/itemService');

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

    async getMyItems(req, res) {
        try {
            const items = await ItemService.getItemsBySupplier(req.user.id);
            res.json(items);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async pickupItem(req, res) {
        try {
            const item = await ItemService.getItemById(req.params.id);
            if (!item || item.user_id !== req.user.id) {
                return res.status(403).json({ message: 'Forbidden: This is not your item' });
            }
            // Update status to shipped or delete
            const updated = await ItemService.updateStatus(req.params.id, 'shipped');
            res.json(updated);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
}

module.exports = new SupplierController();

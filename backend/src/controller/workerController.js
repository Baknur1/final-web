const ItemService = require('../service/itemService');

class WorkerController {
    async getPendingItems(req, res) {
        try {
            const items = await ItemService.getItemsByWarehouse(req.user.warehouse_id);
            const pending = items.filter(item => item.status === 'pending');
            res.json(pending);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async scanItem(req, res) {
        try {
            const item = await ItemService.getItemById(req.params.id);
            const itemWhId = item.warehouse_id._id ? item.warehouse_id._id.toString() : item.warehouse_id.toString();
            if (!item || itemWhId !== req.user.warehouse_id.toString()) {
                return res.status(403).json({ message: 'Forbidden: Item not for your warehouse' });
            }
            const updated = await ItemService.scanItem(req.params.id, req.body, req.user.id);
            res.json(updated);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async outgoingItem(req, res) {
        try {
            const { itemId, quantity } = req.body;
            const item = await ItemService.getItemById(itemId);
            const itemWhId = item.warehouse_id._id ? item.warehouse_id._id.toString() : item.warehouse_id.toString();
            if (!item || itemWhId !== req.user.warehouse_id.toString()) {
                return res.status(403).json({ message: 'Forbidden: Item not in your warehouse' });
            }
            const updated = await ItemService.outgoingItem(itemId, quantity, req.user.id);
            res.json(updated);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async getInventory(req, res) {
        try {
            const items = await ItemService.getItemsByWarehouse(req.user.warehouse_id);
            const accepted = items.filter(item => item.status === 'accepted');
            res.json(accepted);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
}

module.exports = new WorkerController();

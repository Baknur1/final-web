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

    async updateItemStatus(req, res) {
        try {
            const item = await ItemService.getItemById(req.params.id);
            if (!item || item.warehouse_id !== req.user.warehouse_id) {
                return res.status(403).json({ message: 'Forbidden: Item not in your warehouse' });
            }

            const { status } = req.body; // 'accepted' or 'rejected'
            const updated = await ItemService.updateStatus(req.params.id, status);
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

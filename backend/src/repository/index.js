const User = require('../models/User');
const Warehouse = require('../models/Warehouse');
const Item = require('../models/Item');
const Category = require('../models/Category');
const AuditLog = require('../models/AuditLog');

class UserRepository {
    async findAll() { return await User.find(); }
    async findById(id) { return await User.findById(id); }
    async findOne(query) { return await User.findOne(query); }
    async find(query) { return await User.find(query); }
    async delete(id) { return await User.findByIdAndDelete(id); }
    async save(userData) {
        if (userData._id || userData.id) {
            const id = userData._id || userData.id;
            return await User.findByIdAndUpdate(id, userData, { new: true });
        }
        return await User.create(userData);
    }
}

class WarehouseRepository {
    async findAll() { return await Warehouse.find(); }
    async findById(id) { return await Warehouse.findById(id); }
    async save(data) {
        if (data._id || data.id) {
            const id = data._id || data.id;
            return await Warehouse.findByIdAndUpdate(id, data, { new: true });
        }
        return await Warehouse.create(data);
    }
    async delete(id) { return await Warehouse.findByIdAndDelete(id); }
}

class ItemRepository {
    async findAll() { return await Item.find().populate('user_id warehouse_id scanned_by').populate({ path: 'scanned_by', populate: { path: 'warehouse_id' } }); }
    async findById(id) { return await Item.findById(id).populate('user_id warehouse_id scanned_by').populate({ path: 'scanned_by', populate: { path: 'warehouse_id' } }); }
    async find(query) { return await Item.find(query).populate('user_id warehouse_id scanned_by').populate({ path: 'scanned_by', populate: { path: 'warehouse_id' } }); }
    async save(data) {
        if (data._id || data.id) {
            const id = data._id || data.id;
            return await Item.findByIdAndUpdate(id, data, { new: true });
        }
        return await Item.create(data);
    }
    async delete(id) { return await Item.findByIdAndDelete(id); }
}

module.exports = {
    UserRepository: new UserRepository(),
    WarehouseRepository: new WarehouseRepository(),
    ItemRepository: new ItemRepository(),
    User, Warehouse, Item, Category, AuditLog
};

const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
    name: { type: String, required: true },
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Supplier
    warehouse_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse', required: true },
    category_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    quantity: { type: Number, required: true },
    length: { type: Number, required: true },
    width: { type: Number, required: true },
    height: { type: Number, required: true },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected', 'shipped'],
        default: 'pending'
    },
    last_modified: { type: Date, default: Date.now }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

module.exports = mongoose.model('Item', itemSchema);

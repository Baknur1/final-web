const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
    name: { type: String, required: true },
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    warehouse_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse', required: true },
    category_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    quantity: { type: Number, required: true },
    length: { type: Number, required: true },
    width: { type: Number, required: true },
    height: { type: Number, required: true },
    unit_volume: { type: Number },
    total_volume: { type: Number },
    storage_cost: { type: Number },
    defects: { type: Number, default: 0 },
    arrival_time: { type: Date },
    outgoing_time: { type: Date },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected', 'shipped'],
        default: 'pending'
    },
    shipped_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    scanned_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    rejection_reason: { type: String },
    last_modified: { type: Date, default: Date.now }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

module.exports = mongoose.model('Item', itemSchema);

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
        type: String,
        enum: ['super_admin', 'manager', 'worker', 'supplier'],
        default: 'supplier'
    },
    warehouse_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse' },
    createdAt: { type: Date, default: Date.now }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

module.exports = mongoose.model('User', userSchema);

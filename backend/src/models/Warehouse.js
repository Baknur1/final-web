const mongoose = require('mongoose');

const warehouseSchema = new mongoose.Schema({
    name: { type: String, required: true },
    address: { type: String, required: true },
    shelf_length: { type: Number, required: true },
    shelf_width: { type: Number, required: true },
    shelf_height: { type: Number, required: true },
    shelf_volume: { type: Number }, // Calculated individual shelf volume
    createdAt: { type: Date, default: Date.now }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

warehouseSchema.pre('save', function () {
    this.shelf_volume = this.shelf_length * this.shelf_width * this.shelf_height;
});

module.exports = mongoose.model('Warehouse', warehouseSchema);

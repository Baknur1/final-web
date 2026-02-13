const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true, 
        unique: true,
        validate: {
            validator: function(v) {
                return v && !v.startsWith('-') && v.trim().length > 0;
            },
            message: 'Name cannot start with "-" or be empty'
        }
    },
    description: { 
        type: String,
        validate: {
            validator: function(v) {
                if (!v) return true; // описание опциональное
                return !v.startsWith('-') && v.trim().length > 0;
            },
            message: 'Description cannot start with "-" or be empty'
        }
    }
});

module.exports = mongoose.model('Category', categorySchema);

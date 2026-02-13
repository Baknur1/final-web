const app = require('./app');
const mongoose = require('mongoose');
const User = require('./src/models/User');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/nexus_wms';

const startServer = async () => {
    try {
        await mongoose.connect(MONGO_URI);

        const adminEmail = 'admin@admin.com';
        const existingAdmin = await User.findOne({ email: adminEmail });

        if (!existingAdmin) {
            const hashedPassword = await bcrypt.hash('admin123', 10);
            await User.create({
                username: 'Super Admin',
                email: adminEmail,
                password: hashedPassword,
                role: 'super_admin'
            });
        }

        app.listen(PORT, () => {
        });
    } catch (error) {
        console.error('Server startup error:', error);
        process.exit(1);
    }
};

startServer();
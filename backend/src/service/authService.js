const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { UserRepository } = require('../repository');

class AuthService {
    async register(userData) {
        const existingUser = await UserRepository.findOne({ email: userData.email });
        if (existingUser) {
            throw new Error('User already exists');
        }

        const cleanedData = { ...userData };
        if (cleanedData.warehouse_id === 'undefined' || cleanedData.warehouse_id === 'null' || !cleanedData.warehouse_id) {
            delete cleanedData.warehouse_id;
        }

        const hashedPassword = await bcrypt.hash(cleanedData.password, 10);
        const user = await UserRepository.save({
            ...cleanedData,
            password: hashedPassword,
            role: cleanedData.role || 'supplier'
        });

        const userObj = user.toObject({ virtuals: true });
        const { password, ...userWithoutPassword } = userObj;
        return userWithoutPassword;
    }

    async login(email, password) {
        const user = await UserRepository.findOne({ email });
        if (!user) {
            throw new Error('Invalid credentials');
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            throw new Error('Invalid credentials');
        }

        const token = jwt.sign(
            {
                id: user._id,
                role: user.role,
                warehouse_id: user.warehouse_id,
                username: user.username
            },
            process.env.JWT_SECRET || 'supersecretkey123',
            { expiresIn: '24h' }
        );

        const userObj = user.toObject ? user.toObject() : user;
        const { password: _, ...userWithoutPassword } = userObj;
        return { user: userWithoutPassword, token };
    }

    async getProfile(userId) {
        const user = await UserRepository.findById(userId);
        if (!user) throw new Error('User not found');
        const userObj = user.toObject ? user.toObject() : user;
        const { password, ...userWithoutPassword } = userObj;
        return userWithoutPassword;
    }

    async updateProfile(userId, updateData) {
        const user = await UserRepository.findById(userId);
        if (!user) throw new Error('User not found');

        if (updateData.password) {
            updateData.password = await bcrypt.hash(updateData.password, 10);
        }

        const updated = await UserRepository.save({ ...user.toObject(), ...updateData });
        const userObj = updated.toObject ? updated.toObject() : updated;
        const { password, ...userWithoutPassword } = userObj;
        return userWithoutPassword;
    }
}

module.exports = new AuthService();

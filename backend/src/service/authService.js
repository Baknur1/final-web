const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { UserRepository } = require('../repository');
const SALT_ROUNDS = 12;
const FAILED_ATTEMPTS = new Map();
const MAX_FAILED_ATTEMPTS = 7;
const LOCK_DURATION_MS = 5 * 60 * 1000; // 5 minutes

class AuthService {
    async register(userData) {
        const existingUser = await UserRepository.findOne({ email: userData.email });
        if (existingUser) {
            throw new Error('User already exists');
        }

        const cleanedData = { ...userData };
        const role = cleanedData.role || 'supplier';

        if ((role === 'manager' || role === 'worker') && (!cleanedData.warehouse_id || ['undefined', 'null', ''].includes(cleanedData.warehouse_id))) {
            throw new Error('Warehouse assignment is mandatory for staff members');
        }

        if (['undefined', 'null', '', undefined].includes(cleanedData.warehouse_id)) {
            delete cleanedData.warehouse_id;
        }

        const hashedPassword = await bcrypt.hash(cleanedData.password, SALT_ROUNDS);
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
        const key = (email || '').toString().toLowerCase();
        const record = FAILED_ATTEMPTS.get(key) || { count: 0, lockedUntil: 0 };
        if (record.lockedUntil && record.lockedUntil > Date.now()) {
            const mins = Math.ceil((record.lockedUntil - Date.now()) / 60000);
            throw new Error(`Too many failed attempts. Please wait ${mins} minute(s)`);
        }

        const user = await UserRepository.findOne({ email });
        if (!user) {
            // increment failed attempts for unknown user/email
            const next = { count: (record.count || 0) + 1, lockedUntil: 0 };
            if (next.count >= MAX_FAILED_ATTEMPTS) {
                next.lockedUntil = Date.now() + LOCK_DURATION_MS;
                next.count = 0;
            }
            FAILED_ATTEMPTS.set(key, next);
            throw new Error('Invalid credentials');
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            // increment failed attempts
            const next = { count: (record.count || 0) + 1, lockedUntil: 0 };
            if (next.count >= MAX_FAILED_ATTEMPTS) {
                next.lockedUntil = Date.now() + LOCK_DURATION_MS;
                next.count = 0;
            }
            FAILED_ATTEMPTS.set(key, next);
            throw new Error('Invalid credentials');
        }

        // successful login - reset attempts
        if (FAILED_ATTEMPTS.has(key)) FAILED_ATTEMPTS.delete(key);

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
            updateData.password = await bcrypt.hash(updateData.password, SALT_ROUNDS);
        }

        const updated = await UserRepository.save({ ...user.toObject(), ...updateData });
        const userObj = updated.toObject ? updated.toObject() : updated;
        const { password, ...userWithoutPassword } = userObj;
        return userWithoutPassword;
    }
}

module.exports = new AuthService();

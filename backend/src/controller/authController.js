const AuthService = require('../service/authService');

class AuthController {
    async register(req, res) {
        try {
            const user = await AuthService.register(req.body);
            res.status(201).json(user);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async login(req, res) {
        try {
            const { email, password } = req.body;
            const result = await AuthService.login(email, password);
            res.json(result);
        } catch (error) {
            res.status(401).json({ message: error.message });
        }
    }

    async getProfile(req, res) {
        try {
            const user = await AuthService.getProfile(req.user.id);
            res.json(user);
        } catch (error) {
            res.status(404).json({ message: error.message });
        }
    }

    async updateProfile(req, res) {
        try {
            const user = await AuthService.updateProfile(req.user.id, req.body);
            res.json(user);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
}

module.exports = new AuthController();

const authService = require('../services/authServices');

const register = async (req, res) => {
    try {
        const user = await authService.registrarUsuario(req.body);
        res.status(201).json({ message: 'Usuario Registrado', user: { email: user.useremail, id: user.id } });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

const login = async (req, res) => {
    try {
        const { useremail, userpswd } = req.body;
        const token = await authService.loginUser(useremail, userpswd);
        res.json({ token });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

module.exports = { register, login };

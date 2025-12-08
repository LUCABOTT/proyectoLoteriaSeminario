const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization']; 
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
        console.warn('auth middleware - No se proporcionó token');
        return res.status(401).json({ 
            error: 'Token no proporcionado. Usuario no autenticado.',
            requiresLogin: true 
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        console.log('auth middleware - Usuario autenticado:', decoded.IdUsuario || decoded.id);
        next();
    } catch (err) {
        console.warn('auth middleware - Token inválido o expirado:', err.message);
        return res.status(401).json({ 
            error: 'Token inválido o expirado. Por favor inicia sesión nuevamente.',
            requiresLogin: true 
        });
    }
};

module.exports = authenticateToken;

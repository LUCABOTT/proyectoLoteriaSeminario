const RolesUsuarios = require('../modelos/modelosUsuarios/roles_usuarios');
const FuncionesRoles = require('../modelos/modelosUsuarios/funciones_roles');

// Middleware que recibe el código de función requerida
const checkRoleAccess = async (req, res, next) => {
    try {
        const userId = req.user.id; // viene de authenticateToken
        const ruta = req.originalUrl; // la ruta que se está intentando acceder

        // Obtener roles activos del usuario
        const rolesUsuarios = await RolesUsuarios.findAll({
            where: { usercod: userId, roleuserest: 'AC' }
        });
        const roles = rolesUsuarios.map(r => r.rolescod);

        // Obtener funciones activas para esos roles
        const funcionesRoles = await FuncionesRoles.findAll({
            where: { rolescod: roles, fnrolest: 'AC' }
        });
        const rutasPermitidas = funcionesRoles.map(fr => fr.fncod);

        if (!rutasPermitidas.includes(ruta)) {
            return res.status(403).json({ message: 'Acceso denegado' });
        }

        next();
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error verificando permisos' });
    }
};

module.exports = checkRoleAccess;
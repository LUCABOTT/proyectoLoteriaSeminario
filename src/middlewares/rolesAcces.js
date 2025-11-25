const { Op } = require('sequelize');
const Usuarios = require('../modelos/modelosUsuarios/usuarios');
const RolesUsuarios = require('../modelos/modelosUsuarios/roles_usuarios');
const Roles = require('../modelos/modelosUsuarios/roles');
const FuncionesRoles = require('../modelos/modelosUsuarios/funciones_roles');
const Funciones = require('../modelos/modelosUsuarios/funciones');

const checkRoleAccess = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const rutaLimpia = req.originalUrl.split('?')[0];

        // 0️⃣ VALIDAR USUARIO
        const usuario = await Usuarios.findByPk(userId);
        if (!usuario) return res.status(404).json({ message: 'Usuario no encontrado' });

        if (usuario.userest === 'BL')
            return res.status(403).json({ message: 'Usuario bloqueado' });

        if (usuario.userest === 'IN')
            return res.status(403).json({ message: 'Usuario inactivo' });

        // 1️⃣ OBTENER ROLES ACTIVOS DEL USUARIO
        const rolesUsuarios = await RolesUsuarios.findAll({
            where: { 
                usercod: userId, 
                roleuserest: 'AC' 
            }
        });

        const rolesActivos = rolesUsuarios.map(r => r.rolescod);

        if (rolesActivos.length === 0) {
            return res.status(403).json({
                message: 'No tiene roles activos'
            });
        }

        // ❗ VALIDAR QUE EL ROL MISMO ESTÉ ACTIVO
        const rolesValidos = await Roles.findAll({
            where: {
                rolescod: { [Op.in]: rolesActivos },
                rolesest: 'AC'
            }
        });

        if (rolesValidos.length === 0) {
            return res.status(403).json({
                message: 'rol inactivos o bloqueados'
            });
        }

        const rolesFinales = rolesValidos.map(r => r.rolescod);

        // 2️⃣ VALIDAR FUNCIÓN DE LA RUTA
        const funcion = await Funciones.findOne({
            where: { fncod: rutaLimpia }
        });

        if (!funcion)
            return res.status(404).json({ message: 'Función no registrada' });

        if (funcion.fnest === 'IN')
            return res.status(403).json({ message: 'Función inactiva' });

        if (funcion.fnest === 'BL')
            return res.status(403).json({ message: 'Función bloqueada' });

        // 3️⃣ VALIDAR PERMISOS DEL ROL PARA ESA FUNCIÓN
        const permiso = await FuncionesRoles.findOne({
            where: {
                fncod: rutaLimpia,
                rolescod: { [Op.in]: rolesFinales },
                fnrolest: 'AC'
            }
        });

        if (!permiso) {
            return res.status(403).json({
                message: 'Acceso denegado: su rol no tiene permiso para esta función'
            });
        }

        // 🚀 SI LLEGÓ AQUÍ → TODO OK
        next();

    } catch (err) {
        console.error('ERROR EN checkRoleAccess:', err);
        res.status(500).json({
            message: 'Error verificando permisos',
            error: err.message
        });
    }
};

module.exports = checkRoleAccess;
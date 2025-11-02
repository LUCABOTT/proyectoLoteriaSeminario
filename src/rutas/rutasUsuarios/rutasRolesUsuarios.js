const { Router } = require('express');
const { body } = require('express-validator');
const controladorRolesUsuarios = require('../../controladores/controladorUsuario/controladorRolesUsuarios');

const rutas = Router();

// 🔹 Listar todos los roles de usuarios
rutas.get('/listar', controladorRolesUsuarios.listar);

// 🔹 Crear rol de usuario
rutas.post(
  '/guardar',
  [
    body('usercod')
      .notEmpty()
      .withMessage('El campo "usercod" es obligatorio.')
      .isInt()
      .withMessage('El campo "usercod" debe ser un número entero.'),

    body('rolescod')
      .notEmpty()
      .withMessage('El campo "rolescod" es obligatorio.')
      .isString()
      .withMessage('El campo "rolescod" debe ser una cadena de texto.'),

    body('roleuserest')
      .optional()
      .isIn(['AC', 'IN', 'BL'])
      .withMessage('Solo se permiten los valores "AC", "IN" o "BL".')
  ],
  controladorRolesUsuarios.guardar
);

// 🔹 Editar rol de usuario
rutas.put(
  '/editar',
  [
    body('usercod')
      .notEmpty()
      .withMessage('El campo "usercod" es obligatorio.')
      .isInt()
      .withMessage('El campo "usercod" debe ser un número entero.'),

    body('rolescod')
      .notEmpty()
      .withMessage('El campo "rolescod" es obligatorio.')
      .isString()
      .withMessage('El campo "rolescod" debe ser una cadena de texto.'),

    body('roleuserest')
      .optional()
      .isIn(['AC', 'IN', 'BL'])
      .withMessage('Solo se permiten los valores "AC", "IN" o "BL".'),

    body('roleuserfch')
      .optional()
      .isISO8601()
      .withMessage('La fecha "roleuserfch" debe tener formato válido.'),

    body('roleuserexp')
      .optional()
      .isISO8601()
      .withMessage('La fecha "roleuserexp" debe tener formato válido.')
  ],
  controladorRolesUsuarios.editar
);

// 🔹 Eliminar rol de usuario
rutas.delete(
  '/eliminar',
  [
    body('usercod')
      .notEmpty()
      .withMessage('El campo "usercod" es obligatorio.')
      .isInt()
      .withMessage('El campo "usercod" debe ser un número entero.'),

    body('rolescod')
      .notEmpty()
      .withMessage('El campo "rolescod" es obligatorio.')
      .isString()
      .withMessage('El campo "rolescod" debe ser una cadena de texto.')
  ],
  controladorRolesUsuarios.eliminar
);

module.exports = rutas;

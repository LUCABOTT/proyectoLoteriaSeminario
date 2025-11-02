const { Router } = require('express');
const { body } = require('express-validator');
const controladorFuncionesRoles = require('../../controladores/controladorUsuario/controladorFuncionesRoles');

const rutas = Router();

// 🔹 Listar todas las funciones por rol
rutas.get('/listar', controladorFuncionesRoles.listar);

// 🔹 Asignar función a rol
rutas.post(
  '/guardar',
  [
    body('rolescod')
      .notEmpty()
      .withMessage('El campo "rolescod" es obligatorio.')
      .isString()
      .withMessage('El campo "rolescod" debe ser una cadena de texto.'),

    body('fncod')
      .notEmpty()
      .withMessage('El campo "fncod" es obligatorio.')
      .isString()
      .withMessage('El campo "fncod" debe ser una cadena de texto.'),

    body('fnrolest')
      .optional()
      .isIn(['AC', 'IN', 'BL'])
      .withMessage('Solo se permiten los valores "AC", "IN" o "BL".'),

    body('fnexp')
      .optional()
      .isISO8601()
      .withMessage('La fecha "fnexp" debe tener formato válido.')
  ],
  controladorFuncionesRoles.guardar
);

// 🔹 Editar función asignada a rol
rutas.put(
  '/editar',
  [
    body('rolescod')
      .notEmpty()
      .withMessage('El campo "rolescod" es obligatorio.')
      .isString()
      .withMessage('El campo "rolescod" debe ser una cadena de texto.'),

    body('fncod')
      .notEmpty()
      .withMessage('El campo "fncod" es obligatorio.')
      .isString()
      .withMessage('El campo "fncod" debe ser una cadena de texto.'),

    body('fnrolest')
      .optional()
      .isIn(['AC', 'IN', 'BL'])
      .withMessage('Solo se permiten los valores "AC", "IN" o "BL".'),

    body('fnexp')
      .optional()
      .isISO8601()
      .withMessage('La fecha "fnexp" debe tener formato válido.')
  ],
  controladorFuncionesRoles.editar
);

// 🔹 Eliminar función de rol
rutas.delete(
  '/eliminar',
  [
    body('rolescod')
      .notEmpty()
      .withMessage('El campo "rolescod" es obligatorio.')
      .isString()
      .withMessage('El campo "rolescod" debe ser una cadena de texto.'),

    body('fncod')
      .notEmpty()
      .withMessage('El campo "fncod" es obligatorio.')
      .isString()
      .withMessage('El campo "fncod" debe ser una cadena de texto.')
  ],
  controladorFuncionesRoles.eliminar
);

module.exports = rutas;

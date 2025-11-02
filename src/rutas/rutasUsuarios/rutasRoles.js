const { Router } = require('express');
const { body } = require('express-validator');
const controladorRoles = require('../../controladores/controladorUsuario/controladorRoles');

const rutas = Router();

// 🔹 Listar todos los roles
rutas.get('/listar', controladorRoles.listar);

// 🔹 Crear rol
rutas.post(
  '/guardar',
  [
    body('rolescod')
      .notEmpty()
      .withMessage('El campo "rolescod" es obligatorio.')
      .isLength({ max: 128 })
      .withMessage('El código del rol debe tener máximo 128 caracteres.'),

    body('rolesdsc')
      .optional()
      .isLength({ max: 45 })
      .withMessage('La descripción debe tener máximo 45 caracteres.'),

    body('rolesest')
      .optional()
      .isIn(['AC', 'IN', 'BL'])
      .withMessage('Solo se permiten los valores "AC", "IN" o "BL".')
  ],
  controladorRoles.guardar
);

// 🔹 Editar rol
rutas.put(
  '/editar',
  [
    body('rolescod')
      .notEmpty()
      .withMessage('El código del rol "rolescod" es obligatorio.'),

    body('rolesdsc')
      .optional()
      .isLength({ max: 45 })
      .withMessage('La descripción debe tener máximo 45 caracteres.'),

    body('rolesest')
      .optional()
      .isIn(['AC', 'IN', 'BL'])
      .withMessage('Solo se permiten los valores "AC", "IN" o "BL".')
  ],
  controladorRoles.editar
);

// 🔹 Eliminar rol
rutas.delete(
  '/eliminar',
  [
    body('rolescod')
      .notEmpty()
      .withMessage('El código del rol "rolescod" es obligatorio.')
  ],
  controladorRoles.eliminar
);

module.exports = rutas;

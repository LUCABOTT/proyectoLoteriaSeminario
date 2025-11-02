const { Router } = require('express');
const { body } = require('express-validator');
const controladorFunciones = require('../../controladores/controladorUsuario/controladorFunciones');

const rutas = Router();

// 🔹 Listar todas las funciones
rutas.get('/listar', controladorFunciones.listar);

// 🔹 Crear función
rutas.post(
  '/guardar',
  [
    body('fncod')
      .notEmpty()
      .withMessage('El campo "fncod" es obligatorio.')
      .isString()
      .withMessage('El campo "fncod" debe ser una cadena de texto.'),

    body('fndsc')
      .optional()
      .isLength({ max: 255 })
      .withMessage('La descripción debe tener máximo 255 caracteres.'),

    body('fnest')
      .optional()
      .isIn(['AC', 'IN', 'BL'])
      .withMessage('Solo se permiten los valores "AC", "IN" o "BL".'),

    body('fntyp')
      .optional()
      .isIn(['PBL', 'ADM', 'VND', 'AUD'])
      .withMessage('El tipo de función debe ser PBL, ADM, VND o AUD.')
  ],
  controladorFunciones.guardar
);

// 🔹 Editar función
rutas.put(
  '/editar',
  [
    body('fncod')
      .notEmpty()
      .withMessage('El campo "fncod" es obligatorio.')
      .isString()
      .withMessage('El campo "fncod" debe ser una cadena de texto.'),

    body('fndsc')
      .optional()
      .isLength({ max: 255 })
      .withMessage('La descripción debe tener máximo 255 caracteres.'),

    body('fnest')
      .optional()
      .isIn(['AC', 'IN', 'BL'])
      .withMessage('Solo se permiten los valores "AC", "IN" o "BL".'),

    body('fntyp')
      .optional()
      .isIn(['PBL', 'ADM', 'VND', 'AUD'])
      .withMessage('El tipo de función debe ser PBL, ADM, VND o AUD.')
  ],
  controladorFunciones.editar
);

// 🔹 Eliminar función
rutas.delete(
  '/eliminar',
  [
    body('fncod')
      .notEmpty()
      .withMessage('El campo "fncod" es obligatorio.')
      .isString()
      .withMessage('El campo "fncod" debe ser una cadena de texto.')
  ],
  controladorFunciones.eliminar
);

module.exports = rutas;

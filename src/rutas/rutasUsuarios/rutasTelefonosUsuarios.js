const { Router } = require('express');
const { body } = require('express-validator');
const controladorTenefonos = require('../../controladores/controladorUsuario/controladorTelefonoUsuario');
const TelefonosUsuarios = require('../../modelos/modelosUsuarios/telefonoUsuario');

const rutas = Router();

// 🔹 Listar todos los teléfonos
rutas.get('/listar', controladorTenefonos.listar);

// 🔹 Crear teléfono
rutas.post(
  '/guardar',
  [
    body('numero')
      .notEmpty()
      .withMessage('El campo "numero" es obligatorio.')
      .isInt()
      .withMessage('El número debe ser un entero.'),

    body('idUsuario')
      .notEmpty()
      .withMessage('El campo "idUsuario" es obligatorio.')
      .isInt()
      .withMessage('El idUsuario debe ser un número entero.')
  ],
  controladorTenefonos.guardar
);

// 🔹 Editar teléfono
rutas.put(
  '/editar',
  [
    body('id')
      .notEmpty()
      .withMessage('El parámetro "id" es obligatorio.')
      .isInt()
      .withMessage('El parámetro "id" debe ser un número entero.'),

    body('numero')
      .optional()
      .isInt()
      .withMessage('El número debe ser un entero.'),

    body('idUsuario')
      .optional()
      .isInt()
      .withMessage('El idUsuario debe ser un número entero.')
  ],
  controladorTenefonos.editar
);

// 🔹 Eliminar teléfono
rutas.delete(
  '/eliminar',
  [
    body('id')
      .notEmpty()
      .withMessage('El parámetro "id" es obligatorio.')
      .isInt()
      .withMessage('El parámetro "id" debe ser un número entero.')
  ],
  controladorTenefonos.eliminar
);

module.exports = rutas;

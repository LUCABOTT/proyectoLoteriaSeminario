const { Router } = require('express');
const { body } = require('express-validator');
const controladorImagenes = require('../../controladores/controladorUsuario/controladorImagenUsuario');

const rutas = Router();

// 🔹 Listar todas las imágenes
rutas.get('/listar', controladorImagenes.listar);

// 🔹 Guardar imagen
rutas.post(
  '/guardar',
  [
    body('url')
      .notEmpty()
      .withMessage('El campo "url" es obligatorio')
      .isString()
      .withMessage('El campo "url" debe ser una cadena de texto'),
    
    body('usuarioId')
      .notEmpty()
      .withMessage('El campo "usuarioId" es obligatorio')
      .isInt()
      .withMessage('El "usuarioId" debe ser un número entero')
  ],
  controladorImagenes.guardar
);

// 🔹 Editar imagen
rutas.put(
  '/editar',
  [
    body('id')
      .notEmpty()
      .withMessage('El campo "id" es obligatorio')
      .isInt()
      .withMessage('El campo "id" debe ser un número entero'),

    body('url')
      .optional()
      .isString()
      .withMessage('El campo "url" debe ser una cadena de texto'),

    body('usuarioId')
      .optional()
      .isInt()
      .withMessage('El "usuarioId" debe ser un número entero')
  ],
  controladorImagenes.editar
);

// 🔹 Eliminar imagen
rutas.delete(
  '/eliminar',
  [
    body('id')
      .notEmpty()
      .withMessage('El campo "id" es obligatorio')
      .isInt()
      .withMessage('El campo "id" debe ser un número entero')
  ],
  controladorImagenes.eliminar
  
);

rutas.post('/imagen',
  controladorImagenes.validarImagenUsuario,
  controladorImagenes.guardarImagenUsuario
)



module.exports = rutas;

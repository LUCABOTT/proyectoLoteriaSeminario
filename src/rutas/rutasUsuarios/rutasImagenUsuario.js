const { Router } = require('express');
const { body } = require('express-validator');
const controladorImagenUsuario = require('../../controladores/controladorUsuario/controladorImagenUsuario');
const authenticateToken = require('../../middlewares/auth');

const rutas = Router();

// 🔹 Listar todas las imágenes
rutas.get('/listar', controladorImagenUsuario.listar);

// 🔹 Guardar imagen
rutas.post(
  '/guardar',
  [
   
    
    body('usuarioId')
      .notEmpty()
      .withMessage('El campo "usuarioId" es obligatorio')
      .isInt()
      .withMessage('El "usuarioId" debe ser un número entero')
  ],
  controladorImagenUsuario.guardar
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
  controladorImagenUsuario.editar
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
  controladorImagenUsuario.eliminar
  
);

rutas.post('/imagen',
  authenticateToken,
  controladorImagenUsuario.validarImagenUsuario,
  controladorImagenUsuario.guardarImagenUsuario
)

// Obtener imagen de perfil del usuario autenticado
rutas.get('/perfil', 
  authenticateToken, 
  controladorImagenUsuario.obtenerImagenPerfil
)

module.exports = rutas;

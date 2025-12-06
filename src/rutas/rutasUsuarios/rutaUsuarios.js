const { Router } = require('express');
const { body } = require('express-validator');
const controladorUsuario = require('../../controladores/controladorUsuario/controladorUsuarios');
const Usuarios = require('../../modelos/modelosUsuarios/usuarios');

const rutas = Router();

// 🔹 Listar todos los usuarios
rutas.get('/listar', controladorUsuario.listar);

// 🔹 Crear usuario
rutas.post(
  '/guardar',
  [
    body('segundoNombre')
      .notEmpty()
      .withMessage('El campo "segundoNombre" es obligatorio.')
      .isLength({ min: 2, max: 50 })
      .withMessage('El segundo nombre debe tener entre 2 y 50 caracteres.'),

    body('segundoApellido')
      .notEmpty()
      .withMessage('El campo "segundoApellido" es obligatorio.')
      .isLength({ min: 2, max: 50 })
      .withMessage('El segundo apellido debe tener entre 2 y 50 caracteres.'),

    body('useremail')
      .notEmpty()
      .withMessage('El campo "useremail" es obligatorio.')
      .isEmail()
      .withMessage('El correo electrónico no tiene un formato válido.')
      .custom(async (value) => {
        const existente = await Usuarios.findOne({ where: { useremail: value } });
        if (existente) {
          throw new Error('Ya existe un usuario con este correo.');
        }
        return true;
      }),

    body('userpswd')
      .notEmpty()
      .withMessage('El campo "userpswd" es obligatorio.')
      .isLength({ min: 6 })
      .withMessage('La contraseña debe tener al menos 6 caracteres.'),

    body('userest')
      .optional()
      .isIn(['AC', 'IN', 'BL'])
      .withMessage('Solo se permiten los valores "AC", "IN" o "BL".'),

    body('usertipo')
      .optional()
      .isIn(['PBL', 'ADM', 'VND', 'AUD'])
      .withMessage('Solo se permiten los valores "PBL", "ADM", "VND" o "AUD".'),

    body('fechaNacimiento')
      .optional()
      .isISO8601()
      .withMessage('La fecha de nacimiento debe tener un formato válido (YYYY-MM-DD).')
  ],
  controladorUsuario.guardar
);

// 🔹 Editar usuario
rutas.put(
  '/editar',
  [
    body('id')
      .notEmpty()
      .withMessage('El parámetro "id" es obligatorio.')
      .isInt()
      .withMessage('El parámetro "id" debe ser un número entero.'),

    body('segundoNombre')
      .optional()
      .isLength({ min: 2, max: 50 })
      .withMessage('El segundo nombre debe tener entre 2 y 50 caracteres.'),

    body('segundoApellido')
      .optional()
      .isLength({ min: 2, max: 50 })
      .withMessage('El segundo apellido debe tener entre 2 y 50 caracteres.'),

    body('useremail')
      .optional()
      .isEmail()
      .withMessage('El correo electrónico no tiene un formato válido.')
      .custom(async (value, { req }) => {
        const existente = await Usuarios.findOne({ where: { useremail: value } });
        if (existente && existente.id !== req.body.id) {
          throw new Error('Ya existe un usuario con este correo.');
        }
        return true;
      }),

    body('userpswd')
      .optional()
      .isLength({ min: 6 })
      .withMessage('La contraseña debe tener al menos 6 caracteres.'),

    body('userest')
      .optional()
      .isIn(['AC', 'IN', 'BL'])
      .withMessage('Solo se permiten los valores "AC", "IN" o "BL".'),

    body('usertipo')
      .optional()
      .isIn(['PBL', 'ADM', 'VND', 'AUD'])
      .withMessage('Solo se permiten los valores "PBL", "ADM", "VND" o "AUD".'),

    body('fechaNacimiento')
      .optional()
      .isISO8601()
      .withMessage('La fecha de nacimiento debe tener un formato válido (YYYY-MM-DD).')
  ],
  controladorUsuario.editar
);


rutas.put('/editar-telefonos', controladorUsuario.editarTelefonos);

// 🔹 Eliminar usuario
rutas.delete(
  '/eliminar',
  [
    body('id')
      .notEmpty()
      .withMessage('El parámetro "id" es obligatorio.')
      .isInt()
      .withMessage('El parámetro "id" debe ser un número entero.')
  ],
  controladorUsuario.eliminar
);

module.exports = rutas;

const { Router } = require('express');
const { body, query } = require('express-validator');
const controlador = require('../controladores/usuarioControlador');
const Modelo = require('../modelos/usuarioModelo');

const rutas = Router();

rutas.get('/listar', controlador.Listar);

rutas.post('/guardar',
  body('Nombre').isLength({ min: 3, max: 100 }).withMessage('El nombre debe contener entre 3-100 caracteres'),
  body('Nombre').custom(async (value) => {
    if (value) {
      const buscar = await Modelo.findOne({ where: { Nombre: value } });
      if (buscar) throw new Error('El nombre de usuario ya existe');
    } else {
      throw new Error('No se permiten nombres vacíos');
    }
  }),
  body('Rol').optional().isString().isLength({ max: 10 }).withMessage('Rol: máximo 10 caracteres'),
  controlador.Guardar
);

rutas.put('/editar',
  query('id').isInt().withMessage('El id debe ser un entero'),
  query('id').custom(async (value) => {
    if (value) {
      const buscar = await Modelo.findOne({ where: { Id: value } });
      if (!buscar) throw new Error('El id del usuario no existe');
    } else {
      throw new Error('No se permiten id vacíos');
    }
  }),
  body('Nombre').isLength({ min: 3, max: 100 }).withMessage('El nombre debe contener entre 3-100 caracteres'),
  body('Nombre').custom(async (value) => {
    if (value) {
      const buscar = await Modelo.findOne({ where: { Nombre: value } });
      if (buscar) throw new Error('El nombre de usuario ya existe');
    } else {
      throw new Error('No se permiten nombres vacíos');
    }
  }),
  body('Rol').optional().isString().isLength({ max: 10 }).withMessage('Rol: máximo 10 caracteres'),
  controlador.Editar
);

rutas.delete('/eliminar',
  query('id').isInt().withMessage('El id debe ser un entero'),
  query('id').custom(async (value) => {
    if (value) {
      const buscar = await Modelo.findOne({ where: { Id: value } });
      if (!buscar) throw new Error('El id del usuario no existe');
    } else {
      throw new Error('No se permiten id vacíos');
    }
  }),
  controlador.Eliminar
);

module.exports = rutas;

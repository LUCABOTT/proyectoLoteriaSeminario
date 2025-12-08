const { Router } = require('express');
const { body, query } = require('express-validator');
const { Op } = require('sequelize');
const controlador = require('../controladores/juegoControlador');
const Modelo = require('../modelos/juegoModelo');

const rutas = Router();

rutas.get('/listar', controlador.Listar);

rutas.post('/guardar',
  body('Nombre').isLength({ min: 3, max: 100 }).withMessage('El nombre debe contener entre 3-100 caracteres'),
  body('Nombre').custom(async (value) => {
    if (value) {
      const buscar = await Modelo.findOne({ where: { Nombre: value } });
      if (buscar) throw new Error('El nombre del juego ya existe');
    } else {
      throw new Error('No se permiten nombres vacíos');
    }
  }),
  body('Descripcion').optional().isString().isLength({ max: 255 }).withMessage('Descripción: máximo 255'),
  body('PrecioJuego').isFloat({ min: 1, max: 1000 }).withMessage('PrecioJuego debe estar entre 1 y 1000'),
  body('RangoMin').isInt().withMessage('RangoMin debe ser entero'),
  body('RangoMax').isInt().withMessage('RangoMax debe ser entero')
    .custom((max, { req }) => {
      if (req.body.RangoMin > max) throw new Error('RangoMin no puede ser mayor que RangoMax');
      return true;
    }),
  body('CantidadNumeros').isInt({ min: 1 }).withMessage('CantidadNumeros debe ser >= 1'),
  body('PermiteRepetidos').isBoolean().withMessage('PermiteRepetidos debe ser boolean'),
  body('ReglasResumen').optional().isString().isLength({ max: 255 }).withMessage('ReglasResumen: máximo 255'),
  controlador.Guardar
);

rutas.put('/editar',
  // id en query y existencia
  query('id').isInt().withMessage('El id debe ser un entero'),
  query('id').custom(async (value) => {
    const buscar = await Modelo.findByPk(value);
    if (!buscar) throw new Error('El id del juego no existe');
    return true;
  }),

  // TODOS los campos del body son OPCIONALES en editar:
  body('Nombre')
    .optional()
    .isLength({ min: 3, max: 100 }).withMessage('El nombre debe contener entre 3-100 caracteres')
    .custom(async (value, { req }) => {
      if (!value) return true;
      const existe = await Modelo.findOne({
        where: { 
          Nombre: value, 
          Id: { [Op.ne]: req.query.id } 
        }
      });
      if (existe) throw new Error('El nombre del juego ya existe');
      return true;
    }),

  body('Descripcion').optional().isLength({ max: 255 }).withMessage('La descripción máximo 255 caracteres'),

  body('PrecioJuego')
    .optional()
    .isFloat({ min: 1, max: 1000 })
    .withMessage('PrecioJuego debe estar entre 1 y 1000'),

  body('RangoMin').optional().isInt().withMessage('RangoMin debe ser entero'),
  body('RangoMax').optional().isInt().withMessage('RangoMax debe ser entero'),

  // Chequeo cruzado de rangos solo si ambos vienen
  body().custom((_, { req }) => {
    const { RangoMin, RangoMax } = req.body || {};
    if (RangoMin !== undefined && RangoMax !== undefined && Number(RangoMin) > Number(RangoMax)) {
      throw new Error('RangoMin no puede ser mayor que RangoMax');
    }
    return true;
  }),

  body('CantidadNumeros').optional().isInt({ min: 1 }).withMessage('CantidadNumeros debe ser entero >= 1'),
  body('PermiteRepetidos').optional().isBoolean().withMessage('PermiteRepetidos debe ser booleano'),
  body('ReglasResumen').optional().isLength({ max: 255 }).withMessage('ReglasResumen máximo 255 caracteres'),

  controlador.Editar
);

rutas.delete('/eliminar',
  query('id').isInt().withMessage('El id debe ser un entero'),
  query('id').custom(async (value) => {
    if (value) {
      const buscar = await Modelo.findOne({ where: { Id: value } });
      if (!buscar) throw new Error('El id del juego no existe');
    } else {
      throw new Error('No se permiten id vacíos');
    }
  }),
  controlador.Eliminar
);

module.exports = rutas;

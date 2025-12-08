const { Router } = require('express');
const { body, query } = require('express-validator');
const controlador = require('../controladores/sorteoControlador');
const Modelo = require('../modelos/sorteoModelo');
const Juego = require('../modelos/juegoModelo');

const rutas = Router();

// ✅ Actualizar ESTADOS (eliminar 'programado')
const ESTADOS = ['abierto','cerrado','sorteado','anulado'];

rutas.get('/listar', controlador.Listar);

rutas.get('/proximo', controlador.ObtenerProximo);

rutas.post('/guardar',
  body('IdJuego').isInt().withMessage('IdJuego debe ser un entero')
    .custom(async (value) => {
      if (value) {
        const buscar = await Juego.findOne({ where: { Id: value } });
        if (!buscar) throw new Error('El IdJuego no existe');
      } else {
        throw new Error('No se permiten IdJuego vacíos');
      }
      return true;
    }),
  body('Cierre').notEmpty().withMessage('Cierre es requerido').isISO8601().withMessage('Cierre debe ser una fecha ISO'),
  body('Estado').optional().isIn(ESTADOS).withMessage('Estado inválido'),
  body('NumerosGanadores').optional().custom((arr) => {
    if (arr === undefined || arr === null) return true;
    if (!Array.isArray(arr)) throw new Error('NumerosGanadores debe ser un arreglo');
    const enteros = arr.every(n => Number.isInteger(n));
    if (!enteros) throw new Error('NumerosGanadores debe contener enteros');
    return true;
  }),
  controlador.Guardar
);

rutas.put(
  '/editar',
  query('id').isInt().withMessage('El id debe ser un entero'),
  query('id').custom(async (value) => {
    const buscar = await Modelo.findByPk(value); // ✅ Cambiar Sorteo por Modelo
    if (!buscar) throw new Error('El id del sorteo no existe');
    return true;
  }),

  body('IdJuego')
    .optional()
    .isInt().withMessage('IdJuego debe ser un entero')
    .custom(async (value) => {
      const j = await Juego.findByPk(value);
      if (!j) throw new Error('El juego indicado no existe');
      return true;
    }),

  body('Cierre')
    .optional()
    .isISO8601().withMessage('Cierre debe ser una fecha válida'),

  // ✅ Actualizar estados permitidos
  body('Estado')
    .optional()
    .isIn(['abierto', 'cerrado', 'sorteado', 'anulado'])
    .withMessage("Estado inválido: use 'abierto','cerrado','sorteado','anulado'"),

  body('NumerosGanadores')
    .optional()
    .isArray().withMessage('NumerosGanadores debe ser un arreglo')
    .custom(async (value, { req }) => {
      const sorteo = await Modelo.findByPk(req.query.id); // ✅ Cambiar Sorteo por Modelo
      const juegoId = req.body.IdJuego ?? sorteo.IdJuego;
      const juego = await Juego.findByPk(juegoId);
      if (!juego) throw new Error('No se pudo determinar el juego del sorteo');

      const required = (juego.CantidadNumeros === 4) ? 3 : 5;
      if (value.length !== required) {
        throw new Error(`NumerosGanadores debe tener exactamente ${required} números`);
      }

      const set = new Set();
      for (const n of value) {
        if (!Number.isInteger(n) || n < 0 || n > 99) {
          throw new Error('Todos los NumerosGanadores deben ser enteros entre 0 y 99');
        }
        if (set.has(n)) throw new Error('NumerosGanadores no admite números repetidos');
        set.add(n);
      }
      return true;
    }),

  // ✅ Actualizar reglas de transición (eliminar 'programado')
  body().custom(async (_, { req }) => {
    const sorteo = await Modelo.findByPk(req.query.id); // ✅ Cambiar Sorteo por Modelo
    const estadoActual = sorteo.Estado;
    const estadoNuevo = req.body.Estado;

    if (estadoNuevo) {
      // ✅ Actualizar mapa de orden (sin 'programado')
      const mapaOrden = { abierto: 1, cerrado: 2, sorteado: 3, anulado: 4 };
      if (mapaOrden[estadoNuevo] < mapaOrden[estadoActual]) {
        throw new Error(`Transición de estado inválida: ${estadoActual} -> ${estadoNuevo}`);
      }
    }

    if (req.body.NumerosGanadores && !['cerrado', 'sorteado'].includes(estadoActual) && !req.body.Estado) {
      throw new Error('Para registrar NumerosGanadores, el sorteo debe estar cerrado o debes indicar Estado="sorteado"');
    }

    return true;
  }),

  controlador.Editar
);

rutas.delete('/eliminar',
  query('id').isInt().withMessage('El id debe ser un entero'),
  query('id').custom(async (value) => {
    if (value) {
      const buscar = await Modelo.findOne({ where: { Id: value } });
      if (!buscar) throw new Error('El id del sorteo no existe');
    } else {
      throw new Error('No se permiten id vacíos');
    }
  }),
  controlador.Eliminar
);

module.exports = rutas;

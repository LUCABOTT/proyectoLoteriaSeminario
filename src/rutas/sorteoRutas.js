const { Router } = require('express');
const { body, query } = require('express-validator');
const controlador = require('../controladores/sorteoControlador');
const Modelo = require('../modelos/sorteoModelo');
const Juego = require('../modelos/juegoModelo');

const rutas = Router();

const ESTADOS = ['programado','abierto','cerrado','sorteado','anulado'];

rutas.get('/listar', controlador.Listar);

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
  // id en query + existencia
  query('id').isInt().withMessage('El id debe ser un entero'),
  query('id').custom(async (value) => {
    const buscar = await Sorteo.findByPk(value);
    if (!buscar) throw new Error('El id del sorteo no existe');
    return true;
  }),

  // IdJuego (opcional) - si viene, debe existir
  body('IdJuego')
    .optional()
    .isInt().withMessage('IdJuego debe ser un entero')
    .custom(async (value) => {
      const j = await Juego.findByPk(value);
      if (!j) throw new Error('El juego indicado no existe');
      return true;
    }),

  // Cierre (opcional) - fecha válida ISO
  body('Cierre')
    .optional()
    .isISO8601().withMessage('Cierre debe ser una fecha válida'),

  // Estado (opcional) - uno de los permitidos
  body('Estado')
    .optional()
    .isIn(['programado', 'abierto', 'cerrado', 'sorteado', 'anulado'])
    .withMessage("Estado inválido: use 'programado','abierto','cerrado','sorteado','anulado'"),

  // NumerosGanadores (opcional) - array de enteros 0..99, sin repetidos; tamaño depende del juego
  body('NumerosGanadores')
    .optional()
    .isArray().withMessage('NumerosGanadores debe ser un arreglo')
    .custom(async (value, { req }) => {
      // Traer el sorteo actual y su juego (o el IdJuego que venga en body)
      const sorteo = await Sorteo.findByPk(req.query.id);
      const juegoId = req.body.IdJuego ?? sorteo.IdJuego;
      const juego = await Juego.findByPk(juegoId);
      if (!juego) throw new Error('No se pudo determinar el juego del sorteo');

      // Cantidad que debe tener el arreglo según el juego
      const required = (juego.CantidadNumeros === 4) ? 3 : 5; // Pega3=3 ganadores, Superpremio=5
      if (value.length !== required) {
        throw new Error(`NumerosGanadores debe tener exactamente ${required} números`);
      }

      // Validar 0..99 y sin repetidos
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

  // Reglas de transición de estado (opcional, lógica mínima)
  body().custom(async (_, { req }) => {
    const sorteo = await Sorteo.findByPk(req.query.id);
    const estadoActual = sorteo.Estado;
    const estadoNuevo = req.body.Estado;

    if (estadoNuevo) {
      // No permitir regresar desde 'sorteado' a 'abierto'
      const mapaOrden = { programado: 1, abierto: 2, cerrado: 3, sorteado: 4, anulado: 5 };
      if (mapaOrden[estadoNuevo] < mapaOrden[estadoActual]) {
        throw new Error(`Transición de estado inválida: ${estadoActual} -> ${estadoNuevo}`);
      }
    }

    // Si envían NumerosGanadores y el sorteo sigue abierto, permitir solo si también piden 'cerrado' o 'sorteado'
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

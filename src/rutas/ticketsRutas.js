const { Router } = require('express');
const { body, query } = require('express-validator');
const controlador = require('../controladores/ticketsControlador');
const Modelo = require('../modelos/ticketsModelo');
const Usuario = require('../modelos/modelosUsuarios/usuarios');
const Sorteo = require('../modelos/sorteoModelo');
const authenticateToken = require('../middlewares/auth');

const rutas = Router();

const ESTADOS = ['pendiente','pagado','cancelado','reembolsado','anulado'];

rutas.get('/listar', controlador.Listar);

rutas.get('/mis-tickets', authenticateToken, controlador.MisTickets);

rutas.post('/guardar',
  body('IdUsuario').isInt().withMessage('IdUsuario debe ser un entero')
    .custom(async (value) => {
      if (value) {
        const buscar = await Usuario.findOne({ where: { Id: value } });
        if (!buscar) throw new Error('El IdUsuario no existe');
      } else {
        throw new Error('No se permiten IdUsuario vacíos');
      }
      return true;
    }),
  body('IdSorteo').isInt().withMessage('IdSorteo debe ser un entero')
    .custom(async (value) => {
      if (value) {
        const buscar = await Sorteo.findOne({ where: { Id: value } });
        if (!buscar) throw new Error('El IdSorteo no existe');
      } else {
        throw new Error('No se permiten IdSorteo vacíos');
      }
      return true;
    }),
  body('FechaCompra').optional().isISO8601().withMessage('FechaCompra debe ser una fecha ISO'),
  body('Estado').optional().isIn(ESTADOS).withMessage('Estado inválido'),
  body('Total').isFloat({ min: 0 }).withMessage('Total debe ser mayor o igual a 0'),
  controlador.Guardar
);

rutas.post('/comprar',
  authenticateToken,
  body('IdSorteo').isInt().withMessage('IdSorteo debe ser un entero')
    .custom(async (value) => {
      if (value) {
        const buscar = await Sorteo.findOne({ where: { Id: value } });
        if (!buscar) throw new Error('El IdSorteo no existe');
      } else {
        throw new Error('No se permiten IdSorteo vacíos');
      }
      return true;
    }),
  body('FechaCompra').optional().isISO8601().withMessage('FechaCompra debe ser una fecha ISO'),
  body('Estado').optional().isIn(ESTADOS).withMessage('Estado inválido'),
  body('Total').isFloat({ min: 0 }).withMessage('Total debe ser mayor o igual a 0'),
  controlador.Comprar
);

rutas.put(
  '/editar',
  // id en query + existencia
  query('id').isInt().withMessage('El id debe ser un entero'),
  query('id').custom(async (value) => {
    const t = await Ticket.findByPk(value);
    if (!t) throw new Error('El id del ticket no existe');
    return true;
  }),

  // IdUsuario (opcional)
  body('IdUsuario')
    .optional()
    .isInt().withMessage('IdUsuario debe ser un entero')
    .custom(async (value) => {
      const u = await Usuario.findByPk(value);
      if (!u) throw new Error('El usuario indicado no existe');
      return true;
    }),

  // IdSorteo (opcional) - debe existir y estar 'abierto'
  body('IdSorteo')
    .optional()
    .isInt().withMessage('IdSorteo debe ser un entero')
    .custom(async (value) => {
      const s = await Sorteo.findByPk(value);
      if (!s) throw new Error('El sorteo indicado no existe');
      if (s.Estado !== 'abierto') throw new Error('Solo se puede mover un ticket a un sorteo "abierto"');
      return true;
    }),

  // FechaCompra (opcional)
  body('FechaCompra').optional().isISO8601().withMessage('FechaCompra inválida'),

  // Estado (opcional)
  body('Estado')
    .optional()
    .isIn(['pendiente', 'pagado', 'cancelado', 'reembolsado', 'anulado'])
    .withMessage("Estado inválido: use 'pendiente','pagado','cancelado','reembolsado','anulado'"),

  // Total (opcional)
  body('Total').optional().isFloat({ min: 0 }).withMessage('Total debe ser >= 0'),

  // Reglas de negocio extra
  body().custom(async (_, { req }) => {
    const ticket = await Ticket.findByPk(req.query.id);
    const sorteo = await Sorteo.findByPk(ticket.IdSorteo);

    // Si el sorteo original ya está cerrado/sorteado, no permitir cambiar IdSorteo ni Total
    if (['cerrado', 'sorteado'].includes(sorteo.Estado)) {
      if (req.body.IdSorteo !== undefined || req.body.Total !== undefined) {
        throw new Error('No se puede cambiar IdSorteo ni Total cuando el sorteo ya no está abierto');
      }
    }

    return true;
  }),

  controlador.Editar
);

rutas.delete('/eliminar',
  query('id').isInt().withMessage('El id debe ser un entero'),
  query('id').custom(async (value) => {
    if (value) {
      const buscar = await Modelo.findOne({ where: { IdTicket: value } });
      if (!buscar) throw new Error('El id del ticket no existe');
    } else {
      throw new Error('No se permiten id vacíos');
    }
  }),
  controlador.Eliminar
);

module.exports = rutas;

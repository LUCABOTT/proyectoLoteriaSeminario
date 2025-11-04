const { Router } = require('express');
const { body, query } = require('express-validator');
const controlador = require('../controladores/detalleTicketControlador');
const Modelo = require('../modelos/detalleTicketModelo');
const Tickets = require('../modelos/ticketsModelo');

const rutas = Router();

rutas.get('/listar', controlador.Listar);

rutas.post('/guardar',
  body('IdTicket').isInt().withMessage('IdTicket debe ser un entero')
    .custom(async (value) => {
      if (value) {
        const buscar = await Tickets.findOne({ where: { IdTicket: value } });
        if (!buscar) throw new Error('El IdTicket no existe');
      } else {
        throw new Error('No se permiten IdTicket vacíos');
      }
      return true;
    }),
  body('NumeroComprado').isInt().withMessage('NumeroComprado debe ser entero'),
  body('Subtotal').isFloat({ min: 0 }).withMessage('Subtotal debe ser mayor o igual a 0'),
  controlador.Guardar
);

rutas.put(
  '/editar',
  // id en query + existencia
  query('id').isInt().withMessage('El id debe ser un entero'),
  query('id').custom(async (value) => {
    const d = await Detalle.findByPk(value);
    if (!d) throw new Error('El id del detalle no existe');
    return true;
  }),

  // IdTicket (opcional) - debe existir y su sorteo estar abierto
  body('IdTicket')
    .optional()
    .isInt().withMessage('IdTicket debe ser un entero')
    .custom(async (value) => {
      const t = await Ticket.findByPk(value);
      if (!t) throw new Error('El ticket indicado no existe');
      const s = await Sorteo.findByPk(t.IdSorteo);
      if (!s || s.Estado !== 'abierto') throw new Error('El sorteo del ticket debe estar "abierto"');
      return true;
    }),

  // NumeroComprado (opcional) - 0..99 y sin duplicar otro número del mismo ticket
  body('NumeroComprado')
    .optional()
    .isInt({ min: 0, max: 99 })
    .withMessage('NumeroComprado debe ser un entero entre 0 y 99')
    .custom(async (value, { req }) => {
      if (value === undefined) return true;
      const detalle = await Detalle.findByPk(req.query.id);
      const ticket = await Ticket.findByPk(detalle.IdTicket);
      // ¿Pretenden moverlo a otro ticket?
      const ticketId = req.body.IdTicket ?? ticket.IdTicket;

      // Validar duplicado en el mismo ticket
      const existe = await Detalle.findOne({
        where: {
          IdTicket: ticketId,
          NumeroComprado: value
        }
      });
      if (existe && existe.IdDetalle !== Number(req.query.id)) {
        throw new Error('Ese número ya existe en este ticket (no se permiten repetidos)');
      }
      return true;
    }),

  // Subtotal (opcional)
  body('Subtotal').optional().isFloat({ min: 0 }).withMessage('Subtotal debe ser >= 0'),

  // Regla: no permitir cambios si el sorteo del ticket ya cerró
  body().custom(async (_, { req }) => {
    const detalle = await Detalle.findByPk(req.query.id);
    const ticket = await Ticket.findByPk(detalle.IdTicket);
    const sorteo = await Sorteo.findByPk(ticket.IdSorteo);
    if (['cerrado', 'sorteado'].includes(sorteo.Estado)) {
      throw new Error('No se puede editar el detalle porque el sorteo asociado ya no está abierto');
    }
    return true;
  }),

  controlador.Editar
);
rutas.delete('/eliminar',
  query('id').isInt().withMessage('El id debe ser un entero'),
  query('id').custom(async (value) => {
    if (value) {
      const buscar = await Modelo.findOne({ where: { IdDetalle: value } });
      if (!buscar) throw new Error('El id del detalle no existe');
    } else {
      throw new Error('No se permiten id vacíos');
    }
  }),
  controlador.Eliminar
);

module.exports = rutas;

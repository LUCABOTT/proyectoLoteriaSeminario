const { Router } = require('express');
const { body, query } = require('express-validator');
const autenticacion = require('../middlewares/auth');
const ticketsControlador = require('../controladores/ticketsControlador');

const rutas = Router();

// Listar todos los tickets (Admin)
rutas.get('/listar', ticketsControlador.Listar);

// Obtener mis tickets (Usuario autenticado)
rutas.get('/mis-tickets', ticketsControlador.MisTickets);

// Obtener ticket por ID con detalles
rutas.get('/:id', ticketsControlador.ObtenerPorId);

// Comprar ticket con validaciones robustas
rutas.post(
  '/comprar',
  body('IdSorteo').isInt({ min: 1 }).withMessage('IdSorteo debe ser un número válido'),
  body('numeros')
    .isArray({ min: 1 })
    .withMessage('numeros debe ser un array con al menos 1 elemento')
    .custom((value) => Array.isArray(value) && value.every(num => Number.isInteger(num) && num >= 0))
    .withMessage('Todos los números deben ser enteros no negativos'),
  ticketsControlador.Comprar
);

// Crear ticket manualmente (uso interno)
rutas.post(
  '/guardar',
  body('IdUsuario').isInt({ min: 1 }).withMessage('IdUsuario es requerido'),
  body('IdSorteo').isInt({ min: 1 }).withMessage('IdSorteo es requerido'),
  body('Total').isDecimal().withMessage('Total debe ser un número decimal válido'),
  ticketsControlador.Guardar
);

// Editar ticket (cambiar estado, etc.)
rutas.put(
  '/editar',
  query('id').isInt({ min: 1 }).withMessage('ID debe ser un número válido'),
  body('Estado')
    .optional()
    .isIn(['pendiente', 'pagado', 'ganador', 'ganador_pagado', 'cancelado', 'reembolsado', 'anulado'])
    .withMessage('Estado inválido'),
  ticketsControlador.Editar
);

// Eliminar ticket
rutas.delete(
  '/eliminar',
  query('id').isInt({ min: 1 }).withMessage('ID debe ser un número válido'),
  ticketsControlador.Eliminar
);

module.exports = rutas;

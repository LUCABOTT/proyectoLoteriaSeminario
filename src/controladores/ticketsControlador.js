const { validationResult } = require("express-validator");
const Tickets = require("../modelos/ticketsModelo");
const DetalleTicket = require("../modelos/detalleTicketModelo");
const Sorteo = require("../modelos/sorteoModelo");
const Juego = require("../modelos/juegoModelo");
const Billetera = require("../modelos/billetera.modelo");
const Transaccion = require("../modelos/transaccion.modelo");
const db = require("../configuracion/db");

const controlador = {};

/**
 * Listar todos los tickets (Admin)
 */
controlador.Listar = async (_req, res) => {
  try {
    console.log('ticketsControlador.Listar - Iniciando...');
    const data = await Tickets.findAll({
      order: [['IdTicket', 'DESC']]
    });
    res.json(data);
  } catch (e) {
    console.error('ticketsControlador.Listar - Error:', e.message);
    res.status(500).json({ error: e.message });
  }
};
controlador.MisTickets = async (req, res) => {
  try {
    const userId = req.user?.IdUsuario || req.user?.id || req.user?.Id;
    if (!userId) {
      return res.status(401).json({ error: 'Usuario no autenticado' });
    }

    const data = await Tickets.findAll({
      where: { IdUsuario: userId },
      order: [['IdTicket', 'DESC']]
    });

    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

/**
 * Obtener ticket por ID con detalles
 */
controlador.ObtenerPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const numId = parseInt(id, 10);
    
    if (isNaN(numId)) {
      return res.status(400).json({ error: 'ID inválido' });
    }

    console.log('ticketsControlador.ObtenerPorId - ID:', numId);
    
    const ticket = await Tickets.findByPk(numId);
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket no encontrado' });
    }

    // Obtener detalles del ticket
    const detalles = await DetalleTicket.findAll({
      where: { IdTicket: numId }
    });

    res.json({
      ticket,
      detalles
    });
  } catch (e) {
    console.error('ticketsControlador.ObtenerPorId - Error:', e.message);
    res.status(500).json({ error: e.message });
  }
};

/**
 * COMPRAR TICKET CON VALIDACIONES ROBUSTAS
 */
controlador.Comprar = async (req, res) => {
  const errores = validationResult(req);
  if (!errores.isEmpty()) {
    return res.status(400).json(errores.array());
  }

  const t = await db.transaction();
  
  try {
    const { IdSorteo, numeros } = req.body;
    // El token JWT contiene 'id', no 'IdUsuario'
    const IdUsuario = req.user?.id || req.user?.IdUsuario;

    console.log('ticketsControlador.Comprar - Iniciando...');
    console.log('  req.user completo:', req.user);
    console.log('  Usuario:', IdUsuario);
    console.log('  Sorteo:', IdSorteo);
    console.log('  Números:', numeros);

    // ============= VALIDACIÓN 1: Usuario autenticado =============
    if (!IdUsuario) {
      console.warn('ticketsControlador.Comprar - Usuario no autenticado');
      return res.status(401).json({ error: 'Usuario no autenticado' });
    }

    // ============= VALIDACIÓN 2: Sorteo existe =============
    const sorteo = await Sorteo.findByPk(IdSorteo);
    if (!sorteo) {
      console.warn('ticketsControlador.Comprar - Sorteo no encontrado:', IdSorteo);
      return res.status(404).json({ error: 'Sorteo no encontrado' });
    }

    console.log('Sorteo encontrado:', sorteo.dataValues);

    // ============= VALIDACIÓN 3: Sorteo está ABIERTO =============
    if (sorteo.Estado !== 'abierto') {
      console.warn(`ticketsControlador.Comprar - Sorteo no está abierto. Estado: ${sorteo.Estado}`);
      return res.status(400).json({ 
        error: `El sorteo no está disponible. Estado: ${sorteo.Estado}. Solo se pueden comprar boletos en sorteos ABIERTOS.` 
      });
    }

    // ============= VALIDACIÓN 4: No ha pasado la fecha de cierre =============
    const ahora = new Date();
    const cierre = new Date(sorteo.Cierre);
    
    if (ahora >= cierre) {
      console.warn('ticketsControlador.Comprar - Fecha de cierre ya pasó');
      return res.status(400).json({ 
        error: 'La fecha de cierre para este sorteo ya ha pasado. No se pueden comprar más boletos.' 
      });
    }

    console.log(`Tiempo restante: ${(cierre - ahora) / 1000 / 60} minutos`);

    // ============= VALIDACIÓN 5: Obtener información del juego =============
    const juego = await Juego.findByPk(sorteo.IdJuego);
    if (!juego) {
      console.warn('ticketsControlador.Comprar - Juego no encontrado:', sorteo.IdJuego);
      return res.status(404).json({ error: 'Juego asociado no encontrado' });
    }

    console.log('Juego encontrado:', juego.dataValues);

    // ============= VALIDACIÓN 6: Cantidad de números correcta =============
    if (!Array.isArray(numeros) || numeros.length === 0) {
      console.warn('ticketsControlador.Comprar - Números inválido o vacío');
      return res.status(400).json({ 
        error: 'Debes proporcionar una lista de números' 
      });
    }

    if (numeros.length !== juego.CantidadNumeros) {
      console.warn(`ticketsControlador.Comprar - Cantidad incorrecta. Esperado: ${juego.CantidadNumeros}, Recibido: ${numeros.length}`);
      return res.status(400).json({ 
        error: `Debes seleccionar exactamente ${juego.CantidadNumeros} números para este juego. Seleccionaste ${numeros.length}.` 
      });
    }

    // ============= VALIDACIÓN 7: Números en rango válido =============
    const numerosInvalidos = [];
    for (const num of numeros) {
      if (typeof num !== 'number' || num < juego.RangoMin || num > juego.RangoMax) {
        numerosInvalidos.push(num);
      }
    }

    if (numerosInvalidos.length > 0) {
      console.warn(`ticketsControlador.Comprar - Números fuera de rango: ${numerosInvalidos.join(', ')}`);
      return res.status(400).json({ 
        error: `Los siguientes números están fuera del rango permitido (${juego.RangoMin}-${juego.RangoMax}): ${numerosInvalidos.join(', ')}` 
      });
    }

    // ============= VALIDACIÓN 8: Sin duplicados (si no se permiten) =============
    if (!juego.PermiteRepetidos) {
      const numerosUnicos = new Set(numeros);
      if (numerosUnicos.size !== numeros.length) {
        console.warn('ticketsControlador.Comprar - Números duplicados detectados');
        return res.status(400).json({ 
          error: 'No se permiten números repetidos en este juego. Verifica que todos los números sean diferentes.' 
        });
      }
    }

    console.log('Validaciones de números pasadas ✓');

    // ============= VALIDACIÓN 9: Saldo suficiente =============
    const total = juego.PrecioJuego;
    const billetera = await Billetera.findOne({ 
      where: { usuario: IdUsuario } 
    });

    if (!billetera) {
      console.warn('ticketsControlador.Comprar - Billetera no encontrada para usuario:', IdUsuario);
      return res.status(404).json({ error: 'Billetera del usuario no encontrada' });
    }

    console.log(`Saldo actual: L. ${billetera.saldo}, Total a cobrar: L. ${total}`);

    if (billetera.saldo < total) {
      console.warn(`ticketsControlador.Comprar - Saldo insuficiente. Saldo: ${billetera.saldo}, Total: ${total}`);
      return res.status(402).json({ 
        error: `Saldo insuficiente. Tu saldo es L. ${billetera.saldo.toFixed(2)} pero necesitas L. ${total.toFixed(2)} para comprar este boleto.`,
        saldoActual: billetera.saldo,
        totalRequerido: total
      });
    }

    console.log('Validación de saldo pasada ✓');

    // ============= CREAR TICKET =============
    const ticket = await Tickets.create({
      IdUsuario,
      IdSorteo,
      FechaCompra: new Date(),
      Total: total,
      Estado: 'pagado'
    }, { transaction: t });

    console.log('Ticket creado:', ticket.dataValues);

    // ============= CREAR DETALLES DEL TICKET =============
    const subtotal = total / numeros.length;
    const detalles = [];

    for (const numero of numeros) {
      const detalle = await DetalleTicket.create({
        IdTicket: ticket.IdTicket,
        NumeroComprado: numero,
        Subtotal: subtotal
      }, { transaction: t });
      detalles.push(detalle);
    }

    console.log(`${detalles.length} detalles de ticket creados`);

    // ============= DEBITAR DE BILLETERA =============
    await billetera.update(
      { saldo: billetera.saldo - total },
      { transaction: t }
    );

    console.log(`Billetera actualizada. Nuevo saldo: ${(billetera.saldo - total).toFixed(2)}`);

    // ============= REGISTRAR TRANSACCIÓN =============
    const transaccion = await Transaccion.create({
      billetera: billetera.id,
      monto: -total, // Negativo porque es un débito
      ticket: ticket.IdTicket,
      tipo: 'Compra de ticket'
    }, { transaction: t });

    console.log(`Transacción registrada: ID ${transaccion.id}, Monto: -${total}`);

    // ============= CONFIRMAR TRANSACCIÓN =============
    await t.commit();

    console.log('✓ Transacción completada exitosamente');

    res.status(201).json({
      message: 'Boleto comprado exitosamente',
      ticket: ticket.dataValues,
      detalles: detalles.map(d => d.dataValues),
      nuevoSaldo: billetera.saldo - total
    });

  } catch (e) {
    // Rollback en caso de error
    await t.rollback();
    
    console.error('ticketsControlador.Comprar - Error:', e.message);
    console.error('Error stack:', e.stack);
    
    res.status(500).json({ 
      error: e.message || 'Error al comprar boleto' 
    });
  }
};

/**
 * Guardar/Crear ticket (para uso interno)
 */
controlador.Guardar = async (req, res) => {
  const errores = validationResult(req);
  if (!errores.isEmpty()) {
    return res.status(400).json(errores.array());
  }

  try {
    console.log('ticketsControlador.Guardar - Datos:', req.body);
    
    const payload = {
      ...req.body,
      FechaCompra: req.body.FechaCompra || new Date(),
      Estado: req.body.Estado || 'pagado'
    };

    const row = await Tickets.create(payload);
    res.status(201).json(row);
  } catch (e) {
    console.error('ticketsControlador.Guardar - Error:', e.message);
    res.status(400).json({ error: e.message });
  }
};

/**
 * Editar ticket (cambiar estado, etc.)
 */
controlador.Editar = async (req, res) => {
  const errores = validationResult(req);
  if (!errores.isEmpty()) {
    return res.status(400).json(errores.array());
  }

  try {
    const { id } = req.query;
    const numId = parseInt(id, 10);

    if (isNaN(numId)) {
      return res.status(400).json({ error: 'ID inválido' });
    }

    console.log('ticketsControlador.Editar - ID:', numId, 'Datos:', req.body);

    const ticket = await Tickets.findByPk(numId);
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket no encontrado' });
    }

    // ============= VALIDACIÓN: Solo se pueden cambiar estados permitidos =============
    const estadosValidos = ['pendiente', 'pagado', 'ganador', 'ganador_pagado', 'cancelado', 'reembolsado', 'anulado'];
    if (req.body.Estado && !estadosValidos.includes(req.body.Estado)) {
      return res.status(400).json({ 
        error: `Estado inválido. Estados permitidos: ${estadosValidos.join(', ')}` 
      });
    }

    const updates = { ...req.body };
    await ticket.update(updates);

    console.log('Ticket actualizado:', ticket.dataValues);
    res.json(ticket);
  } catch (e) {
    console.error('ticketsControlador.Editar - Error:', e.message);
    res.status(400).json({ error: e.message });
  }
};

/**
 * Eliminar ticket
 */
controlador.Eliminar = async (req, res) => {
  try {
    const { id } = req.query;
    const numId = parseInt(id, 10);

    if (isNaN(numId)) {
      return res.status(400).json({ error: 'ID inválido' });
    }

    console.log('ticketsControlador.Eliminar - ID:', numId);

    const ticket = await Tickets.findByPk(numId);
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket no encontrado' });
    }

    // Eliminar detalles asociados
    await DetalleTicket.destroy({
      where: { IdTicket: numId }
    });

    // Eliminar ticket
    await ticket.destroy();

    console.log('Ticket y sus detalles eliminados');
    res.status(204).end();
  } catch (e) {
    console.error('ticketsControlador.Eliminar - Error:', e.message);
    res.status(500).json({ error: e.message });
  }
};

module.exports = controlador;

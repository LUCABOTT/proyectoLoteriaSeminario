const { validationResult } = require("express-validator");
const Tickets = require("../modelos/ticketsModelo");
const db = require("../configuracion/db");
const billeteraService = require("../services/billetera.servicio");
const Transaccion = require("../modelos/transaccion.modelo");

const controlador = {};

controlador.Listar = async (_req, res) => {
  try {
    const data = await Tickets.findAll();
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

controlador.MisTickets = async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: "Usuario no autenticado" });
    }

    const tickets = await Tickets.findAll({
      where: { IdUsuario: req.user.id },
      order: [["FechaCompra", "DESC"]],
    });

    res.json({
      usuario: req.user.id,
      tickets: tickets,
      total: tickets.length
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

controlador.Guardar = async (req, res) => {
  const errores = validationResult(req);
  if (!errores.isEmpty()) return res.status(400).json(errores.array());
  try {
    const { IdUsuario, Total } = req.body;

    if (!IdUsuario) return res.status(400).json({ error: "IdUsuario es requerido" });

    const totalNumeric = parseFloat(Total || 0);

    const result = await db.transaction(async (t) => {
      if (totalNumeric > 0) {
        await billeteraService.debitar(IdUsuario, totalNumeric, "Pago", { transaction: t });
      }

      const ticket = await Tickets.create(req.body, { transaction: t });

      if (totalNumeric > 0) {
        ticket.Estado = "pagado";
        await ticket.save({ transaction: t });
      }

      return ticket;
    });

    res.status(201).json(result);
  } catch (e) {
    if (e.message && e.message.includes("Saldo insuficiente")) return res.status(402).json({ error: e.message });
    res.status(400).json({ error: e.message });
  }
};

controlador.Editar = async (req, res) => {
  const errores = validationResult(req);
  if (!errores.isEmpty()) return res.status(400).json(errores.array());
  try {
    const { id } = req.query;
    const row = await Tickets.findByPk(id);
    if (!row) return res.status(404).json({ error: "Ticket no encontrado" });
    await row.update(req.body);
    res.json(row);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

controlador.Eliminar = async (req, res) => {
  try {
    const { id } = req.query;
    const row = await Tickets.findByPk(id);
    if (!row) return res.status(404).json({ error: "Ticket no encontrado" });
    await row.destroy();
    res.status(204).end();
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

controlador.Comprar = async (req, res) => {
  const errores = validationResult(req);
  if (!errores.isEmpty()) return res.status(400).json(errores.array());
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: "Usuario no autenticado" });
    }

    const IdUsuario = req.user.id;
    const { Total } = req.body;
    const totalNumeric = parseFloat(Total || 0);

    if (totalNumeric <= 0) {
      return res.status(400).json({ error: "El total debe ser mayor que 0" });
    }

    const result = await db.transaction(async (t) => {
      await billeteraService.debitar(
        IdUsuario, 
        totalNumeric, 
        "Compra de ticket", 
        { 
          transaction: t,
          meta: { IdSorteo: req.body.IdSorteo }
        }
      );

      const payload = { ...req.body, IdUsuario, Estado: "pagado" };
      const ticket = await Tickets.create(payload, { transaction: t });

      return ticket;
    });

    res.status(201).json({
      mensaje: "Ticket comprado exitosamente",
      ticket: result
    });
  } catch (e) {
    if (e.message && e.message.includes("Saldo insuficiente")) {
      return res.status(402).json({ error: e.message });
    }
    res.status(400).json({ error: e.message });
  }
};

module.exports = controlador;

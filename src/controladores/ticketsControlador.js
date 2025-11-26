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
    const usuarioAuth = req.user && (req.user.id || req.user.Id || req.user.ID);
    const IdUsuario = usuarioAuth || req.body.IdUsuario;
    if (!IdUsuario) return res.status(401).json({ error: "Usuario no autenticado" });

    const { Total } = req.body;
    const totalNumeric = parseFloat(Total || 0);

    const result = await db.transaction(async (t) => {
      let billetera = null;

      if (totalNumeric > 0) {
        billetera = await billeteraService.debitar(IdUsuario, totalNumeric, "Pago", { transaction: t, skipTransaccion: true });
      }

      const payload = Object.assign({}, req.body, { IdUsuario });
      const ticket = await Tickets.create(payload, { transaction: t });

      if (totalNumeric > 0) {
        ticket.Estado = "pagado";
        await ticket.save({ transaction: t });
        const billeteraId = billetera ? billetera.id : (await billeteraService.asegurarBilletera(IdUsuario, { transaction: t })).id;
        await Transaccion.create({ billetera: billeteraId, monto: totalNumeric, tipo: "Pago", ticket: ticket.IdTicket }, { transaction: t });
      }

      return ticket;
    });

    res.status(201).json(result);
  } catch (e) {
    if (e.message && e.message.includes("Saldo insuficiente")) return res.status(402).json({ error: e.message });
    res.status(400).json({ error: e.message });
  }
};

module.exports = controlador;

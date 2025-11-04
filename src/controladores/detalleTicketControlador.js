const { validationResult } = require('express-validator');
const DetalleTicket = require('../modelos/detalleTicketModelo');

const controlador = {};

controlador.Listar = async (req, res) => {
  try {
    // opcional: permitir filtro ?ticket=ID
    const where = {};
    if (req.query.ticket) where.IdTicket = req.query.ticket;
    const data = await DetalleTicket.findAll({ where });
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

controlador.Guardar = async (req, res) => {
  const errores = validationResult(req);
  if (!errores.isEmpty()) return res.status(400).json(errores.array());
  try {
    const row = await DetalleTicket.create(req.body);
    res.status(201).json(row);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

controlador.Editar = async (req, res) => {
  const errores = validationResult(req);
  if (!errores.isEmpty()) return res.status(400).json(errores.array());
  try {
    const { id } = req.query; // PK = IdDetalle
    const row = await DetalleTicket.findByPk(id);
    if (!row) return res.status(404).json({ error: 'Detalle no encontrado' });
    await row.update(req.body);
    res.json(row);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

controlador.Eliminar = async (req, res) => {
  try {
    const { id } = req.query;
    const row = await DetalleTicket.findByPk(id);
    if (!row) return res.status(404).json({ error: 'Detalle no encontrado' });
    await row.destroy();
    res.status(204).end();
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

module.exports = controlador;

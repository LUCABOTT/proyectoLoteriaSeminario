const { validationResult } = require('express-validator');
const Tickets = require('../modelos/ticketsModelo');

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
    const row = await Tickets.create(req.body);
    res.status(201).json(row);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

controlador.Editar = async (req, res) => {
  const errores = validationResult(req);
  if (!errores.isEmpty()) return res.status(400).json(errores.array());
  try {
    const { id } = req.query; // ojo: para Tickets el PK es IdTicket
    const row = await Tickets.findByPk(id);
    if (!row) return res.status(404).json({ error: 'Ticket no encontrado' });
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
    if (!row) return res.status(404).json({ error: 'Ticket no encontrado' });
    await row.destroy();
    res.status(204).end();
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

module.exports = controlador;

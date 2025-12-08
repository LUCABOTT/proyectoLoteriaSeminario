const Sorteos = require('../modelos/sorteoModelo');
const Juegos = require('../modelos/juegoModelo');
const Usuarios = require('../modelos/modelosUsuarios/usuarios');
const Tickets = require('../modelos/ticketsModelo');
const Billetera = require('../modelos/billetera.modelo');
const Transacciones = require('../modelos/transaccion.modelo');
const { Op } = require('sequelize');

// 🔹 Obtener estadísticas para el dashboard de administrador
exports.obtenerEstadisticasAdmin = async (req, res) => {
  try {
    // Contar sorteos activos
    const sorteosActivos = await Sorteos.count({
      where: { Estado: 'abierto' }
    });

    // Contar tickets vendidos
    const ticketsVendidos = await Tickets.count({
      where: { 
        Estado: {
          [Op.in]: ['pagado', 'ganador', 'ganador_pagado']
        }
      }
    });

    // Contar usuarios registrados
    const usuariosRegistrados = await Usuarios.count();

    // Calcular ventas totales (transacciones de tipo compra)
    const ventasTotales = await Transacciones.sum('monto', {
      where: {
        tipo: {
          [Op.in]: ['Compra de ticket', 'Pago']
        }
      }
    }) || 0;

    // Obtener actividad reciente (últimos tickets vendidos)
    const actividadReciente = await Tickets.findAll({
      limit: 10,
      order: [['FechaCompra', 'DESC']],
      include: [
        {
          model: Usuarios,
          as: 'usuario',
          attributes: ['primerNombre', 'primerApellido', 'useremail']
        },
        {
          model: Sorteos,
          as: 'sorteo',
          attributes: ['Id'],
          include: [
            {
              model: Juegos,
              as: 'juego',
              attributes: ['Nombre']
            }
          ]
        }
      ]
    });

    res.json({
      sorteosActivos,
      ticketsVendidos,
      usuariosRegistrados,
      ventasTotales: Math.abs(ventasTotales),
      actividadReciente
    });

  } catch (error) {
    console.error("Error al obtener estadísticas admin:", error);
    res.status(500).json({ 
      msj: "Error al obtener estadísticas", 
      error: error.message 
    });
  }
};

// 🔹 Obtener estadísticas mensuales
exports.obtenerEstadisticasMensuales = async (req, res) => {
  try {
    const inicioMes = new Date();
    inicioMes.setDate(1);
    inicioMes.setHours(0, 0, 0, 0);

    // Tickets vendidos este mes
    const ticketsMes = await Tickets.count({
      where: {
        FechaCompra: { [Op.gte]: inicioMes },
        Estado: {
          [Op.in]: ['pagado', 'ganador', 'ganador_pagado']
        }
      }
    });

    // Ventas del mes
    const ventasMes = await Transacciones.sum('monto', {
      where: {
        creada: { [Op.gte]: inicioMes },
        tipo: {
          [Op.in]: ['Compra de ticket', 'Pago']
        }
      }
    }) || 0;

    // Nuevos usuarios del mes
    const usuariosNuevosMes = await Usuarios.count({
      where: {
        userfching: { [Op.gte]: inicioMes }
      }
    });

    res.json({
      ticketsMes,
      ventasMes: Math.abs(ventasMes),
      usuariosNuevosMes
    });

  } catch (error) {
    console.error("Error al obtener estadísticas mensuales:", error);
    res.status(500).json({ 
      msj: "Error al obtener estadísticas mensuales", 
      error: error.message 
    });
  }
};

module.exports = exports;

const { Router } = require('express');
const dashboardControlador = require('../controladores/dashboardControlador');
const authenticateToken = require('../middlewares/auth');

const rutas = Router();

// 🔹 Todas las rutas requieren autenticación
rutas.use(authenticateToken);

// 🔹 Obtener estadísticas generales del dashboard admin
rutas.get('/admin/estadisticas', dashboardControlador.obtenerEstadisticasAdmin);

// 🔹 Obtener estadísticas mensuales
rutas.get('/admin/estadisticas-mensuales', dashboardControlador.obtenerEstadisticasMensuales);

module.exports = rutas;

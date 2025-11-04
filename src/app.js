// ------------------------------
// Cargar variables de entorno
// ------------------------------
require('dotenv').config();

// ------------------------------
// Imports base
// ------------------------------
const express = require('express');
const morgan = require('morgan');
const db = require('./configuracion/db');

// ------------------------------
// Swagger (UI + documento)
// ------------------------------
let swaggerUI, swaggerDoc;
try {
  swaggerUI = require('swagger-ui-express');
  swaggerDoc = require('./configuracion/swagger'); // exporta el JSON/obj de tu spec
} catch (e) {
  // Si faltan paquetes/archivo, seguimos sin Swagger
  console.warn('Swagger UI no disponible (instala swagger-ui-express o revisa configuracion/swagger.js).');
}

// ------------------------------
// App y configuración
// ------------------------------
const app = express();
const PORT = process.env.PORT || 3004;
app.set('port', PORT);

// ------------------------------
// Middlewares
// ------------------------------
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// ------------------------------
// Rutas (API)
// ------------------------------
app.use('/api/usuarios', require('./rutas/usuarioRutas'));
app.use('/api/juegos', require('./rutas/juegoRutas'));
app.use('/api/sorteos', require('./rutas/sorteoRutas'));
app.use('/api/tickets', require('./rutas/ticketsRutas'));
app.use('/api/detalle-tickets', require('./rutas/detalleTicketRutas'));

// ------------------------------
// Swagger UI (si está disponible)
// ------------------------------
if (swaggerUI && swaggerDoc) {
  app.use('/api/docs', swaggerUI.serve, swaggerUI.setup(swaggerDoc));
  console.log('Swagger UI montado en /api/docs');
}

// ------------------------------
// DB: autenticación
// ------------------------------
(async () => {
  try {
    await db.authenticate();
    console.log('Conexión exitosa a la base de datos');
  } catch (err) {
    console.error('Error al conectar o sincronizar:', err);
  }
})();

// ------------------------------
// Levantar servidor
// ------------------------------
app.listen(app.get('port'), () => {
  console.log('Servidor Funcionando en puerto ' + app.get('port'));

  // Iniciar scheduler (auto-cierre y auto-sorteo)
  try {
    const { startScheduler } = require('./jobs/scheduler');
    startScheduler();
  } catch (e) {
    console.warn('Scheduler no iniciado:', e.message);
  }
});

module.exports = app;

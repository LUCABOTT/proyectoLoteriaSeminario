const express = require('express');
const morgan = require('morgan');
require('dotenv').config();
const db = require('./configuracion/db');

// Swagger
const swaggerUI = require('swagger-ui-express');
const swaggerSpec = require('./configuracion/swagger');

const app = express();

(async () => {
  try {
    await db.authenticate();
    console.log('Conexión exitosa a la base de datos');
  } catch (err) {
    console.error('Error al conectar o sincronizar:', err);
  }
})();

const PORT = process.env.PORT || 3004;
app.set('port', PORT);

app.use(morgan('dev'));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Rutas
const usuarioRutas = require('./rutas/usuarioRutas');
const juegoRutas = require('./rutas/juegoRutas');
const sorteoRutas = require('./rutas/sorteoRutas');
const ticketsRutas = require('./rutas/ticketsRutas');
const detalleTicketRutas = require('./rutas/detalleTicketRutas'); // <- asegúrate que este archivo exista

app.use('/api/usuarios', usuarioRutas);
app.use('/api/juegos', juegoRutas);
app.use('/api/sorteos', sorteoRutas);
app.use('/api/tickets', ticketsRutas);
app.use('/api/detalle-tickets', detalleTicketRutas);

// Swagger UI
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerSpec));

app.listen(app.get('port'), () => {
  console.log('Servidor Funcionando en puerto ' + app.get('port'));
});

module.exports = app;

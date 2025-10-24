const express = require('express');
const morgan = require('morgan');
const db = require('./configuracion/db');
const swaggerUI = require('swagger-ui-express');
require('dotenv').config();

const app = express();
// Función asíncrona principal
(async () => {
  try {
    await db.authenticate();
    console.log('Conexión exitosa a la base de datos');

    } catch (err) {
    console.error('Error al conectar o sincronizar:', err);
  }
})();

// Configuración
const PORT = process.env.PORT || 3001;
app.set('port', PORT);

// Middlewares
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Levantar servidor
app.listen(app.get('port'), () => {
  console.log('Servidor Funcionando en puerto ' + app.get('port'));
});

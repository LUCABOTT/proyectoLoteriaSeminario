const swaggerJsdoc = require('swagger-jsdoc');
const path = require('path');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API-SEMINARIO',
      version: '1.0.0',
      description: 'API del sistema emplo de la clase de seminario',
      contact: { email: 'desofiwfacturacion@gmail.com' },
    },
    servers: [
      {
        url: 'http://localhost:' + process.env.PORT + '/api',
        description: 'Servidor local',
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }
      },
    },
    security: [{ BearerAuth: [] }],
  },
  apis: [`${path.join(__dirname, "../rutas/**/*.js")}`],
};

const swaggerSpec = swaggerJsdoc(options);
module.exports = swaggerSpec;

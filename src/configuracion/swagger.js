const { join } = require("path");
const swaggerJSDoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API Lotería",
      version: "1.0.0",
      description: "API para el sistema de lotería con gestión de usuarios, billeteras, tickets y sorteos",
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3004}`,
        description: "Servidor de desarrollo",
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Token JWT para autenticación. Formato: Bearer <token>",
        },
      },
    },
    security: [
      {
        BearerAuth: [],
      },
    ],
  },
  apis: [
    join(__dirname, "../rutas/*.js"),
    join(__dirname, "../rutas/rutasUsuarios/*.js"),
    join(__dirname, "../swagger/*.yaml"),
  ],
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;

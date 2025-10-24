const swaggerJSDoc = require('swagger-jsdoc');
const swaggerAutogen = require('swagger-autogen')();
const outputFile = './swagger-output.json'; // archivo donde se guardará la documentación
const endpointsFiles = ['../app.js']; // sube una carpeta para acceder a app.js

const path = require('path');


const doc = {
  info: {
    title: 'API-SEMINARIO',
    description: 'Documentación automática generada con swagger-autogen',
    version: '1.0.0',
    contact: {
      email: 'lucabotteri169@gmail.com'
    }
  },
  host: 'localhost:3001',
  schemes: ['http'],
  securityDefinitions: {
    BearerAuth: {
      type: 'apiKey',
      name: 'Authorization',
      in: 'header',
      description: 'Introduce el token con el prefijo: Bearer <token>'
    }
  },
  security: [{ BearerAuth: [] }],
};


swaggerAutogen(outputFile, endpointsFiles).then(() => {
  console.log('✅ Documentación generada con éxito');
});

/*
const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API-SEMINARIO',
      version: '1.0.0',
      description: 'API del sistema ejemplo de la clase de seminario',
      contact: {
        email: 'lucabotteri169@gmail.com',
      },
    },
    components: {
      securitySchemes: { // ✅ corregido (era securitySchema y Components)
        BearerAuth: {
          type: 'http',
          scheme: 'bearer', // ✅ corregido ("hearer" → "bearer")
          bearerFormat: 'JWT',
        },
      },
    },
    security: [ // ✅ debe ser un array
      {
        BearerAuth: [],
      },
    ],
  },
  // ✅ corregida la ruta de apis y la sintaxis del template literal
 // apis: [path.join(__dirname, '../rutas/**/
//};
/*
const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
*/
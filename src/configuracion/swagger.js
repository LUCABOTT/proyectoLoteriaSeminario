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
    tags: [
      {
        name: "Autenticación",
        description: "Endpoints para registro, login y gestión de cuentas",
      },
      {
        name: "Billetera",
        description: "Gestión de billetera virtual y saldo del usuario",
      },
      {
        name: "Tickets",
        description: "Compra y gestión de tickets de lotería",
      },
      {
        name: "PayPal",
        description: "Integración con PayPal para recargas",
      },
      {
        name: "Sorteos",
        description: "Gestión de sorteos de lotería",
      },
      {
        name: "Juegos",
        description: "Gestión de juegos de lotería",
      },
      {
        name: "Usuarios",
        description: "Gestión de usuarios del sistema",
      },
    ],
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
      schemas: {
        Usuario: {
          type: "object",
          required: ["email", "password", "nombre", "apellido"],
          properties: {
            id: {
              type: "integer",
              description: "ID único del usuario",
            },
            email: {
              type: "string",
              format: "email",
              description: "Email del usuario (único)",
            },
            password: {
              type: "string",
              minLength: 6,
              description: "Contraseña del usuario",
            },
            nombre: {
              type: "string",
              description: "Nombre del usuario",
            },
            apellido: {
              type: "string",
              description: "Apellido del usuario",
            },
            fecha_nacimiento: {
              type: "string",
              format: "date",
              description: "Fecha de nacimiento",
            },
            activo: {
              type: "boolean",
              description: "Estado activo del usuario",
            },
          },
        },
        Juego: {
          type: "object",
          required: ["nombre", "descripcion", "precio_ticket"],
          properties: {
            id: {
              type: "integer",
              description: "ID único del juego",
            },
            nombre: {
              type: "string",
              description: "Nombre del juego",
            },
            descripcion: {
              type: "string",
              description: "Descripción del juego",
            },
            precio_ticket: {
              type: "number",
              format: "decimal",
              description: "Precio del ticket",
            },
            activo: {
              type: "boolean",
              description: "Estado activo del juego",
            },
          },
        },
        Sorteo: {
          type: "object",
          required: ["juego_id", "fecha_sorteo"],
          properties: {
            id: {
              type: "integer",
              description: "ID único del sorteo",
            },
            juego_id: {
              type: "integer",
              description: "ID del juego asociado",
            },
            fecha_sorteo: {
              type: "string",
              format: "date-time",
              description: "Fecha y hora del sorteo",
            },
            numeros_ganadores: {
              type: "string",
              description: "Números ganadores del sorteo",
            },
            estado: {
              type: "string",
              enum: ["pendiente", "realizado", "cancelado"],
              description: "Estado del sorteo",
            },
          },
        },
        Ticket: {
          type: "object",
          required: ["IdSorteo", "Total"],
          properties: {
            IdTicket: {
              type: "integer",
              description: "ID único del ticket",
            },
            IdUsuario: {
              type: "integer",
              description: "ID del usuario que compró el ticket",
            },
            IdSorteo: {
              type: "integer",
              description: "ID del sorteo",
            },
            FechaCompra: {
              type: "string",
              format: "date-time",
              description: "Fecha y hora de compra",
            },
            Estado: {
              type: "string",
              enum: ["pendiente", "pagado", "cancelado", "reembolsado", "anulado"],
              description: "Estado del ticket",
            },
            Total: {
              type: "number",
              format: "decimal",
              description: "Monto total del ticket en HNL",
            },
          },
        },
        Billetera: {
          type: "object",
          properties: {
            id: {
              type: "integer",
              description: "ID único de la billetera",
            },
            usuario: {
              type: "integer",
              description: "ID del usuario propietario",
            },
            saldo: {
              type: "number",
              format: "decimal",
              description: "Saldo disponible en HNL",
            },
            estado: {
              type: "string",
              enum: ["Activa", "Congelada"],
              description: "Estado de la billetera",
            },
            creada: {
              type: "string",
              format: "date-time",
              description: "Fecha de creación de la billetera",
            },
            actualizada: {
              type: "string",
              format: "date-time",
              description: "Fecha de última actualización",
            },
          },
        },
        Transaccion: {
          type: "object",
          properties: {
            id: {
              type: "integer",
              description: "ID único de la transacción",
            },
            billetera: {
              type: "integer",
              description: "ID de la billetera",
            },
            monto: {
              type: "number",
              format: "decimal",
              description: "Monto de la transacción",
            },
            tipo: {
              type: "string",
              enum: ["Recarga", "Pago", "Reembolso", "Compra de ticket"],
              description: "Tipo de transacción",
            },
            ticket: {
              type: "integer",
              nullable: true,
              description: "ID del ticket relacionado (si aplica)",
            },
            creada: {
              type: "string",
              format: "date-time",
              description: "Fecha de creación de la transacción",
            },
          },
        },
        Error: {
          type: "object",
          properties: {
            error: {
              type: "string",
              description: "Mensaje de error",
            },
            message: {
              type: "string",
              description: "Descripción detallada del error",
            },
          },
        },
        ValidationError: {
          type: "object",
          properties: {
            error: {
              type: "string",
              description: "Mensaje principal de error",
            },
            details: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  field: {
                    type: "string",
                    description: "Campo que causó el error",
                  },
                  message: {
                    type: "string",
                    description: "Descripción específica del error",
                  },
                  value: {
                    description: "Valor que causó el error",
                  },
                },
              },
            },
          },
        },
        Success: {
          type: "object",
          properties: {
            message: {
              type: "string",
              description: "Mensaje de éxito",
            },
            data: {
              type: "object",
              description: "Datos de respuesta",
            },
          },
        },
      },
      responses: {
        NotFound: {
          description: "Recurso no encontrado",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/Error",
              },
            },
          },
        },
        Unauthorized: {
          description: "No autorizado - Token inválido o faltante",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/Error",
              },
            },
          },
        },
        BadRequest: {
          description: "Solicitud incorrecta - Datos inválidos",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/Error",
              },
            },
          },
        },
        PaymentRequired: {
          description: "Saldo insuficiente en la billetera",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  error: {
                    type: "string",
                    example: "Saldo insuficiente",
                  },
                },
              },
            },
          },
        },
        InternalServerError: {
          description: "Error interno del servidor",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/Error",
              },
            },
          },
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

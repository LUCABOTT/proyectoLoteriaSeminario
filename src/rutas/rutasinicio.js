const {Router}= require('express');
const { inicio, otra } = require('../controladores/controladorinicio'); // Importamos funciones del controlador
const rutas = Router();


// Definición de rutas/ caminos para accder a esas rutas
rutas.get('/', inicio);   // GET /api/  //rutas un mini servidor, rutas son los endont par ahacer peticiones
rutas.get('/otra', otra); // GET /api/otra

module.exports= rutas;
// Aquí van solo funciones, NO app.get
// es la logica cuando se entra a la ruta
// req y res deciden que responder

//req=request=>peticion lo que se envia al servidor
/*Con req puedes acceder a cosas como:

req.params → parámetros de la URL (/api/usuarios/:id)

req.query → parámetros tipo ?nombre=Carlos&edad=20

req.body → datos enviados en el cuerpo (ej. JSON en un POST)

req.headers → encabezados HTTP (auth, content-type, etc.)

req.method → método de la petición (GET, POST, PUT, DELETE)*/

//res= response=>respuesta lo que el servidor devuelve al cliente

/*Con res puedes:

res.send() → enviar texto o HTML

res.json() → enviar JSON

res.status() → cambiar el código de estado (200, 404, 500…)

res.redirect() → redirigir a otra URL

res.end() → terminar la respuesta sin enviar nada extra*/

exports.inicio = (req, res) => {
  res.send("Hola");
};

exports.otra = (req, res) => {
  const curso = { id: 'IF361' };
  res.json(curso);
};
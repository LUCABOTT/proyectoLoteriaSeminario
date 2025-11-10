const { validationResult } = require('express-validator');
const Usuarios = require('../../modelos/modelosUsuarios/usuarios');

// 🔹 Listar todos los usuarios
exports.listar = async (req, res) => {
  try {
    const lista = await Usuarios.findAll();
    res.json(lista);
  } catch (error) {
    console.error("Error al listar usuarios:", error);
    res.status(500).json({ msj: "Error al listar usuarios", error: error.message });
  }
};

// 🔹 Crear usuario
exports.guardar = async (req, res) => {
  const errores = validationResult(req);
  if (!errores.isEmpty()) {
    const listaErrores = errores.array().map(i => ({ atributo: i.path, msj: i.msg }));
    return res.status(400).json({ msj: "Hay errores de validación", errores: listaErrores });
  }

  try {
    const {
      primerNombre,
      segundoNombre,
      primerApellido,
      segundoApellido,
      identidad,
      useremail,
      userpswd,
      userfching,
      userest,
      userpswdexp,
      useractcod,
      usertipo,
      fechaNacimiento
    } = req.body;

    const nuevoUsuario = await Usuarios.create({
      primerNombre,
      segundoNombre,
      primerApellido,
      segundoApellido,
      identidad,
      useremail,
      userpswd,
      userfching,
      userest,
      userpswdexp,
      useractcod,
      usertipo,
      fechaNacimiento
    });

    res.json({ msj: "Usuario creado correctamente", data: nuevoUsuario });

  } catch (error) {
    console.error("Error al crear usuario:", error);
    res.status(500).json({ msj: "Error al crear usuario", error: error.message });
  }
};

// 🔹 Editar usuario
exports.editar = async (req, res) => {
  const errores = validationResult(req);
  if (!errores.isEmpty()) {
    const listaErrores = errores.array().map(i => ({ atributo: i.path, msj: i.msg }));
    return res.status(400).json({ msj: "Hay errores de validación", errores: listaErrores });
  }

  try {
    const { id } = req.body;
    const {
      primerNombre,
      segundoNombre,
      primerApellido,
      segundoApellido,
      identidad,
      useremail,
      userpswd,
      userfching,
      userest,
      userpswdexp,
      useractcod,
      usertipo,
      fechaNacimiento
    } = req.body;

    const actualizado = await Usuarios.update(
      {
        primerNombre,
        segundoNombre,
        primerApellido,
        segundoApellido,
        identidad,
        useremail,
        userpswd,
        userfching,
        userest,
        userpswdexp,
        useractcod,
        usertipo,
        fechaNacimiento
      },
      { where: { id } }
    );

    if (actualizado[0] === 0) {
      return res.status(404).json({ msj: "Usuario no encontrado o sin cambios" });
    }

    res.json({ msj: "Usuario actualizado correctamente" });

  } catch (error) {
    console.error("Error al editar usuario:", error);
    res.status(500).json({ msj: "Error al editar usuario", error: error.message });
  }
};

// 🔹 Eliminar usuario
exports.eliminar = async (req, res) => {
  const errores = validationResult(req);
  if (!errores.isEmpty()) {
    const listaErrores = errores.array().map(i => ({ atributo: i.path, msj: i.msg }));
    return res.status(400).json({ msj: "Hay errores de validación", errores: listaErrores });
  }

  try {
    const { id } = req.body;

    const eliminado = await Usuarios.destroy({ where: { id } });

    if (eliminado === 0) {
      return res.status(404).json({ msj: "Usuario no encontrado" });
    }

    res.json({ msj: "Usuario eliminado correctamente", data: eliminado });

  } catch (error) {
    console.error("Error al eliminar usuario:", error);
    res.status(500).json({ msj: "Error al eliminar usuario", error: error.message });
  }
};

// 🔹 Obtener perfil del usuario autenticado
exports.obtenerPerfil = async (req, res) => {
  try {
    const userId = req.user.id;

    const usuario = await Usuarios.findByPk(userId, {
      attributes: { exclude: ['userpswd', 'useractcod'] }
    });

    if (!usuario) {
      return res.status(404).json({ msj: "Usuario no encontrado" });
    }

    res.json(usuario);

  } catch (error) {
    console.error("Error al obtener perfil:", error);
    res.status(500).json({ msj: "Error al obtener perfil", error: error.message });
  }
};


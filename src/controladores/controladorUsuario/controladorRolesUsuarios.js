const { validationResult } = require('express-validator');
const RolesUsuarios = require('../../modelos/modelosUsuarios/roles_usuarios');

// 🔹 Listar todos los roles de usuarios
exports.listar = async (req, res) => {
  try {
    const lista = await RolesUsuarios.findAll();
    res.json(lista);
  } catch (error) {
    console.error("Error al listar roles de usuarios:", error);
    res.status(500).json({ msj: "Error al listar roles de usuarios", error: error.message });
  }
};

// 🔹 Crear rol de usuario
exports.guardar = async (req, res) => {
  const errores = validationResult(req);
  if (!errores.isEmpty()) {
    const listaErrores = errores.array().map(i => ({ atributo: i.path, msj: i.msg }));
    return res.status(400).json({ msj: "Hay errores de validación", errores: listaErrores });
  }

  try {
    const { usercod, rolescod, roleuserest, roleuserfch, roleuserexp } = req.body;

    // Validar que no exista la relación ya
    const existente = await RolesUsuarios.findOne({ where: { usercod, rolescod } });
    if (existente) {
      return res.status(400).json({ msj: "Este usuario ya tiene asignado este rol" });
    }

    const nuevoRolUsuario = await RolesUsuarios.create({ usercod, rolescod, roleuserest, roleuserfch, roleuserexp });
    res.json({ msj: "Rol asignado al usuario correctamente", data: nuevoRolUsuario });

  } catch (error) {
    console.error("Error al asignar rol al usuario:", error);
    res.status(500).json({ msj: "Error al asignar rol al usuario", error: error.message });
  }
};

// 🔹 Editar rol de usuario
exports.editar = async (req, res) => {
  const errores = validationResult(req);
  if (!errores.isEmpty()) {
    const listaErrores = errores.array().map(i => ({ atributo: i.path, msj: i.msg }));
    return res.status(400).json({ msj: "Hay errores de validación", errores: listaErrores });
  }

  try {
    const { usercod, rolescod, roleuserest, roleuserfch, roleuserexp } = req.body;

    const actualizado = await RolesUsuarios.update(
      { roleuserest, roleuserfch, roleuserexp },
      { where: { usercod, rolescod } }
    );

    if (actualizado[0] === 0) {
      return res.status(404).json({ msj: "Relación usuario-rol no encontrada o sin cambios" });
    }

    res.json({ msj: "Relación usuario-rol actualizada correctamente" });

  } catch (error) {
    console.error("Error al editar relación usuario-rol:", error);
    res.status(500).json({ msj: "Error al editar relación usuario-rol", error: error.message });
  }
};

// 🔹 Eliminar rol de usuario
exports.eliminar = async (req, res) => {
  const errores = validationResult(req);
  if (!errores.isEmpty()) {
    const listaErrores = errores.array().map(i => ({ atributo: i.path, msj: i.msg }));
    return res.status(400).json({ msj: "Hay errores de validación", errores: listaErrores });
  }

  try {
    const { usercod, rolescod } = req.body;

    const eliminado = await RolesUsuarios.destroy({ where: { usercod, rolescod } });

    if (eliminado === 0) {
      return res.status(404).json({ msj: "Relación usuario-rol no encontrada" });
    }

    res.json({ msj: "Relación usuario-rol eliminada correctamente", data: eliminado });

  } catch (error) {
    console.error("Error al eliminar relación usuario-rol:", error);
    res.status(500).json({ msj: "Error al eliminar relación usuario-rol", error: error.message });
  }
};

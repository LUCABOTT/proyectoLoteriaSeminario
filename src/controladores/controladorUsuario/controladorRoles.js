const { validationResult } = require('express-validator');
const Roles = require('../../modelos/modelosUsuarios/roles');

// 🔹 Listar todos los roles
exports.listar = async (req, res) => {
  try {
    const lista = await Roles.findAll();
    res.json(lista);
  } catch (error) {
    console.error("Error al listar roles:", error);
    res.status(500).json({ msj: "Error al listar roles", error: error.message });
  }
};

// 🔹 Crear rol
exports.guardar = async (req, res) => {
  const errores = validationResult(req);
  if (!errores.isEmpty()) {
    const listaErrores = errores.array().map(i => ({ atributo: i.path, msj: i.msg }));
    return res.status(400).json({ msj: "Hay errores de validación", errores: listaErrores });
  }

  try {
    const { rolescod, rolesdsc, rolesest } = req.body;

    const existente = await Roles.findOne({ where: { rolescod } });
    if (existente) {
      return res.status(400).json({ msj: "Ya existe un rol con ese código" });
    }

    const nuevoRol = await Roles.create({ rolescod, rolesdsc, rolesest });
    res.json({ msj: "Rol creado correctamente", data: nuevoRol });

  } catch (error) {
    console.error("Error al crear rol:", error);
    res.status(500).json({ msj: "Error al crear rol", error: error.message });
  }
};

// 🔹 Editar rol
exports.editar = async (req, res) => {
  const errores = validationResult(req);
  if (!errores.isEmpty()) {
    const listaErrores = errores.array().map(i => ({ atributo: i.path, msj: i.msg }));
    return res.status(400).json({ msj: "Hay errores de validación", errores: listaErrores });
  }

  try {
    const { rolescod, rolesdsc, rolesest } = req.body;

    const actualizado = await Roles.update(
      { rolesdsc, rolesest },
      { where: { rolescod } }
    );

    if (actualizado[0] === 0) {
      return res.status(404).json({ msj: "Rol no encontrado o sin cambios" });
    }

    res.json({ msj: "Rol actualizado correctamente" });

  } catch (error) {
    console.error("Error al editar rol:", error);
    res.status(500).json({ msj: "Error al editar rol", error: error.message });
  }
};

// 🔹 Eliminar rol
exports.eliminar = async (req, res) => {
  const errores = validationResult(req);
  if (!errores.isEmpty()) {
    const listaErrores = errores.array().map(i => ({ atributo: i.path, msj: i.msg }));
    return res.status(400).json({ msj: "Hay errores de validación", errores: listaErrores });
  }

  try {
    const { rolescod } = req.body;

    const eliminado = await Roles.destroy({ where: { rolescod } });

    if (eliminado === 0) {
      return res.status(404).json({ msj: "Rol no encontrado" });
    }

    res.json({ msj: "Rol eliminado correctamente", data: eliminado });

  } catch (error) {
    console.error("Error al eliminar rol:", error);
    res.status(500).json({ msj: "Error al eliminar rol", error: error.message });
  }
};

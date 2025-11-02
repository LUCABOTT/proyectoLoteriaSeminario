const { validationResult } = require('express-validator');
const FuncionesRoles = require('../../modelos/modelosUsuarios/funciones_roles');

// 🔹 Listar todas las funciones por rol
exports.listar = async (req, res) => {
  try {
    const lista = await FuncionesRoles.findAll();
    res.json(lista);
  } catch (error) {
    console.error("Error al listar funciones por rol:", error);
    res.status(500).json({ msj: "Error al listar funciones por rol", error: error.message });
  }
};

// 🔹 Asignar función a rol
exports.guardar = async (req, res) => {
  const errores = validationResult(req);
  if (!errores.isEmpty()) {
    const listaErrores = errores.array().map(i => ({ atributo: i.path, msj: i.msg }));
    return res.status(400).json({ msj: "Hay errores de validación", errores: listaErrores });
  }

  try {
    const { rolescod, fncod, fnrolest, fnexp } = req.body;

    const existente = await FuncionesRoles.findOne({ where: { rolescod, fncod } });
    if (existente) {
      return res.status(400).json({ msj: "Este rol ya tiene asignada esta función" });
    }

    const nuevaRelacion = await FuncionesRoles.create({ rolescod, fncod, fnrolest, fnexp });
    res.json({ msj: "Función asignada al rol correctamente", data: nuevaRelacion });

  } catch (error) {
    console.error("Error al asignar función al rol:", error);
    res.status(500).json({ msj: "Error al asignar función al rol", error: error.message });
  }
};

// 🔹 Editar función asignada a rol
exports.editar = async (req, res) => {
  const errores = validationResult(req);
  if (!errores.isEmpty()) {
    const listaErrores = errores.array().map(i => ({ atributo: i.path, msj: i.msg }));
    return res.status(400).json({ msj: "Hay errores de validación", errores: listaErrores });
  }

  try {
    const { rolescod, fncod, fnrolest, fnexp } = req.body;

    const actualizado = await FuncionesRoles.update(
      { fnrolest, fnexp },
      { where: { rolescod, fncod } }
    );

    if (actualizado[0] === 0) {
      return res.status(404).json({ msj: "Relación rol-función no encontrada o sin cambios" });
    }

    res.json({ msj: "Relación rol-función actualizada correctamente" });

  } catch (error) {
    console.error("Error al editar relación rol-función:", error);
    res.status(500).json({ msj: "Error al editar relación rol-función", error: error.message });
  }
};

// 🔹 Eliminar función de rol
exports.eliminar = async (req, res) => {
  const errores = validationResult(req);
  if (!errores.isEmpty()) {
    const listaErrores = errores.array().map(i => ({ atributo: i.path, msj: i.msg }));
    return res.status(400).json({ msj: "Hay errores de validación", errores: listaErrores });
  }

  try {
    const { rolescod, fncod } = req.body;

    const eliminado = await FuncionesRoles.destroy({ where: { rolescod, fncod } });

    if (eliminado === 0) {
      return res.status(404).json({ msj: "Relación rol-función no encontrada" });
    }

    res.json({ msj: "Relación rol-función eliminada correctamente", data: eliminado });

  } catch (error) {
    console.error("Error al eliminar relación rol-función:", error);
    res.status(500).json({ msj: "Error al eliminar relación rol-función", error: error.message });
  }
};

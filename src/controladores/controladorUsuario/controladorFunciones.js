const { validationResult } = require('express-validator');
const Funciones = require('../../modelos/modelosUsuarios/funciones');

// 🔹 Listar todas las funciones
exports.listar = async (req, res) => {
  try {
    const lista = await Funciones.findAll();
    res.json(lista);
  } catch (error) {
    console.error("Error al listar funciones:", error);
    res.status(500).json({ msj: "Error al listar funciones", error: error.message });
  }
};

// 🔹 Crear función
exports.guardar = async (req, res) => {
  const errores = validationResult(req);
  if (!errores.isEmpty()) {
    const listaErrores = errores.array().map(i => ({ atributo: i.path, msj: i.msg }));
    return res.status(400).json({ msj: "Hay errores de validación", errores: listaErrores });
  }

  try {
    const { fncod, fndsc, fnest, fntyp } = req.body;

    const existente = await Funciones.findOne({ where: { fncod } });
    if (existente) {
      return res.status(400).json({ msj: "Ya existe una función con este código" });
    }

    const nuevaFuncion = await Funciones.create({ fncod, fndsc, fnest, fntyp });
    res.json({ msj: "Función creada correctamente", data: nuevaFuncion });

  } catch (error) {
    console.error("Error al crear función:", error);
    res.status(500).json({ msj: "Error al crear función", error: error.message });
  }
};

// 🔹 Editar función
exports.editar = async (req, res) => {
  const errores = validationResult(req);
  if (!errores.isEmpty()) {
    const listaErrores = errores.array().map(i => ({ atributo: i.path, msj: i.msg }));
    return res.status(400).json({ msj: "Hay errores de validación", errores: listaErrores });
  }

  try {
    const { fncod, fndsc, fnest, fntyp } = req.body;

    const actualizado = await Funciones.update(
      { fndsc, fnest, fntyp },
      { where: { fncod } }
    );

    if (actualizado[0] === 0) {
      return res.status(404).json({ msj: "Función no encontrada o sin cambios" });
    }

    res.json({ msj: "Función actualizada correctamente" });

  } catch (error) {
    console.error("Error al editar función:", error);
    res.status(500).json({ msj: "Error al editar función", error: error.message });
  }
};

// 🔹 Eliminar función
exports.eliminar = async (req, res) => {
  const errores = validationResult(req);
  if (!errores.isEmpty()) {
    const listaErrores = errores.array().map(i => ({ atributo: i.path, msj: i.msg }));
    return res.status(400).json({ msj: "Hay errores de validación", errores: listaErrores });
  }

  try {
    const { fncod } = req.body;

    const eliminado = await Funciones.destroy({ where: { fncod } });

    if (eliminado === 0) {
      return res.status(404).json({ msj: "Función no encontrada" });
    }

    res.json({ msj: "Función eliminada correctamente", data: eliminado });

  } catch (error) {
    console.error("Error al eliminar función:", error);
    res.status(500).json({ msj: "Error al eliminar función", error: error.message });
  }
};

const { validationResult } = require('express-validator');
const TelefonosUsuarios = require('../../modelos/modelosUsuarios/telefonoUsuario');

// 🔹 Listar todos los teléfonos
exports.listar = async (req, res) => {
  try {
    const lista = await TelefonosUsuarios.findAll();
    res.json(lista);
  } catch (error) {
    console.error("Error al listar teléfonos:", error);
    res.status(500).json({ msj: "Error al listar teléfonos", error: error.message });
  }
};

// 🔹 Crear teléfono
exports.guardar = async (req, res) => {
  const errores = validationResult(req);
  if (!errores.isEmpty()) {
    const listaErrores = errores.array().map(i => ({ atributo: i.path, msj: i.msg }));
    return res.status(400).json({ msj: "Hay errores de validación", errores: listaErrores });
  }

  try {
    const { numero, idUsuario } = req.body;

    const nuevoTelefono = await TelefonosUsuarios.create({
      numero,
      idUsuario
    });

    res.json({ msj: "Teléfono agregado correctamente", data: nuevoTelefono });

  } catch (error) {
    console.error("Error al guardar teléfono:", error);
    res.status(500).json({ msj: "Error al guardar teléfono", error: error.message });
  }
};

// 🔹 Editar teléfono
exports.editar = async (req, res) => {
  const errores = validationResult(req);
  if (!errores.isEmpty()) {
    const listaErrores = errores.array().map(i => ({ atributo: i.path, msj: i.msg }));
    return res.status(400).json({ msj: "Hay errores de validación", errores: listaErrores });
  }

  try {
    const { id, numero, idUsuario } = req.body;

    const actualizado = await TelefonosUsuarios.update(
      { numero, idUsuario },
      { where: { id } }
    );

    if (actualizado[0] === 0) {
      return res.status(404).json({ msj: "Teléfono no encontrado o sin cambios" });
    }

    res.json({ msj: "Teléfono actualizado correctamente" });

  } catch (error) {
    console.error("Error al editar teléfono:", error);
    res.status(500).json({ msj: "Error al editar teléfono", error: error.message });
  }
};

// 🔹 Eliminar teléfono
exports.eliminar = async (req, res) => {
  const errores = validationResult(req);
  if (!errores.isEmpty()) {
    const listaErrores = errores.array().map(i => ({ atributo: i.path, msj: i.msg }));
    return res.status(400).json({ msj: "Hay errores de validación", errores: listaErrores });
  }

  try {
    const { id } = req.body;

    const eliminado = await TelefonosUsuarios.destroy({ where: { id } });

    if (eliminado === 0) {
      return res.status(404).json({ msj: "Teléfono no encontrado" });
    }

    res.json({ msj: "Teléfono eliminado correctamente", data: eliminado });

  } catch (error) {
    console.error("Error al eliminar teléfono:", error);
    res.status(500).json({ msj: "Error al eliminar teléfono", error: error.message });
  }
};

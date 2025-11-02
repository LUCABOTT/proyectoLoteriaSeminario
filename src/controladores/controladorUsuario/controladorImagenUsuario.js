const { validationResult } = require('express-validator');
const ImagenesUsuarios = require('../../modelos/modelosUsuarios/imagenes');
const { uploadImagenUsuario } = require('../../configuracion/archivos');
const multer = require('multer');
const fs = require('fs');
const path = require('path');


// 🔹 Listar todas las imágenes
exports.listar = async (req, res) => {
  try {
    const lista = await ImagenesUsuarios.findAll();
    res.json(lista);
  } catch (error) {
    console.error("Error al listar imágenes:", error);
    res.status(500).json({ msj: "Error al listar imágenes" });
  }
};

// 🔹 Guardar imagen
exports.guardar = async (req, res) => {
  const errores = validationResult(req);
  if (!errores.isEmpty()) {
    const data = errores.array().map(i => ({ atributo: i.path, msj: i.msg }));
    return res.status(400).json({ msj: "Errores de validación", errores: data });
  }

  try {
    const { url, usuarioId } = req.body;

    const nuevaImagen = await ImagenesUsuarios.create({ url, usuarioId });

    res.json({ msj: "Imagen guardada correctamente", data: nuevaImagen });
  } catch (error) {
    console.error("Error al guardar imagen:", error);
    res.status(500).json({ msj: "Error al guardar imagen", error: error.message });
  }
};

// 🔹 Editar imagen
exports.editar = async (req, res) => {
  const errores = validationResult(req);
  if (!errores.isEmpty()) {
    const data = errores.array().map(i => ({ atributo: i.path, msj: i.msg }));
    return res.status(400).json({ msj: "Errores de validación", errores: data });
  }

  try {
    const { id, url, usuarioId } = req.body;

    const actualizado = await ImagenesUsuarios.update(
      { url, usuarioId },
      { where: { id } }
    );

    if (actualizado[0] === 0) {
      return res.status(404).json({ msj: "Imagen no encontrada o sin cambios" });
    }

    res.json({ msj: "Imagen actualizada correctamente" });
  } catch (error) {
    console.error("Error al editar imagen:", error);
    res.status(500).json({ msj: "Error al editar imagen", error: error.message });
  }
};

// 🔹 Eliminar imagen
exports.eliminar = async (req, res) => {
  const errores = validationResult(req);
  if (!errores.isEmpty()) {
    const data = errores.array().map(i => ({ atributo: i.path, msj: i.msg }));
    return res.status(400).json({ msj: "Errores de validación", errores: data });
  }

  try {
    const { id } = req.body;

    const eliminado = await ImagenesUsuarios.destroy({ where: { id } });

    if (eliminado === 0) {
      return res.status(404).json({ msj: "Imagen no encontrada" });
    }

    res.json({ msj: "Imagen eliminada correctamente", data: eliminado });
  } catch (error) {
    console.error("Error al eliminar imagen:", error);
    res.status(500).json({ msj: "Error al eliminar imagen", error: error.message });
  }
};

exports.validarImagenUsuario = ( req, res, next) =>{
  const errors = validationResult(req);
  if(! errors.isEmpty()){
    return res.status(400).json(errors.array());
  }
  else{
    uploadImagenUsuario(req, res, (err) =>{
      if (err instanceof multer.MulterError){
        res.status(400).json({msj: "hay errores al cargar la imagen"})
      }
      else if (err){
        res.status(400).json({msj: "hay errores al cargar la iagen"})
      }
      else{
        next();
      }
    });
  }
};



exports.guardarImagenUsuario = async (req, res, next) => {
  try {
    // Validar errores de express-validator
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json(errors.array());
    }

    const { usuarioId } = req.query;
    const url = req.file.filename;
    const rutaImagen = req.file.path; // ruta real que Multer ya creó

    // Verificar existencia
    if (fs.existsSync(rutaImagen)) {
      const data = await ImagenesUsuarios.create({ url, usuarioId }); // usar await

      return res.status(201).json({
        mensaje: "Imagen guardada correctamente",
        data
      });
    } else {
      return res.status(400).json({
        mensaje: "No se ha podido almacenar la imagen"
      });
    }

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      mensaje: "Error interno del servidor",
      error: error.message
    });
  }
};

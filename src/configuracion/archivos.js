const multer = require("multer");
const path = require("path");


// 🔹 Función para redimensionar imágenes grandes
exports.resizeImage = async (file) => {
  const { buffer } = file;
  const maxSize = 5 * 1024 * 1024; // 5 MB

  if (buffer.length > maxSize) {
    const resizedImage = await sharp(buffer)
      .resize({ width: 800 }) // corrige "wigth"
      .toBuffer();
    return resizedImage;
  }

  return buffer;
};

// 🔹 Configuración de almacenamiento de Multer
const diskStorageClientes = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null,path.join(__dirname, "../../public/img/usuarios")); // carpeta donde se guardarán
  },
  filename: (req, file, cb) => {
    if (
      file.mimetype === "image/jpeg" ||
      file.mimetype === "image/png" ||
      file.mimetype === "image/jpg"
    ) {
      const uniqueSuffix = Math.round(Math.random() * (99999 - 10000)) + 10000;

      const ext = path.extname(file.originalname);
      cb(
                null,
                "cliente-" +
                Date.now() +
                uniqueSuffix +
                "-" +
                file.mimetype.replace("/", ".")
            );
    } else {
      cb(new Error("Tipo de archivo no permitido"), false);
    }
  },
});

// 🔹 Filtro de archivos permitidos
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/png", "image/jpg", "image/jpeg"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Solo se pueden subir archivos PNG, JPEG o JPG"), false);
  }
};

// 🔹 Configuración final del middleware de subida
exports.uploadImagenCliente = multer({
  storage: diskStorageClientes,
    fileFilter: (req, file, cb) => {

        if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg") {
            cb(null, true);
        } else {
            cb(null, false);
            return cb(new Error("Solo archivos png, jpeg o jpg"));
        }
    },
    limits: {
        fileSize: 5000000, // 5MB
    },
}).single("imagen"); // atributo que define como se va llamar el contenerdor e la imagen

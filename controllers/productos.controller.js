const Producto = require("../models/producto.model");

function obtenerProductos(req, res) {
  const productos = Producto.obtenerTodos();
  res.json(productos);
}

function obtenerProductoPorId(req, res) {
  const id = Number(req.params.id);
  const producto = Producto.obtenerPorId(id);

  if (!producto) {
    return res.status(404).json({ mensaje: "Concierto no encontrado." });
  }

  res.json(producto);
}

function crearProducto(req, res) {
  const { nombre, precio, fecha, recinto, ciudad, stock, imagen } = req.body;

  if (!nombre || precio === undefined || !fecha || !recinto || !ciudad || stock === undefined) {
    return res.status(400).json({
      mensaje: "Todos los campos son obligatorios."
    });
  }

  if (Number(precio) <= 0) {
    return res.status(400).json({ mensaje: "El precio debe ser mayor que cero." });
  }

  if (Number(stock) < 0) {
    return res.status(400).json({ mensaje: "Los boletos disponibles no pueden ser negativos." });
  }

  const nuevoProducto = Producto.crear({
    nombre,
    precio: Number(precio),
    fecha,
    recinto,
    ciudad,
    stock: Number(stock),
    imagen
  });

  res.status(201).json(nuevoProducto);
}

function actualizarProducto(req, res) {
  const id = Number(req.params.id);
  const { nombre, precio, fecha, recinto, ciudad, stock, imagen } = req.body;

  const productoActualizado = Producto.actualizar(id, {
    nombre,
    precio: Number(precio),
    fecha,
    recinto,
    ciudad,
    stock: Number(stock),
    imagen
  });

  if (!productoActualizado) {
    return res.status(404).json({ mensaje: "Concierto no encontrado." });
  }

  res.json(productoActualizado);
}

function eliminarProducto(req, res) {
  const id = Number(req.params.id);
  const eliminado = Producto.eliminar(id);

  if (!eliminado) {
    return res.status(404).json({ mensaje: "Concierto no encontrado." });
  }

  res.json({ mensaje: "Concierto eliminado correctamente." });
}

module.exports = {
  obtenerProductos,
  obtenerProductoPorId,
  crearProducto,
  actualizarProducto,
  eliminarProducto
};
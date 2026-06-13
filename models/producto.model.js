const fs = require("fs");
const path = require("path");

const rutaArchivo = path.join(__dirname, "../data/productos.json");

function leerProductos() {
  const datos = fs.readFileSync(rutaArchivo, "utf-8");
  return JSON.parse(datos);
}

function guardarProductos(productos) {
  fs.writeFileSync(rutaArchivo, JSON.stringify(productos, null, 2));
}

function obtenerTodos() {
  return leerProductos();
}

function obtenerPorId(id) {
  const productos = leerProductos();
  return productos.find(producto => producto.id === id);
}

function crear(datosProducto) {
  const productos = leerProductos();

  const nuevoProducto = {
    id: productos.length > 0 ? productos[productos.length - 1].id + 1 : 1,
    ...datosProducto
  };

  productos.push(nuevoProducto);
  guardarProductos(productos);

  return nuevoProducto;
}

function actualizar(id, datosProducto) {
  const productos = leerProductos();
  const indice = productos.findIndex(producto => producto.id === id);

  if (indice === -1) {
    return null;
  }

  productos[indice] = {
    id,
    ...datosProducto
  };

  guardarProductos(productos);
  return productos[indice];
}

function eliminar(id) {
  const productos = leerProductos();
  const productosFiltrados = productos.filter(producto => producto.id !== id);

  if (productos.length === productosFiltrados.length) {
    return false;
  }

  guardarProductos(productosFiltrados);
  return true;
}

function guardarProductos(productos) {
fs.writeFileSync(
rutaArchivo,
JSON.stringify(productos, null, 2)
);
}

module.exports = {
  obtenerTodos,
  obtenerPorId,
  crear,
  actualizar,
  eliminar
};
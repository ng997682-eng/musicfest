// 1. Selección de elementos del DOM
const tabs = document.querySelectorAll(".tab");
const contenidos = document.querySelectorAll(".tab-content");

const listaProductos = document.getElementById("lista-productos");
const formProducto = document.getElementById("form-producto");
const mensaje = document.getElementById("mensaje");

const btnCargarProductos = document.getElementById("btn-cargar-productos");
const btnEstadisticas = document.getElementById("btn-estadisticas");
const resumenEstadisticas = document.getElementById("resumen-estadisticas");

const busqueda = document.getElementById("busqueda");
const btnBuscar = document.getElementById("btn-buscar");
const resultadosBusqueda = document.getElementById("resultados-busqueda");

const productoId = document.getElementById("producto-id");
const btnGuardar = document.getElementById("btn-guardar");
const btnCancelarEdicion = document.getElementById("btn-cancelar-edicion");

let productos = [];

// 2. Navegación por pestañas
tabs.forEach(tab => {
  tab.addEventListener("click", () => {
    tabs.forEach(t => t.classList.remove("active"));
    contenidos.forEach(c => c.classList.remove("active"));

    tab.classList.add("active");

    const idContenido = tab.dataset.tab;
    document.getElementById(idContenido).classList.add("active");
  });
});


// 3. Consultar productos del backend
async function obtenerProductos() {
  try {
    const respuesta = await fetch("/productos");

    if (!respuesta.ok) {
      throw new Error("No se pudieron obtener los productos.");
    }

    productos = await respuesta.json();
    mostrarProductos(productos, listaProductos);

  } catch (error) {
    listaProductos.innerHTML = `<p class="error">${error.message}</p>`;
  }
}

// 4. Mostrar productos en la interfaz
function mostrarProductos(lista, contenedor) {
  contenedor.innerHTML = "";

  if (lista.length === 0) {
    contenedor.innerHTML = "<p>No hay productos para mostrar.</p>";
    return;
  }

  lista.forEach(producto => {
    const tarjeta = document.createElement("article");
    tarjeta.classList.add("producto-card");

    tarjeta.innerHTML = `
<h3>${producto.nombre}</h3>

<p><strong>Precio del boleto:</strong> $${producto.precio}</p>

<p><strong>Día y escenario:</strong> ${producto.categoria}</p>

<p><strong>Boletos disponibles:</strong> ${producto.stock}</p>

<button type="button" onclick="editarProducto(${producto.id})">
Editar
</button>

<button type="button" onclick="actualizarStock(${producto.id})">
Actualizar stock
</button>

<button type="button" onclick="eliminarProducto(${producto.id})">
Eliminar
</button>
`;

    contenedor.appendChild(tarjeta);
  });
}



// 5. función editarProducto(id)
function editarProducto(id) {
const producto = productos.find(p => p.id === id);

if (!producto) {
mensaje.textContent = "Artista no encontrado.";
mensaje.className = "mensaje-error";
return;
}
productoId.value = producto.id;
document.getElementById("nombre").value = producto.nombre;
document.getElementById("precio").value = producto.precio;
document.getElementById("categoria").value = producto.categoria;
document.getElementById("stock").value = producto.stock;
btnGuardar.textContent = "Actualizar artista";
mensaje.textContent = "Editando artista. Modifica los datos y guarda los cambios.";
mensaje.className = "mensaje-exito";
cambiarPestana("agregar");
}

//submit del formulario
formProducto.addEventListener("submit", async event => {
  event.preventDefault();

  const id = productoId.value;

  const producto = {
    nombre: document.getElementById("nombre").value,
    precio: Number(document.getElementById("precio").value),
    categoria: document.getElementById("categoria").value,
    stock: Number(document.getElementById("stock").value)
  };

  const url = id ? `/productos/${id}` : "/productos";
  const metodo = id ? "PUT" : "POST";

  try {
    const respuesta = await fetch(url, {
      method: metodo,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(producto)
    });

    if (!respuesta.ok) {
      const error = await respuesta.json();
      throw new Error(error.mensaje || "No se pudo guardar el artista.");
    }

    mensaje.textContent = id
      ? "Artista actualizado correctamente."
      : "Artista registrado correctamente.";
      
      

    mensaje.className = "mensaje-exito";
    formProducto.reset();
    productoId.value = "";
    btnGuardar.textContent = "Guardar artista";
    await obtenerProductos();
    cambiarPestana("productos");

  } catch (error) {
    mensaje.textContent = error.message;
    mensaje.className = "mensaje-error";
  }
});

// 6. Buscar productos
btnBuscar.addEventListener("click", async () => {
  if (productos.length === 0) {
    await obtenerProductos();
  }

  const texto = busqueda.value.toLowerCase().trim();

  const filtrados = productos.filter(producto => {
    return producto.nombre.toLowerCase().includes(texto) ||
           producto.categoria.toLowerCase().includes(texto);
  });

  mostrarProductos(filtrados, resultadosBusqueda);
});


// 7. Calcular estadísticas
btnEstadisticas.addEventListener("click", async () => {
  if (productos.length === 0) {
    await obtenerProductos();
  }

  if (productos.length === 0) {
    resumenEstadisticas.innerHTML = "<p>No hay productos registrados.</p>";
    return;
  }

  const totalProductos = productos.length;

  const sumaPrecios = productos.reduce((suma, producto) => {
    return suma + producto.precio;
  }, 0);

  const precioPromedio = sumaPrecios / totalProductos;

  const productoMasCaro = productos.reduce((mayor, producto) => {
    return producto.precio > mayor.precio ? producto : mayor;
  }, productos[0]);

  const totalStock = productos.reduce((suma, producto) => {
    return suma + producto.stock;
  }, 0);

async function editarProducto(id) {
    const respuesta = await fetch(`/productos/${id}`);
    const producto = await respuesta.json();

    document.getElementById("productoId").value = producto.id;
    document.getElementById("nombre").value = producto.nombre;
    document.getElementById("precio").value = producto.precio;
    document.getElementById("categoria").value = producto.categoria;
    document.getElementById("stock").value = producto.stock;

    btnGuardar.textContent = "Guardar artista";
}
  //Cancelar Edición
btnCancelarEdicion.addEventListener("click", cancelarEdicion);
function cancelarEdicion() {
formProducto.reset();
productoId.value = "";
btnGuardar.textContent = "Guardar artista";
mensaje.textContent = "Edición cancelada.";
mensaje.className = "mensaje-exito";
}

  resumenEstadisticas.innerHTML = `
    <div class="estadistica">
      <strong>Total de artistas:</strong> ${totalProductos}
    </div>

    <div class="estadistica">
      <strong>Precio promedio del boleto:</strong> $${precioPromedio.toFixed(2)}
    </div>

    <div class="estadistica">
      <strong>Artista con boleto más caro:</strong> ${productoMasCaro.nombre} ($${productoMasCaro.precio})
    </div>

    <div class="estadistica">
      <strong>Total de boletos disponibles:</strong> ${totalStock}
    </div>
  `;
});

// 8. Carga inicial
obtenerProductos();


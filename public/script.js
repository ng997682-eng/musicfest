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
function cambiarPestana(idContenido) {
  tabs.forEach(t => t.classList.remove("active"));
  contenidos.forEach(c => c.classList.remove("active"));

  const tabSeleccionada = document.querySelector(`[data-tab="${idContenido}"]`);
  const contenidoSeleccionado = document.getElementById(idContenido);

  if (tabSeleccionada && contenidoSeleccionado) {
    tabSeleccionada.classList.add("active");
    contenidoSeleccionado.classList.add("active");
  }
}

tabs.forEach(tab => {
  tab.addEventListener("click", () => {
    cambiarPestana(tab.dataset.tab);
  });
});


// 3. Consultar conciertos del backend
async function obtenerProductos() {
  try {
    const respuesta = await fetch("/productos");

    if (!respuesta.ok) {
      throw new Error("No se pudieron obtener los conciertos.");
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
    contenedor.innerHTML = "<p>No hay conciertos para mostrar.</p>";
    return;
  }

  lista.forEach(producto => {
    const tarjeta = document.createElement("article");
    tarjeta.classList.add("producto-card");

  tarjeta.innerHTML = `

  <h3>${producto.nombre}</h3>

  <p><strong>Precio del boleto:</strong> $${producto.precio}</p>

  <p><strong>Recinto y ciudad:</strong> ${producto.categoria}</p>

  <p><strong>Boletos disponibles:</strong> ${producto.stock}</p>

  <button type="button" onclick="editarProducto(${producto.id})">
    Editar concierto
  </button>

  <button type="button" onclick="actualizarStock(${producto.id})">
    Actualizar boletos
  </button>
 
  <button type="button" onclick="eliminarProducto(${producto.id})">
    Eliminar concierto
  </button>

`;

    contenedor.appendChild(tarjeta);
  });
}



// 5. función Editar artista(id)
function editarProducto(id) {
const producto = productos.find(p => p.id === id);

if (!producto) {
mensaje.textContent = "Concierto no encontrado.";
mensaje.className = "mensaje-error";
return;
}
productoId.value = producto.id;
document.getElementById("nombre").value = producto.nombre;
document.getElementById("precio").value = producto.precio;
document.getElementById("categoria").value = producto.categoria;
document.getElementById("stock").value = producto.stock;
btnGuardar.textContent = "Actualizar concierto";
mensaje.textContent = "Editando concierto. Modifica los datos y guarda los cambios.";
mensaje.className = "mensaje-exito";
cambiarPestana("agregar");
}

//Función edtitar stock(id)
async function actualizarStock(id) {
  const producto = productos.find(p => p.id === id);

  if (!producto) {
    mensaje.textContent = "Concierto no encontrado.";
    mensaje.className = "mensaje-error";
    return;
  }

  const nuevoStock = prompt("Ingresa la nueva cantidad de boletos:", producto.stock);

  if (nuevoStock === null) {
    return;
  }

  const stockNumero = Number(nuevoStock);

  if (isNaN(stockNumero) || stockNumero < 0) {
    mensaje.textContent = "La cantidad de boletos debe ser un número válido.";
    mensaje.className = "mensaje-error";
    return;
  }

  const productoActualizado = {
    nombre: producto.nombre,
    precio: producto.precio,
    categoria: producto.categoria,
    stock: stockNumero
  };

  try {
    const respuesta = await fetch(`/productos/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(productoActualizado)
    });

    if (!respuesta.ok) {
      const error = await respuesta.json();
      throw new Error(error.mensaje || "No se pudieron actualizar los boletos.");
    }

    mensaje.textContent = "Boletos actualizados correctamente.";
    mensaje.className = "mensaje-exito";

    await obtenerProductos();

  } catch (error) {
    mensaje.textContent = error.message;
    mensaje.className = "mensaje-error";
  }
}
//Función eliminar producto(id)
async function eliminarProducto(id) {
  const confirmar = confirm("¿Seguro que quieres eliminar este concierto?");

  if (!confirmar) {
    return;
  }

  try {
    const respuesta = await fetch(`/productos/${id}`, {
      method: "DELETE"
    });

    if (!respuesta.ok) {
      const error = await respuesta.json();
      throw new Error(error.mensaje || "No se pudo eliminar el concierto.");
    }

    mensaje.textContent = "Concierto eliminado correctamente.";
    mensaje.className = "mensaje-exito";

    await obtenerProductos();

  } catch (error) {
    mensaje.textContent = error.message;
    mensaje.className = "mensaje-error";
  }
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
      throw new Error(error.mensaje || "No se pudo guardar el concierto.");
    }

  mensaje.textContent = id
  ? "Concierto actualizado correctamente."
  : "Concierto registrado correctamente.";
      
      

    mensaje.className = "mensaje-exito";
    formProducto.reset();
    productoId.value = "";
    btnGuardar.textContent = "Guardar concierto";
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

  const filtrados = productos.filter(concierto => {
  return concierto.nombre.toLowerCase().includes(texto) ||
         concierto.categoria.toLowerCase().includes(texto);
});

mostrarProductos(filtrados, resultadosBusqueda);
});


// 7. Calcular estadísticas
btnEstadisticas.addEventListener("click", async () => {
  if (productos.length === 0) {
    await obtenerProductos();
  }

  if (productos.length === 0) {
    resumenEstadisticas.innerHTML = "<p>No hay conciertos registrados.</p>";
    return;
  }

  const totalProductos = productos.length;

  const sumaPrecios = productos.reduce((suma, producto) => {
    return suma + producto.precio;
  }, 0);

  const precioPromedio = sumaPrecios / totalProductos;
  const precioMasAlto = Math.max(...productos.map(concierto => concierto.precio));
  const precioMasBajo = Math.min(...productos.map(concierto => concierto.precio));

  const productoMasCaro = productos.reduce((mayor, producto) => {
    return producto.precio > mayor.precio ? producto : mayor;
  }, productos[0]);

  const conciertoMasBoletos = productos.reduce((mayor, concierto) => {
  return concierto.stock > mayor.stock ? concierto : mayor;
}, productos[0]);

  const totalStock = productos.reduce((suma, producto) => {
    return suma + producto.stock;
  }, 0);

  const conteoRecintos = {};

productos.forEach(concierto => {
  conteoRecintos[concierto.categoria] =
    (conteoRecintos[concierto.categoria] || 0) + 1;
});

const recintoMasUsado = Object.keys(conteoRecintos).reduce((a, b) =>
  conteoRecintos[a] > conteoRecintos[b] ? a : b
);

resumenEstadisticas.innerHTML = `
  <div class="estadistica">
    <strong>Total de conciertos:</strong> ${totalProductos}
  </div>

  <div class="estadistica">
    <strong>Precio promedio del boleto:</strong> $${precioPromedio.toFixed(2)}
  </div>

  <div class="estadistica">
    <strong>Concierto con boleto más caro:</strong> ${productoMasCaro.nombre}
  </div>

  <div class="estadistica">
    <strong>Total de boletos disponibles:</strong> ${totalStock}
  </div>

  <div class="estadistica">
    <strong>Recinto con más conciertos:</strong> ${recintoMasUsado}
  </div>

  <div class="estadistica">
    <strong>Concierto con más boletos disponibles:</strong>${conciertoMasBoletos.nombre}
  </div>
  
  <div class="estadistica">
    <strong>Boleto más caro:</strong> $${precioMasAlto}
  </div>

  <div class="estadistica">
    <strong>Boleto más económico:</strong> $${precioMasBajo}
  </div>
`;
});

//Cancelar Edición
btnCancelarEdicion.addEventListener("click", cancelarEdicion);

function cancelarEdicion() {
  formProducto.reset();
  productoId.value = "";
  btnGuardar.textContent = "Guardar concierto";
  mensaje.textContent = "Edición de concierto cancelada.";
  mensaje.className = "mensaje-exito";
  cambiarPestana("productos");
}

// 8. Carga inicial
obtenerProductos();

// 8. Carga inicial
obtenerProductos();


// 1. Selección de elementos del DOM
const tabs = document.querySelectorAll(".tab");
const contenidos = document.querySelectorAll(".tab-content");

const listaProductos = document.getElementById("lista-productos");
const formProducto = document.getElementById("form-producto");
const mensaje = document.getElementById("mensaje");

const btnEstadisticas = document.getElementById("btn-estadisticas");
const resumenEstadisticas = document.getElementById("resumen-estadisticas");

const busqueda = document.getElementById("busqueda");
const btnBuscar = document.getElementById("btn-buscar");

const productoId = document.getElementById("producto-id");
const btnGuardar = document.getElementById("btn-guardar");
const btnCancelarEdicion = document.getElementById("btn-cancelar-edicion");

const encabezadoConciertos = document.getElementById("encabezado-conciertos");

let productos = [];

// 2. Navegación por pestañas
function cambiarPestana(idContenido) {
  tabs.forEach(tab => tab.classList.remove("active"));
  contenidos.forEach(contenido => contenido.classList.remove("active"));

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

// 3. Consultar conciertos
async function obtenerProductos() {
  try {
    const respuesta = await fetch("/productos");

    if (!respuesta.ok) {
      throw new Error("No se pudieron obtener los conciertos.");
    }

    productos = await respuesta.json();

    if (!listaProductos.classList.contains("vista-detalle")) {
      mostrarProductos(productos, listaProductos);
    }

  } catch (error) {
    listaProductos.innerHTML = `<p class="error">${error.message}</p>`;
  }
}

// 4. Mostrar tarjetas
function mostrarProductos(lista, contenedor) {
  document.getElementById("productos").classList.remove("vista-activa");
  contenedor.className = "productos-grid";
  contenedor.innerHTML = "";

  if (encabezadoConciertos) {
    encabezadoConciertos.style.display = "block";
  }

  if (lista.length === 0) {
    contenedor.innerHTML = "<p>No hay conciertos para mostrar.</p>";
    return;
  }

  lista.forEach(producto => {
    const tarjeta = document.createElement("article");
    tarjeta.classList.add("producto-card");

    tarjeta.innerHTML = `
      <h3>${producto.nombre}</h3>

      <img 
        src="${producto.imagen || 'img/concierto.jpg'}" 
        alt="${producto.nombre}" 
        class="img-concierto"
      >

      <button class="btn-info" type="button" onclick="verInformacion(${producto.id})">
        Ver información
      </button>
    `;

    contenedor.appendChild(tarjeta);
  });
}

// 5. Ver información
function verInformacion(id) {
  const producto = productos.find(p => p.id === id);

  if (!producto) {
    mensaje.textContent = "Concierto no encontrado.";
    mensaje.className = "mensaje-error";
    return;
  }


  listaProductos.className = "productos-grid vista-detalle";
  document.getElementById("productos").classList.add("vista-activa");

  if (encabezadoConciertos) {
    encabezadoConciertos.style.display = "none";
  }

  listaProductos.innerHTML = `
    <article class="detalle-concierto">
      <h2>${producto.nombre}</h2>

      <img 
        src="${producto.imagen || 'img/concierto.jpg'}" 
        alt="${producto.nombre}" 
        class="img-detalle"
      >

      <div class="detalle-tarjetas">
        <div class="detalle-card">
          <h3>Información general</h3>
          <p><strong>Fecha:</strong> ${producto.fecha || "No registrada"}</p>
          <p><strong>Recinto:</strong> ${producto.recinto || "No registrado"}</p>
          <p><strong>Ciudad:</strong> ${producto.ciudad || "No registrada"}</p>
          <p><strong>Boletos disponibles:</strong> ${producto.stock}</p>
        </div>

        <div class="detalle-card">
          <h3>Precios</h3>
          <p><strong>General:</strong> $${producto.precios?.general || producto.precio || "No registrado"}</p>
          <p><strong>Preferente:</strong> $${producto.precios?.preferente || "No registrado"}</p>
          <p><strong>VIP:</strong> $${producto.precios?.vip || "No registrado"}</p>
        </div>
      </div>

      <div class="detalle-botones">
        <button class="btn-editar" type="button" onclick="editarProducto(${producto.id})">
          Editar concierto
        </button>

        <button class="btn-stock" type="button" onclick="actualizarStock(${producto.id})">
          Actualizar boletos
        </button>

        <button class="btn-eliminar" type="button" onclick="eliminarProducto(${producto.id})">
          Eliminar concierto
        </button>
      </div>

      <button type="button" class="btn-regresar" onclick="mostrarProductos(productos, listaProductos)">
        ← Regresar
      </button>
    </article>
  `;
}

// 6. Editar concierto
function editarProducto(id) {
  const producto = productos.find(p => p.id === id);

  if (!producto) {
    mensaje.textContent = "Concierto no encontrado.";
    mensaje.className = "mensaje-error";
    return;
  }

  productoId.value = producto.id;
  document.getElementById("nombre").value = producto.nombre;
  document.getElementById("precio-general").value = producto.precios?.general || producto.precio || "";
  document.getElementById("precio-preferente").value = producto.precios?.preferente || "";
  document.getElementById("precio-vip").value = producto.precios?.vip || "";
  document.getElementById("fecha").value = producto.fecha || "";
  document.getElementById("recinto").value = producto.recinto || "";
  document.getElementById("ciudad").value = producto.ciudad || "";
  document.getElementById("imagen").value = producto.imagen || "";
  document.getElementById("stock").value = producto.stock;
  document.getElementById("productos").classList.remove("vista-activa");
listaProductos.className = "productos-grid";

  btnGuardar.textContent = "Actualizar concierto";
  mensaje.textContent = "Editando concierto. Modifica los datos y guarda los cambios.";
  mensaje.className = "mensaje-exito";

  cambiarPestana("agregar");
}

// 7. Actualizar boletos
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
    ...producto,
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

    productos = await (await fetch("/productos")).json();
    cambiarPestana("productos");

if (id) {
  setTimeout(() => {
    verInformacion(Number(id));
  }, 50);
} else {
  mostrarProductos(productos, listaProductos);
}

  } catch (error) {
    mensaje.textContent = error.message;
    mensaje.className = "mensaje-error";
  }
}

// 8. Eliminar concierto
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
    mostrarProductos(productos, listaProductos);

  } catch (error) {
    mensaje.textContent = error.message;
    mensaje.className = "mensaje-error";
  }
}

// 9. Guardar o actualizar concierto
formProducto.addEventListener("submit", async event => {
  event.preventDefault();

  const id = productoId.value;

  const producto = {
    nombre: document.getElementById("nombre").value,
    precios: {
      general: Number(document.getElementById("precio-general").value),
      preferente: Number(document.getElementById("precio-preferente").value),
      vip: Number(document.getElementById("precio-vip").value)
    },
    fecha: document.getElementById("fecha").value,
    recinto: document.getElementById("recinto").value,
    ciudad: document.getElementById("ciudad").value,
    stock: Number(document.getElementById("stock").value),
    imagen: document.getElementById("imagen").value
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

   const productosActualizados = await fetch("/productos");
   productos = await productosActualizados.json();

   cambiarPestana("productos");

if (id) {
  verInformacion(Number(id));
} else {
  mostrarProductos(productos, listaProductos);
}

  } catch (error) {
    mensaje.textContent = error.message;
    mensaje.className = "mensaje-error";
  }
});

// 10. Buscar conciertos
async function buscarProductos() {
  if (productos.length === 0) {
    await obtenerProductos();
  }

  const texto = busqueda.value.toLowerCase().trim();

  const filtrados = productos.filter(concierto => {
    const nombre = concierto.nombre.toLowerCase().trim();
    const recinto = (concierto.recinto || "").toLowerCase().trim();
    const ciudad = (concierto.ciudad || "").toLowerCase().trim();

    return nombre.includes(texto) ||
           recinto.includes(texto) ||
           ciudad.includes(texto);
  });

  mostrarProductos(filtrados, listaProductos);
  cambiarPestana("productos");
}

if (btnBuscar) {
  btnBuscar.addEventListener("click", buscarProductos);
}

if (busqueda) {
  busqueda.addEventListener("keyup", event => {
    if (event.key === "Enter") {
      buscarProductos();
    }
  });
}

// 11. Estadísticas
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
    return suma + (producto.precios?.general || producto.precio || 0);
  }, 0);

  const precioPromedio = sumaPrecios / totalProductos;

  const preciosGenerales = productos.map(concierto => {
    return concierto.precios?.general || concierto.precio || 0;
  });

  const precioMasAlto = Math.max(...preciosGenerales);
  const precioMasBajo = Math.min(...preciosGenerales);

  const productoMasCaro = productos.reduce((mayor, producto) => {
    const precioProducto = producto.precios?.general || producto.precio || 0;
    const precioMayor = mayor.precios?.general || mayor.precio || 0;

    return precioProducto > precioMayor ? producto : mayor;
  }, productos[0]);

  const conciertoMasBoletos = productos.reduce((mayor, concierto) => {
    return concierto.stock > mayor.stock ? concierto : mayor;
  }, productos[0]);

  const totalStock = productos.reduce((suma, producto) => {
    return suma + producto.stock;
  }, 0);

  const conteoRecintos = {};
  productos.forEach(concierto => {
    const recinto = concierto.recinto || "Sin recinto";
    conteoRecintos[recinto] = (conteoRecintos[recinto] || 0) + 1;
  });

  const conteoCiudades = {};
  productos.forEach(concierto => {
    const ciudad = concierto.ciudad || "Sin ciudad";
    conteoCiudades[ciudad] = (conteoCiudades[ciudad] || 0) + 1;
  });

  const ciudadMasConciertos = Object.keys(conteoCiudades).reduce((a, b) =>
    conteoCiudades[a] > conteoCiudades[b] ? a : b
  );

  const recintoMasUsado = Object.keys(conteoRecintos).reduce((a, b) =>
    conteoRecintos[a] > conteoRecintos[b] ? a : b
  );

  resumenEstadisticas.innerHTML = `
    <h3 class="dashboard-titulo">Resumen general</h3>

    <div class="estadistica dashboard-principal">
       <strong>Total de conciertos</strong>
       <div class="numero-dashboard">${totalProductos}</div>
    </div>

    <div class="estadistica">
      <strong>Precio promedio del boleto general:</strong> $${precioPromedio.toFixed(2)}
    </div>

    <div class="estadistica">
      <strong>Concierto con boleto general más caro:</strong> ${productoMasCaro.nombre}
    </div>

    <h3 class="dashboard-titulo">Detalles del sistema</h3> 

    <div class="estadistica dashboard-principal">
      <strong>Total de boletos disponibles</strong>
      <div class="numero-dashboard">${totalStock}</div>
    </div>

    <div class="estadistica">
      <strong>Recinto con más conciertos:</strong> ${recintoMasUsado}
    </div>

    <div class="estadistica dashboard-principal">
       <strong>Total de recintos registrados</strong>
       <div class="numero-dashboard">${Object.keys(conteoRecintos).length}</div>
    </div>

    <div class="estadistica">
      <strong>Concierto con más boletos disponibles:</strong> ${conciertoMasBoletos.nombre} 
    </div>

    <div class="estadistica">
      <strong>Boleto general más caro:</strong> $${precioMasAlto}
    </div>

    <div class="estadistica">
      <strong>Boleto general más económico:</strong> $${precioMasBajo}
    </div>

    <div class="estadistica">
      <strong>Ciudad con más conciertos:</strong> ${ciudadMasConciertos}
    </div>
  `;
});

// 12. Cancelar edición
btnCancelarEdicion.addEventListener("click", cancelarEdicion);

function cancelarEdicion() {
  formProducto.reset();
  productoId.value = "";
  btnGuardar.textContent = "Guardar concierto";
  mensaje.textContent = "Edición de concierto cancelada.";
  mensaje.className = "mensaje-exito";
  cambiarPestana("productos");
  mostrarProductos(productos, listaProductos);
}

// 13. Carga inicial
obtenerProductos();
// 1. Selección de elementos del DOM

const btnMenu = document.getElementById("btn-menu");
const menuTabs = document.querySelector(".tabs");

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

btnMenu.addEventListener("click", () => {
  menuTabs.classList.toggle("mostrar-menu");
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

// 4. Mostrar conciertos en la interfaz
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
  <img src="${producto.imagen || 'img/concierto.jpg'}" alt="${producto.nombre}" class="img-concierto">
  
  <button class="btn-info" type="button" onclick="verInformacion(${producto.id})">
    Ver información
  </button>
`;


    contenedor.appendChild(tarjeta);
  });
}

// ver info del artista
function verInformacion(id) {
  const producto = productos.find(p => p.id === id);

  if (!producto) {
    mensaje.textContent = "Concierto no encontrado.";
    mensaje.className = "mensaje-error";
    return;
  }

  listaProductos.classList.add("vista-detalle");

  listaProductos.innerHTML = `
    <article class="detalle-concierto">
      <h2>${producto.nombre}</h2>

      <div class="detalle-contenido">
        <div class="detalle-botones">
          <button type="button" class="btn-regresar" onclick="listaProductos.classList.remove('vista-detalle'); mostrarProductos(productos, listaProductos)">
            ← Regresar
          </button>

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

        <div class="detalle-info">
          <img src="${producto.imagen || 'img/concierto.jpg'}" alt="${producto.nombre}" class="img-detalle">

          <p><strong>Precio del boleto:</strong> $${producto.precio}</p>
          <p><strong>Fecha:</strong> ${producto.fecha || "No registrada"}</p>
          <p><strong>Recinto:</strong> ${producto.recinto || "No registrado"}</p>
          <p><strong>Ciudad:</strong> ${producto.ciudad || "No registrada"}</p>
          <p><strong>Boletos disponibles:</strong> ${producto.stock}</p>
        </div>
      </div>
    </article>
  `;
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
document.getElementById("fecha").value = producto.fecha || "";
document.getElementById("recinto").value = producto.recinto || "";
document.getElementById("ciudad").value = producto.ciudad || "";
document.getElementById("stock").value = producto.stock;
document.getElementById("imagen").value = producto.imagen || "";
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
  fecha: producto.fecha,
  recinto: producto.recinto,
  ciudad: producto.ciudad,
  stock: stockNumero,
  imagen: producto.imagen
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
// Función eliminar concierto
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
    await obtenerProductos();
    cambiarPestana("productos");

  } catch (error) {
    mensaje.textContent = error.message;
    mensaje.className = "mensaje-error";
  }
});

// 6. Buscar conciertos
btnBuscar.addEventListener("click", async () => {
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
  conteoRecintos[concierto.recinto] =
    (conteoRecintos[concierto.recinto] || 0) + 1;
});

const conteoCiudades = {};

productos.forEach(concierto => {
  const ciudad = concierto.ciudad;

  if (ciudad) {
    conteoCiudades[ciudad] =
      (conteoCiudades[ciudad] || 0) + 1;
  }
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
    <strong>Precio promedio del boleto:</strong> $${precioPromedio.toFixed(2)}
  </div>

  <div class="estadistica">
    <strong>Concierto con boleto más caro:</strong> ${productoMasCaro.nombre}
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
     <div class="numero-dashboard">
     ${Object.keys(conteoRecintos).length}
    </div>
  </div>

  <div class="estadistica">
   <strong>Concierto con más boletos disponibles:</strong> ${conciertoMasBoletos.nombre} 
  </div>
  
  <div class="estadistica">
    <strong>Boleto más caro:</strong> $${precioMasAlto}
  </div>

  <div class="estadistica">
    <strong>Boleto más económico:</strong> $${precioMasBajo}
  </div>

  <div class="estadistica">
    <strong>Ciudad con más conciertos:</strong> ${ciudadMasConciertos}
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


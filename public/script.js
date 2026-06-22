// Función de búsqueda
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
    return suma + (producto.precios?.general || producto.precio);
  }, 0);

  const precioPromedio = sumaPrecios / totalProductos;
  const precioMasAlto = Math.max(...productos.map(concierto => concierto.precios?.general || concierto.precio));
  const precioMasBajo = Math.min(...productos.map(concierto => concierto.precios?.general || concierto.precio));

  const productoMasCaro = productos.reduce((mayor, producto) => {
    const precioProducto = producto.precios?.general || producto.precio;
    const precioMayor = mayor.precios?.general || mayor.precio;
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
    conteoRecintos[concierto.recinto] = (conteoRecintos[concierto.recinto] || 0) + 1;
  });

  const conteoCiudades = {};
  productos.forEach(concierto => {
    const ciudad = concierto.ciudad;
    if (ciudad) {
      conteoCiudades[ciudad] = (conteoCiudades[ciudad] || 0) + 1;
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
       <div class="numero-dashboard">${Object.keys(conteoRecintos).length}</div>
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

// Cancelar Edición
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

// ══════════════════════════════════════════════════════════════════
//  script.js  –  TicketLive
// ══════════════════════════════════════════════════════════════════

// ── 1. Referencias al DOM ─────────────────────────────────────────
const tabs                = document.querySelectorAll(".tab");
const contenidos          = document.querySelectorAll(".tab-content");
const listaProductos      = document.getElementById("lista-productos");
const formProducto        = document.getElementById("form-producto");
const mensaje             = document.getElementById("mensaje");
const btnEstadisticas     = document.getElementById("btn-estadisticas");
const resumenEstadisticas = document.getElementById("resumen-estadisticas");
const busqueda            = document.getElementById("busqueda");
const btnBuscar           = document.getElementById("btn-buscar");
const productoId          = document.getElementById("producto-id");
const btnGuardar          = document.getElementById("btn-guardar");
const btnCancelarEdicion  = document.getElementById("btn-cancelar-edicion");
const encabezadoConciertos = document.getElementById("encabezado-conciertos");
const mensajeLogin        = document.getElementById("mensaje-login");

let productos      = [];
let usuarioActual  = null; // { usuario, esAdmin }

// ══════════════════════════════════════════════════════════════════
//  BLOQUE A – PANTALLA DE LOGIN
// ══════════════════════════════════════════════════════════════════

// ── A1. Validación de contraseña ──────────────────────────────────
function validarPassword(password) {
  const reglas = [
    { ok: password.length >= 8,          msg: "Mínimo 8 caracteres" },
    { ok: /[A-Z]/.test(password),        msg: "Al menos una mayúscula" },
    { ok: /[0-9]/.test(password),        msg: "Al menos un número" },
    { ok: /[^A-Za-z0-9]/.test(password), msg: "Al menos un símbolo especial (!@#$...)" }
  ];
  const fallidas = reglas.filter(r => !r.ok).map(r => r.msg);
  return fallidas; // array vacío = contraseña válida
}

// Muestra indicador visual de fortaleza debajo del input de contraseña
function mostrarFortaleza(password, contenedorId) {
  const contenedor = document.getElementById(contenedorId);
  if (!contenedor) return;

  const checks = [
    { ok: password.length >= 8,          label: "8+ caracteres" },
    { ok: /[A-Z]/.test(password),        label: "Mayúscula" },
    { ok: /[0-9]/.test(password),        label: "Número" },
    { ok: /[^A-Za-z0-9]/.test(password), label: "Símbolo" }
  ];

  const cumplidas = checks.filter(c => c.ok).length;
  const niveles   = ["", "débil", "regular", "buena", "fuerte"];
  const colores   = ["", "#e74c3c", "#f39c12", "#3498db", "#2ecc71"];

  contenedor.innerHTML = `
    <div style="display:flex;gap:6px;margin-top:6px;">
      ${checks.map(c => `
        <span style="
          flex:1;height:5px;border-radius:4px;
          background:${c.ok ? colores[cumplidas] : "#e0e0e0"};
          transition:background .3s;
        "></span>
      `).join("")}
    </div>
    <div style="font-size:12px;color:${colores[cumplidas]};margin-top:4px;font-weight:bold;">
      ${cumplidas > 0 ? "Contraseña " + niveles[cumplidas] : ""}
    </div>
    <div style="font-size:11px;color:#888;margin-top:2px;">
      ${checks.map(c => `<span style="color:${c.ok ? "#2ecc71" : "#ccc"}">${c.ok ? "✓" : "○"} ${c.label}</span>`).join("  ")}
    </div>
  `;
}

// ── A2. Navegación entre formularios de login ─────────────────────
function ocultarFormsLogin() {
  ["pantalla-principal", "form-login-usuario", "form-crear-cuenta", "login-admin"]
    .forEach(id => {
      const el = document.getElementById(id);
      if (el) el.classList.add("oculto");
    });
  if (mensajeLogin) mensajeLogin.textContent = "";
}

function mostrarPantallaPrincipal() {
  ocultarFormsLogin();
  document.getElementById("pantalla-principal").classList.remove("oculto");
}

function mostrarIniciarUsuario() {
  ocultarFormsLogin();
  document.getElementById("form-login-usuario").classList.remove("oculto");
  // Limpiar campos
  document.getElementById("usuario-login").value  = "";
  document.getElementById("password-login").value = "";
}

function mostrarCrearCuenta() {
  ocultarFormsLogin();
  document.getElementById("form-crear-cuenta").classList.remove("oculto");
  // Limpiar campos
  document.getElementById("nuevo-usuario").value  = "";
  document.getElementById("nueva-password").value = "";
  const ft = document.getElementById("fortaleza-password");
  if (ft) ft.innerHTML = "";
}

  // Escucha en tiempo real para el indicador de fortaleza
  const inputPass = document.getElementById("nueva-password");
  if (inputPass) {
    inputPass.addEventListener("input", () => {
      mostrarFortaleza(inputPass.value, "fortaleza-password");
    });
  }
}

function mostrarLoginAdmin() {
  ocultarFormsLogin();
  document.getElementById("login-admin").classList.remove("oculto");
  // Limpiar campos
  document.getElementById("usuario-admin").value  = "";
  document.getElementById("password-admin").value = "";
}

function mostrarMensajeLogin(texto, tipo) {
  if (!mensajeLogin) return;
  mensajeLogin.textContent = texto;
  mensajeLogin.className   = tipo === "error" ? "mensaje-error" : "mensaje-exito";
}

// ── A3. Autenticación ─────────────────────────────────────────────
function iniciarSesionUsuario() {
  const usuario  = document.getElementById("usuario-login").value.trim();
  const password = document.getElementById("password-login").value.trim();

  if (!usuario || !password) {
    mostrarMensajeLogin("Completa todos los campos.", "error");
    return;
  }

  const usuarios   = JSON.parse(localStorage.getItem("usuarios") || "[]");
  const encontrado = usuarios.find(u => u.usuario === usuario && u.password === password);

  if (!encontrado) {
    mostrarMensajeLogin("Usuario o contraseña incorrectos.", "error");
    return;
  }

  usuarioActual = { usuario, esAdmin: false };
  entrarApp(false);
}

function crearCuentaUsuario() {
  const usuario  = document.getElementById("nuevo-usuario").value.trim();
  const password = document.getElementById("nueva-password").value.trim();

  if (!usuario || !password) {
    mostrarMensajeLogin("Completa todos los campos.", "error");
    return;
  }

  // Validar reglas de contraseña
  const errores = validarPassword(password);
  if (errores.length > 0) {
    mostrarMensajeLogin("La contraseña debe tener: " + errores.join(", ") + ".", "error");
    return;
  }

  const usuarios = JSON.parse(localStorage.getItem("usuarios") || "[]");
  if (usuarios.find(u => u.usuario === usuario)) {
    mostrarMensajeLogin("Ese nombre de usuario ya existe.", "error");
    return;
  }

  usuarios.push({ usuario, password, historial: [] });
  localStorage.setItem("usuarios", JSON.stringify(usuarios));
  mostrarMensajeLogin("✅ Cuenta creada. Ahora inicia sesión.", "exito");

  document.getElementById("nuevo-usuario").value  = "";
  document.getElementById("nueva-password").value = "";
  const ft = document.getElementById("fortaleza-password");
  if (ft) ft.innerHTML = "";

  setTimeout(mostrarIniciarUsuario, 1400);
}

function iniciarSesionAdmin() {
  const usuario  = document.getElementById("usuario-admin").value.trim();
  const password = document.getElementById("password-admin").value.trim();

  const ADMIN_USER = "admin";
  const ADMIN_PASS = "Admin123!";   // cumple las mismas reglas

  if (usuario === ADMIN_USER && password === ADMIN_PASS) {
    usuarioActual = { usuario, esAdmin: true };
    entrarApp(true);
  } else {
    mostrarMensajeLogin("Credenciales de administrador incorrectas.", "error");
  }
}

// ── A4. Entrada y salida ──────────────────────────────────────────
function entrarApp(esAdmin = false) {
  document.getElementById("pantalla-login").style.display = "none";
  document.getElementById("app").style.display = "block";

  if (esAdmin) {
    document.body.classList.add("admin-activo");
  } else {
    document.body.classList.remove("admin-activo");
  }

  cambiarPestana("inicio");
  obtenerProductos();
}

function cerrarSesion() {
  usuarioActual = null;
  document.getElementById("app").style.display = "none";
  document.getElementById("pantalla-login").style.display = "flex";
  document.body.classList.remove("admin-activo");
  mostrarPantallaPrincipal();
}

// ══════════════════════════════════════════════════════════════════
//  BLOQUE B – NAVEGACIÓN POR PESTAÑAS
// ══════════════════════════════════════════════════════════════════

function cambiarPestana(idContenido) {
  tabs.forEach(t => t.classList.remove("active"));
  contenidos.forEach(c => c.classList.remove("active"));

  const tabSel      = document.querySelector(`[data-tab="${idContenido}"]`);
  const contenidoSel = document.getElementById(idContenido);

  if (tabSel)       tabSel.classList.add("active");
  if (contenidoSel) contenidoSel.classList.add("active");
}

tabs.forEach(tab => {
  tab.addEventListener("click", () => {
    if (tab.dataset.tab) cambiarPestana(tab.dataset.tab);
  });
});

// ══════════════════════════════════════════════════════════════════
//  BLOQUE C – CONCIERTOS (CRUD)
// ══════════════════════════════════════════════════════════════════

async function obtenerProductos() {
  try {
    const respuesta = await fetch("/productos");
    if (!respuesta.ok) throw new Error("No se pudieron obtener los conciertos.");
    productos = await respuesta.json();
    if (!listaProductos.classList.contains("vista-detalle")) {
      mostrarProductos(productos, listaProductos);
    }
  } catch (error) {
    listaProductos.innerHTML = `<p class="error">${error.message}</p>`;
  }
}

function mostrarProductos(lista, contenedor) {
  document.getElementById("productos").classList.remove("vista-activa");
  contenedor.className  = "productos-grid";
  contenedor.innerHTML  = "";
  if (encabezadoConciertos) encabezadoConciertos.style.display = "block";

  if (lista.length === 0) {
    contenedor.innerHTML = "<p>No hay conciertos para mostrar.</p>";
    return;
  }

  lista.forEach(producto => {
    const tarjeta = document.createElement("article");
    tarjeta.classList.add("producto-card");
    tarjeta.innerHTML = `
      <h3>${producto.nombre}</h3>
      <img src="${producto.imagen || "img/concierto.jpg"}" alt="${producto.nombre}" class="img-concierto">
      <button class="btn-info" type="button" onclick="verInformacion(${producto.id})">
        Ver información
      </button>
    `;
    contenedor.appendChild(tarjeta);
  });
}

function verInformacion(id) {
  const producto = productos.find(p => p.id === id);
  if (!producto) return;

  listaProductos.className = "productos-grid vista-detalle";
  document.getElementById("productos").classList.add("vista-activa");
  if (encabezadoConciertos) encabezadoConciertos.style.display = "none";

  listaProductos.innerHTML = `
    <article class="detalle-concierto">
      <h2>${producto.nombre}</h2>
      <img src="${producto.imagen || "img/concierto.jpg"}" alt="${producto.nombre}" class="img-detalle">

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
          <p><strong>General:</strong> $${producto.precios?.general ?? producto.precio ?? "N/D"}</p>
          <p><strong>Preferente:</strong> $${producto.precios?.preferente ?? "N/D"}</p>
          <p><strong>VIP:</strong> $${producto.precios?.vip ?? "N/D"}</p>
        </div>
      </div>

    <!-- BOTÓN COMPRAR (solo usuarios, no admin) -->
     ${!usuarioActual?.esAdmin ? `
     <button class="btn-comprar" type="button" onclick="abrirModalCompra(${producto.id})">
      🎟️ Comprar boletos
    </button>
  ` : ""}

      <!-- CONTROLES ADMIN -->
      <button class="btn-editar solo-admin"   type="button" onclick="editarProducto(${producto.id})">Editar concierto</button>
      <button class="btn-stock solo-admin"    type="button" onclick="actualizarStock(${producto.id})">Actualizar boletos</button>
      <button class="btn-eliminar solo-admin" type="button" onclick="eliminarProducto(${producto.id})">Eliminar concierto</button>

      <button type="button" class="btn-regresar" onclick="mostrarProductos(productos, listaProductos)">← Regresar</button>
    </article>
  `;
}

function editarProducto(id) {
  const producto = productos.find(p => p.id === id);
  if (!producto) return;

  productoId.value = producto.id;
  document.getElementById("nombre").value            = producto.nombre;
  document.getElementById("precio-general").value    = producto.precios?.general    ?? producto.precio ?? "";
  document.getElementById("precio-preferente").value = producto.precios?.preferente ?? "";
  document.getElementById("precio-vip").value        = producto.precios?.vip        ?? "";
  document.getElementById("fecha").value             = producto.fecha    || "";
  document.getElementById("recinto").value           = producto.recinto  || "";
  document.getElementById("ciudad").value            = producto.ciudad   || "";
  document.getElementById("imagen").value            = producto.imagen   || "";
  document.getElementById("stock").value             = producto.stock;

  document.getElementById("productos").classList.remove("vista-activa");
  listaProductos.className = "productos-grid";
  btnGuardar.textContent   = "Actualizar concierto";
  mensaje.textContent      = "Editando concierto. Modifica los datos y guarda los cambios.";
  mensaje.className        = "mensaje-exito";
  cambiarPestana("agregar");
}

async function actualizarStock(id) {
  const producto = productos.find(p => p.id === id);
  if (!producto) return;

  const nuevoStock = prompt("Ingresa la nueva cantidad de boletos:", producto.stock);
  if (nuevoStock === null) return;

  const stockNumero = Number(nuevoStock);
  if (isNaN(stockNumero) || stockNumero < 0) {
    mensaje.textContent = "Cantidad inválida.";
    mensaje.className   = "mensaje-error";
    return;
  }

  try {
    const respuesta = await fetch(`/productos/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...producto, stock: stockNumero })
    });
    if (!respuesta.ok) throw new Error("No se pudo actualizar.");

    mensaje.textContent = "Boletos actualizados.";
    mensaje.className   = "mensaje-exito";
    productos = await (await fetch("/productos")).json();
    cambiarPestana("productos");
    setTimeout(() => verInformacion(Number(id)), 50);
  } catch (error) {
    mensaje.textContent = error.message;
    mensaje.className   = "mensaje-error";
  }
}

async function eliminarProducto(id) {
  if (!confirm("¿Seguro que quieres eliminar este concierto?")) return;

  try {
    const respuesta = await fetch(`/productos/${id}`, { method: "DELETE" });
    if (!respuesta.ok) throw new Error("No se pudo eliminar.");

    mensaje.textContent = "Concierto eliminado.";
    mensaje.className   = "mensaje-exito";
    await obtenerProductos();
    mostrarProductos(productos, listaProductos);
  } catch (error) {
    mensaje.textContent = error.message;
    mensaje.className   = "mensaje-error";
  }
}

formProducto.addEventListener("submit", async event => {
  event.preventDefault();
  const id = productoId.value;

  const producto = {
    nombre:  document.getElementById("nombre").value,
    precios: {
      general:    Number(document.getElementById("precio-general").value),
      preferente: Number(document.getElementById("precio-preferente").value),
      vip:        Number(document.getElementById("precio-vip").value)
    },
    fecha:   document.getElementById("fecha").value,
    recinto: document.getElementById("recinto").value,
    ciudad:  document.getElementById("ciudad").value,
    stock:   Number(document.getElementById("stock").value),
    imagen:  document.getElementById("imagen").value
  };

  const url    = id ? `/productos/${id}` : "/productos";
  const metodo = id ? "PUT" : "POST";

  try {
    const respuesta = await fetch(url, {
      method: metodo,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(producto)
    });
    if (!respuesta.ok) {
      const error = await respuesta.json();
      throw new Error(error.mensaje || "No se pudo guardar.");
    }

    mensaje.textContent = id ? "Concierto actualizado." : "Concierto registrado.";
    mensaje.className   = "mensaje-exito";

    const idEditado = id ? Number(id) : null;
    formProducto.reset();
    productoId.value       = "";
    btnGuardar.textContent = "Guardar concierto";

    productos = await (await fetch("/productos")).json();
    cambiarPestana("productos");
    idEditado ? verInformacion(idEditado) : mostrarProductos(productos, listaProductos);

  } catch (error) {
    mensaje.textContent = error.message;
    mensaje.className   = "mensaje-error";
  }
});

btnCancelarEdicion.addEventListener("click", () => {
  formProducto.reset();
  productoId.value       = "";
  btnGuardar.textContent = "Guardar concierto";
  mensaje.textContent    = "Edición cancelada.";
  mensaje.className      = "mensaje-exito";
  cambiarPestana("productos");
  mostrarProductos(productos, listaProductos);
});

// ══════════════════════════════════════════════════════════════════
//  BLOQUE D – BÚSQUEDA
// ══════════════════════════════════════════════════════════════════

async function buscarProductos() {
  if (productos.length === 0) await obtenerProductos();
  const texto    = busqueda.value.toLowerCase().trim();
  const filtrados = productos.filter(c =>
    c.nombre.toLowerCase().includes(texto) ||
    (c.recinto || "").toLowerCase().includes(texto) ||
    (c.ciudad  || "").toLowerCase().includes(texto)
  );
  mostrarProductos(filtrados, listaProductos);
  cambiarPestana("productos");
}

if (btnBuscar) btnBuscar.addEventListener("click", buscarProductos);
if (busqueda)  busqueda.addEventListener("keyup", e => { if (e.key === "Enter") buscarProductos(); });

// ══════════════════════════════════════════════════════════════════
//  BLOQUE E – COMPRA DE BOLETOS
// ══════════════════════════════════════════════════════════════════

function abrirModalCompra(id) {
  const producto = productos.find(p => p.id === id);
  if (!producto) return;

  // Eliminar modal previo si existe
  const previo = document.getElementById("modal-compra");
  if (previo) previo.remove();

  const precios = {
    general:    producto.precios?.general    ?? producto.precio ?? 0,
    preferente: producto.precios?.preferente ?? 0,
    vip:        producto.precios?.vip        ?? 0
  };

  const modal = document.createElement("div");
  modal.id        = "modal-compra";
  modal.className = "modal-overlay";
  modal.innerHTML = `
    <div class="modal-card">
      <button class="modal-cerrar" onclick="cerrarModal()">✕</button>
      <h2>🎟️ Comprar boletos</h2>
      <h3>${producto.nombre}</h3>
      <p style="color:#8a2a50;font-size:.9rem">${producto.fecha || ""} · ${producto.recinto || ""} · ${producto.ciudad || ""}</p>

      <div class="compra-form">
        <label>Sección</label>
        <select id="compra-seccion" onchange="actualizarResumen(${id})">
          <option value="general"    data-precio="${precios.general}">General – $${precios.general}</option>
          <option value="preferente" data-precio="${precios.preferente}">Preferente – $${precios.preferente}</option>
          <option value="vip"        data-precio="${precios.vip}">VIP – $${precios.vip}</option>
        </select>

        <label>Cantidad de boletos</label>
        <div class="cantidad-control">
          <button type="button" onclick="cambiarCantidad(-1, ${id})">−</button>
          <span id="compra-cantidad">1</span>
          <button type="button" onclick="cambiarCantidad(1, ${id})">+</button>
        </div>

        <div class="compra-resumen" id="compra-resumen">
          <span>Total:</span>
          <strong id="compra-total">$${precios.general}</strong>
        </div>

        <button class="btn-confirmar-compra" type="button" onclick="confirmarCompra(${id})">
          Confirmar compra
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
  // Cerrar al hacer click fuera
  modal.addEventListener("click", e => { if (e.target === modal) cerrarModal(); });
}

function cerrarModal() {
  const modal = document.getElementById("modal-compra");
  if (modal) modal.remove();
}

let cantidadCompra = 1;

function cambiarCantidad(delta, id) {
  const producto = productos.find(p => p.id === id);
  cantidadCompra = Math.max(1, Math.min(cantidadCompra + delta, producto?.stock ?? 99));
  document.getElementById("compra-cantidad").textContent = cantidadCompra;
  actualizarResumen(id);
}

function actualizarResumen(id) {
  const select   = document.getElementById("compra-seccion");
  const precio   = Number(select.options[select.selectedIndex].dataset.precio);
  const total    = precio * cantidadCompra;
  document.getElementById("compra-total").textContent = `$${total.toLocaleString("es-MX")}`;
}

async function confirmarCompra(id) {
  const producto = productos.find(p => p.id === id);
  if (!producto) return;

  const select   = document.getElementById("compra-seccion");
  const seccion  = select.value;
  const precio   = Number(select.options[select.selectedIndex].dataset.precio);
  const cantidad = cantidadCompra;
  const total    = precio * cantidad;

  if (cantidad > producto.stock) {
    alert("No hay suficientes boletos disponibles.");
    return;
  }

  // Guardar en historial del usuario (localStorage)
  const compra = {
    id:        Date.now(),
    concierto: producto.nombre,
    fecha:     producto.fecha     || "No registrada",
    recinto:   producto.recinto   || "",
    ciudad:    producto.ciudad    || "",
    imagen:    producto.imagen    || "",
    seccion,
    cantidad,
    precio,
    total,
    fechaCompra: new Date().toLocaleDateString("es-MX", { dateStyle: "long" })
  };

  if (usuarioActual) {
    const usuarios  = JSON.parse(localStorage.getItem("usuarios") || "[]");
    const idx       = usuarios.findIndex(u => u.usuario === usuarioActual.usuario);
    if (idx !== -1) {
      if (!usuarios[idx].historial) usuarios[idx].historial = [];
      usuarios[idx].historial.push(compra);
      localStorage.setItem("usuarios", JSON.stringify(usuarios));
    }
  }

  // Descontar stock en el servidor
  try {
    await fetch(`/productos/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...producto, stock: producto.stock - cantidad })
    });
    productos = await (await fetch("/productos")).json();
  } catch (_) { /* continuar aunque falle el servidor en demo */ }

  cerrarModal();
  cantidadCompra = 1;
  mostrarConfirmacionCompra(compra);
}

function mostrarConfirmacionCompra(compra) {
  // Genera el archivo .ics para agregar al calendario
  const icsBlob = generarICS(compra);
  const icsURL  = URL.createObjectURL(icsBlob);

  // Genera el pase de wallet (imagen SVG descargable)
  const walletSVG = generarWalletSVG(compra);
  const walletURL = URL.createObjectURL(new Blob([walletSVG], { type: "image/svg+xml" }));

  const previo = document.getElementById("modal-confirmacion");
  if (previo) previo.remove();

  const modal = document.createElement("div");
  modal.id        = "modal-confirmacion";
  modal.className = "modal-overlay";
  modal.innerHTML = `
    <div class="modal-card confirmacion-card">
      <div class="confirmacion-icono">🎉</div>
      <h2>¡Compra exitosa!</h2>
      <p class="confirmacion-detalle">
        <strong>${compra.cantidad} boleto${compra.cantidad > 1 ? "s" : ""}</strong> –
        ${compra.concierto}<br>
        <span>${compra.seccion.charAt(0).toUpperCase() + compra.seccion.slice(1)} · $${compra.total.toLocaleString("es-MX")}</span><br>
        <span style="font-size:.85rem;color:#8a2a50">${compra.fecha} · ${compra.recinto}</span>
      </p>

      <div class="confirmacion-acciones">
        <a href="${icsURL}" download="${compra.concierto.replace(/\s+/g,"_")}.ics" class="btn-accion">
          📅 Agregar al calendario
        </a>
        <a href="${walletURL}" download="boleto_${compra.concierto.replace(/\s+/g,"_")}.svg" class="btn-accion">
          🪪 Descargar a Wallet
        </a>
        <button class="btn-accion btn-historial" type="button" onclick="cerrarConfirmacion(); cambiarPestana('historial')">
          📋 Ver mis compras
        </button>
        <button class="btn-accion btn-secundario-modal" type="button" onclick="cerrarConfirmacion()">
          Cerrar
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
  modal.addEventListener("click", e => { if (e.target === modal) cerrarConfirmacion(); });

  // Refrescar vista del concierto
  verInformacion(Number(compra.id));
}

function cerrarConfirmacion() {
  const m = document.getElementById("modal-confirmacion");
  if (m) m.remove();
}

// ── Generar archivo .ics (calendario) ────────────────────────────
function generarICS(compra) {
  // Fecha en formato YYYYMMDD
  const fechaRaw  = compra.fecha ? compra.fecha.replace(/-/g, "") : "20260101";
  const uid       = `ticketlive-${Date.now()}@ticketlive.mx`;
  const contenido = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//TicketLive//ES",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `SUMMARY:🎵 ${compra.concierto}`,
    `DTSTART;VALUE=DATE:${fechaRaw}`,
    `DTEND;VALUE=DATE:${fechaRaw}`,
    `LOCATION:${compra.recinto}, ${compra.ciudad}`,
    `DESCRIPTION:${compra.cantidad} boleto(s) – Sección ${compra.seccion} – $${compra.total}`,
    "END:VEVENT",
    "END:VCALENDAR"
  ].join("\r\n");

  return new Blob([contenido], { type: "text/calendar;charset=utf-8" });
}

// ── Generar pase SVG tipo Wallet ──────────────────────────────────
function generarWalletSVG(compra) {
  return `
<svg xmlns="http://www.w3.org/2000/svg" width="400" height="200" viewBox="0 0 400 200">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%"   style="stop-color:#b03060"/>
      <stop offset="100%" style="stop-color:#d94f8a"/>
    </linearGradient>
  </defs>
  <rect width="400" height="200" rx="20" fill="url(#grad)"/>
  <!-- franja decorativa -->
  <rect x="280" y="0" width="120" height="200" rx="0" fill="rgba(255,255,255,.08)"/>
  <!-- perforación -->
  <circle cx="280" cy="0"   r="20" fill="#b03060"/>
  <circle cx="280" cy="200" r="20" fill="#b03060"/>
  <line x1="280" y1="0" x2="280" y2="200" stroke="rgba(255,255,255,.25)" stroke-width="2" stroke-dasharray="6,4"/>

  <!-- textos -->
  <text x="24" y="44" font-family="Arial,sans-serif" font-size="22" font-weight="bold" fill="white">TicketLive</text>
  <text x="24" y="76" font-family="Arial,sans-serif" font-size="16" fill="rgba(255,255,255,.9)">${compra.concierto}</text>
  <text x="24" y="104" font-family="Arial,sans-serif" font-size="13" fill="rgba(255,255,255,.75)">${compra.fecha}  ·  ${compra.recinto}</text>
  <text x="24" y="128" font-family="Arial,sans-serif" font-size="13" fill="rgba(255,255,255,.75)">${compra.ciudad}</text>

  <text x="24" y="162" font-family="Arial,sans-serif" font-size="12" fill="rgba(255,255,255,.6)">SECCIÓN</text>
  <text x="24" y="180" font-family="Arial,sans-serif" font-size="16" font-weight="bold" fill="white">${compra.seccion.toUpperCase()}</text>

  <text x="120" y="162" font-family="Arial,sans-serif" font-size="12" fill="rgba(255,255,255,.6)">BOLETOS</text>
  <text x="120" y="180" font-family="Arial,sans-serif" font-size="16" font-weight="bold" fill="white">${compra.cantidad}</text>

  <text x="220" y="162" font-family="Arial,sans-serif" font-size="12" fill="rgba(255,255,255,.6)">TOTAL</text>
  <text x="220" y="180" font-family="Arial,sans-serif" font-size="16" font-weight="bold" fill="white">$${compra.total.toLocaleString("es-MX")}</text>

  <!-- lateral -->
  <text x="390" y="100" font-family="Arial,sans-serif" font-size="11" fill="rgba(255,255,255,.5)"
        transform="rotate(-90,390,100)" text-anchor="middle">🎟️ BOLETO OFICIAL</text>
</svg>`.trim();
}

// ══════════════════════════════════════════════════════════════════
//  BLOQUE F – HISTORIAL DE COMPRAS
// ══════════════════════════════════════════════════════════════════

function mostrarHistorial() {
  cambiarPestana("historial");

  const contenedor = document.getElementById("lista-historial");
  if (!contenedor) return;

  if (!usuarioActual) {
    contenedor.innerHTML = "<p>Inicia sesión para ver tu historial.</p>";
    return;
  }

  const usuarios = JSON.parse(localStorage.getItem("usuarios") || "[]");
  const usuario  = usuarios.find(u => u.usuario === usuarioActual.usuario);
  const historial = usuario?.historial || [];

  if (historial.length === 0) {
    contenedor.innerHTML = "<p>Aún no has realizado ninguna compra.</p>";
    return;
  }

  contenedor.innerHTML = historial.slice().reverse().map(compra => `
    <div class="historial-card">
      <div class="historial-imagen">
        <img src="${compra.imagen || "img/concierto.jpg"}" alt="${compra.concierto}">
      </div>
      <div class="historial-info">
        <h3>${compra.concierto}</h3>
        <p>📅 ${compra.fecha} · ${compra.recinto}, ${compra.ciudad}</p>
        <p>🎟️ <strong>${compra.cantidad} boleto${compra.cantidad > 1 ? "s" : ""}</strong> – Sección <strong>${compra.seccion}</strong></p>
        <p>💰 Total: <strong>$${compra.total.toLocaleString("es-MX")}</strong></p>
        <p style="font-size:.8rem;color:#aaa">Comprado el ${compra.fechaCompra}</p>
      </div>
      <div class="historial-acciones">
        <button type="button" onclick="cancelarCompra(${compra.id})" class="btn-cancelar-compra">
          🗑 Cancelar
        </button>
      </div>
    </div>
  `).join("");
}

function cancelarCompra(compraId) {
  if (!confirm("¿Cancelar esta compra? Los boletos se regresarán al inventario.")) return;

  const usuarios = JSON.parse(localStorage.getItem("usuarios") || "[]");
  const idx      = usuarios.findIndex(u => u.usuario === usuarioActual?.usuario);
  if (idx === -1) return;

  const compra = usuarios[idx].historial?.find(c => c.id === compraId);
  if (!compra) return;

  // Quitar del historial
  usuarios[idx].historial = usuarios[idx].historial.filter(c => c.id !== compraId);
  localStorage.setItem("usuarios", JSON.stringify(usuarios));

  // Devolver stock al servidor (best-effort)
  const producto = productos.find(p => p.nombre === compra.concierto);
  if (producto) {
    fetch(`/productos/${producto.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...producto, stock: producto.stock + compra.cantidad })
    }).then(() => obtenerProductos()).catch(() => {});
  }

  mostrarHistorial(); // refrescar vista
}

// ══════════════════════════════════════════════════════════════════
//  BLOQUE G – ESTADÍSTICAS
// ══════════════════════════════════════════════════════════════════

btnEstadisticas.addEventListener("click", async () => {
  if (productos.length === 0) await obtenerProductos();
  if (productos.length === 0) {
    resumenEstadisticas.innerHTML = "<p>No hay conciertos registrados.</p>";
    return;
  }

  const totalProductos   = productos.length;
  const preciosGenerales = productos.map(c => c.precios?.general ?? c.precio ?? 0);
  const sumaPrecios      = preciosGenerales.reduce((a, b) => a + b, 0);
  const precioPromedio   = sumaPrecios / totalProductos;
  const precioMasAlto    = Math.max(...preciosGenerales);
  const precioMasBajo    = Math.min(...preciosGenerales);
  const productoMasCaro  = productos.reduce((mayor, p) => {
    return (p.precios?.general ?? p.precio ?? 0) > (mayor.precios?.general ?? mayor.precio ?? 0) ? p : mayor;
  }, productos[0]);
  const conciertoMasBoletos = productos.reduce((m, c) => c.stock > m.stock ? c : m, productos[0]);
  const totalStock           = productos.reduce((s, p) => s + p.stock, 0);

  const conteoRecintos  = {};
  const conteoCiudades  = {};
  productos.forEach(c => {
    const r = c.recinto || "Sin recinto";
    const ci = c.ciudad || "Sin ciudad";
    conteoRecintos[r]  = (conteoRecintos[r]  || 0) + 1;
    conteoCiudades[ci] = (conteoCiudades[ci] || 0) + 1;
  });

  const recintoMasUsado     = Object.keys(conteoRecintos).reduce((a, b) => conteoRecintos[a]  > conteoRecintos[b]  ? a : b);
  const ciudadMasConciertos = Object.keys(conteoCiudades).reduce((a, b) => conteoCiudades[a] > conteoCiudades[b] ? a : b);

  resumenEstadisticas.innerHTML = `
    <h3 class="dashboard-titulo">Resumen general</h3>
    <div class="estadistica dashboard-principal">
      <strong>Total de conciertos</strong>
      <div class="numero-dashboard">${totalProductos}</div>
    </div>
    <div class="estadistica">
      <strong>Precio promedio boleto general:</strong> $${precioPromedio.toFixed(2)}
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
      <strong>Concierto con más boletos:</strong> ${conciertoMasBoletos.nombre}
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

// ══════════════════════════════════════════════════════════════════
//  BLOQUE H – ARRANQUE
// ══════════════════════════════════════════════════════════════════
mostrarPantallaPrincipal();
const express = require("express");

const app = express();

const productosRoutes = require("./routes/productos.routes");

const PORT = 3000;

app.use(express.json());
app.use(express.static("public"));

app.use("/productos", productosRoutes);

app.get("/", (req, res) => {

    res.send("API funcionando");
});

app.listen(PORT, () => {

    console.log(`Servidor activo en http://localhost:${PORT}`);
});

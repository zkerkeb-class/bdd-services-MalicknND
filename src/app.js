require("dotenv").config();
const express = require("express");
const cors = require("cors");
const imageRoutes = require("./routes/imageRoutes-prisma");
const productRoutes = require("./routes/productRoutes-prisma");

const app = express();
const port = process.env.PORT || 9002;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/images", imageRoutes);
app.use("/api/products", productRoutes);

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Service BDD avec Prisma opérationnel",
    timestamp: new Date().toISOString(),
  });
});
// Route de santé
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Service BDD avec Prisma opérationnel",
    timestamp: new Date().toISOString(),
  });
});

// Démarrage du serveur
app.listen(port, () => {
  console.log(`Service BDD avec Prisma démarré sur le port ${port}`);
});

module.exports = app;

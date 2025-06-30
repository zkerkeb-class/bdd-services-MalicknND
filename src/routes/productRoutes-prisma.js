const express = require("express");
const productController = require("../controllers/productController-prisma");

const router = express.Router();

/**
 * @route POST /api/products
 * @desc Créer un nouveau produit
 */
router.post("/", productController.createProduct);

/**
 * @route GET /api/products
 * @desc Récupérer les produits d'un utilisateur
 */
router.get("/", productController.getUserProducts);

/**
 * @route GET /api/products/:id
 * @desc Récupérer le détail d'un produit
 */
router.get("/:id", productController.getProductById);

/**
 * @route PUT /api/products/:id
 * @desc Mettre à jour un produit
 */
router.put("/:id", productController.updateProduct);

/**
 * @route DELETE /api/products/:id
 * @desc Supprimer un produit
 */
router.delete("/:id", productController.deleteProduct);

module.exports = router;

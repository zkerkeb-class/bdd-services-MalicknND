const express = require("express");
const imageController = require("../controllers/imageController-prisma");

const router = express.Router();

/**
 * @route POST /api/images
 * @desc Créer une nouvelle image
 */
router.post("/", imageController.createImage);

/**
 * @route GET /api/images
 * @desc Récupérer les images d'un utilisateur
 */
router.get("/", imageController.getUserImages);

/**
 * @route GET /api/images/:id
 * @desc Récupérer le détail d'une image
 */
router.get("/:id", imageController.getImageById);

/**
 * @route DELETE /api/images/:id
 * @desc Supprimer une image
 */
router.delete("/:id", imageController.deleteImage);

module.exports = router;

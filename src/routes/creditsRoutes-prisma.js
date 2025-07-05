const express = require("express");
const router = express.Router();
const {
  getUserCredits,
  useCredits,
  addCredits,
  resetCredits,
} = require("../controllers/creditsController-prisma");

// Obtenir les crédits d'un utilisateur
router.get("/:userId", getUserCredits);

// Utiliser des crédits
router.post("/use", useCredits);

// Ajouter des crédits (pour les webhooks Stripe)
router.post("/add", addCredits);

// Réinitialiser les crédits (pour les tests)
router.post("/reset/:userId", resetCredits);

module.exports = router;

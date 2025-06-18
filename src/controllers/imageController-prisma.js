const prisma = require("../lib/prisma");

/**
 * Convertit un ID Clerk en UUID valide
 */
function clerkIdToUUID(clerkId) {
  // Supprime le préfixe "user_" et génère un UUID basé sur le hash
  const hash = require("crypto")
    .createHash("md5")
    .update(clerkId)
    .digest("hex");
  return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-${hash.slice(
    12,
    16
  )}-${hash.slice(16, 20)}-${hash.slice(20, 32)}`;
}

/**
 * Contrôleur pour la gestion des images avec Prisma
 */
const imageController = {
  /**
   * Créer une nouvelle image
   */
  createImage: async (req, res) => {
    try {
      console.log("📥 Données reçues:", req.body);
      const { userId, prompt, imageUrl, metadata } = req.body;

      if (!userId || !prompt || !imageUrl) {
        console.log("❌ Validation échouée - champs manquants");
        return res.status(400).json({
          success: false,
          error: "userId, prompt et imageUrl sont requis",
        });
      }

      // Convertir l'ID Clerk en UUID
      const uuidUserId = clerkIdToUUID(userId);
      console.log(`🔄 Conversion ID: ${userId} → ${uuidUserId}`);

      console.log("✅ Validation OK, création en cours...");
      const image = await prisma.image.create({
        data: {
          userId: uuidUserId,
          prompt,
          imageUrl,
        },
      });

      console.log(`✅ Image créée avec succès: ${image.id}`);

      res.status(201).json({
        success: true,
        data: image,
      });
    } catch (error) {
      console.error(`❌ Erreur création image: ${error.message}`);
      console.error("Stack trace:", error.stack);
      res.status(500).json({
        success: false,
        error: "Erreur interne du serveur",
        details: error.message,
      });
    }
  },

  /**
   * Récupérer les images d'un utilisateur
   */
  getUserImages: async (req, res) => {
    try {
      const { userId } = req.query;
      const { page = 1, limit = 10 } = req.query;
      const skip = (page - 1) * limit;

      if (!userId) {
        return res.status(400).json({
          success: false,
          error: "userId est requis",
        });
      }

      // Convertir l'ID Clerk en UUID
      const uuidUserId = clerkIdToUUID(userId);

      const [images, total] = await Promise.all([
        prisma.image.findMany({
          where: {
            userId: uuidUserId,
          },
          orderBy: {
            createdAt: "desc",
          },
          skip: parseInt(skip),
          take: parseInt(limit),
        }),
        prisma.image.count({
          where: {
            userId: uuidUserId,
          },
        }),
      ]);

      console.log(
        `Images récupérées pour l'utilisateur ${userId}: ${images.length}`
      );

      res.json({
        success: true,
        data: {
          images,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit),
          },
        },
      });
    } catch (error) {
      console.error(`Erreur récupération images: ${error.message}`);
      res.status(500).json({
        success: false,
        error: "Erreur interne du serveur",
      });
    }
  },

  /**
   * Récupérer le détail d'une image
   */
  getImageById: async (req, res) => {
    try {
      const { id } = req.params;
      const { userId } = req.query;

      const whereClause = { id };
      if (userId) {
        const uuidUserId = clerkIdToUUID(userId);
        whereClause.userId = uuidUserId;
      }

      const image = await prisma.image.findFirst({
        where: whereClause,
      });

      if (!image) {
        return res.status(404).json({
          success: false,
          error: "Image non trouvée",
        });
      }

      console.log(`Image récupérée: ${image.id}`);

      res.json({
        success: true,
        data: image,
      });
    } catch (error) {
      console.error(`Erreur récupération image: ${error.message}`);
      res.status(500).json({
        success: false,
        error: "Erreur interne du serveur",
      });
    }
  },

  /**
   * Supprimer une image
   */
  deleteImage: async (req, res) => {
    try {
      const { id } = req.params;
      const { userId } = req.query;

      const whereClause = { id };
      if (userId) {
        const uuidUserId = clerkIdToUUID(userId);
        whereClause.userId = uuidUserId;
      }

      const image = await prisma.image.deleteMany({
        where: whereClause,
      });

      if (image.count === 0) {
        return res.status(404).json({
          success: false,
          error: "Image non trouvée",
        });
      }

      console.log(`Image supprimée: ${id}`);

      res.json({
        success: true,
        message: "Image supprimée avec succès",
      });
    } catch (error) {
      console.error(`Erreur suppression image: ${error.message}`);
      res.status(500).json({
        success: false,
        error: "Erreur interne du serveur",
      });
    }
  },
};

module.exports = imageController;

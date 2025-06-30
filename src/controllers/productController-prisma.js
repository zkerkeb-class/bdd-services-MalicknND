const prisma = require("../lib/prisma");

/**
 * Convertit un ID Clerk en UUID valide
 */
function clerkIdToUUID(clerkId) {
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
 * Contrôleur pour la gestion des produits Printify avec Prisma
 */
const productController = {
  /**
   * Créer un nouveau produit
   */
  createProduct: async (req, res) => {
    try {
      console.log("📥 Données produit reçues:", req.body);
      const {
        userId,
        printifyId,
        title,
        description,
        blueprintId,
        printProviderId,
        marginApplied,
        originalImageUrl,
        printifyImageId,
        variants,
        images,
      } = req.body;

      if (
        !userId ||
        !printifyId ||
        !title ||
        !blueprintId ||
        !printProviderId
      ) {
        console.log("❌ Validation échouée - champs manquants");
        return res.status(400).json({
          success: false,
          error:
            "userId, printifyId, title, blueprintId et printProviderId sont requis",
        });
      }

      // Convertir l'ID Clerk en UUID
      const uuidUserId = clerkIdToUUID(userId);
      console.log(`🔄 Conversion ID: ${userId} → ${uuidUserId}`);

      console.log("✅ Validation OK, création du produit en cours...");

      // Créer le produit avec ses relations
      const product = await prisma.product.create({
        data: {
          userId: uuidUserId,
          printifyId,
          title,
          description,
          blueprintId,
          printProviderId,
          marginApplied: marginApplied || 0,
          originalImageUrl: originalImageUrl || "",
          printifyImageId: printifyImageId || "",
          variants: {
            create:
              variants?.map((variant) => ({
                printifyVariantId: variant.id,
                title: variant.title,
                sku: variant.sku,
                price: variant.price,
                priceFormatted: variant.priceFormatted,
                cost: variant.cost,
                profit: variant.profit,
                isEnabled: variant.isEnabled,
                isDefault: variant.isDefault,
                options: variant.options,
              })) || [],
          },
          images: {
            create:
              images?.map((image) => ({
                src: image.src,
                position: image.position,
                isDefault: image.is_default,
                isSelectedForPublishing: image.is_selected_for_publishing,
                order: image.order,
                variantIds: {
                  create:
                    image.variant_ids?.map((variantId) => ({
                      variantId,
                    })) || [],
                },
              })) || [],
          },
        },
        include: {
          variants: true,
          images: {
            include: {
              variantIds: true,
            },
          },
        },
      });

      console.log(`✅ Produit créé avec succès: ${product.id}`);

      res.status(201).json({
        success: true,
        data: product,
        message: "Produit enregistré avec succès dans la base de données",
      });
    } catch (error) {
      console.error(`❌ Erreur création produit: ${error.message}`);
      console.error("Stack trace:", error.stack);
      res.status(500).json({
        success: false,
        error: "Erreur interne du serveur",
        details: error.message,
      });
    }
  },

  /**
   * Récupérer les produits d'un utilisateur
   */
  getUserProducts: async (req, res) => {
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

      const [products, total] = await Promise.all([
        prisma.product.findMany({
          where: {
            userId: uuidUserId,
          },
          include: {
            variants: true,
            images: {
              include: {
                variantIds: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
          skip: parseInt(skip),
          take: parseInt(limit),
        }),
        prisma.product.count({
          where: {
            userId: uuidUserId,
          },
        }),
      ]);

      console.log(
        `Produits récupérés pour l'utilisateur ${userId}: ${products.length}`
      );

      res.json({
        success: true,
        data: {
          products,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit),
          },
        },
      });
    } catch (error) {
      console.error(`Erreur récupération produits: ${error.message}`);
      res.status(500).json({
        success: false,
        error: "Erreur interne du serveur",
      });
    }
  },

  /**
   * Récupérer le détail d'un produit
   */
  getProductById: async (req, res) => {
    try {
      const { id } = req.params;
      const { userId } = req.query;

      const whereClause = { id };
      if (userId) {
        const uuidUserId = clerkIdToUUID(userId);
        whereClause.userId = uuidUserId;
      }

      const product = await prisma.product.findFirst({
        where: whereClause,
        include: {
          variants: true,
          images: {
            include: {
              variantIds: true,
            },
          },
        },
      });

      if (!product) {
        return res.status(404).json({
          success: false,
          error: "Produit non trouvé",
        });
      }

      console.log(`Produit récupéré: ${product.id}`);

      res.json({
        success: true,
        data: product,
      });
    } catch (error) {
      console.error(`Erreur récupération produit: ${error.message}`);
      res.status(500).json({
        success: false,
        error: "Erreur interne du serveur",
      });
    }
  },

  /**
   * Supprimer un produit
   */
  deleteProduct: async (req, res) => {
    try {
      const { id } = req.params;
      const { userId } = req.query;

      const whereClause = { id };
      if (userId) {
        const uuidUserId = clerkIdToUUID(userId);
        whereClause.userId = uuidUserId;
      }

      const product = await prisma.product.deleteMany({
        where: whereClause,
      });

      if (product.count === 0) {
        return res.status(404).json({
          success: false,
          error: "Produit non trouvé",
        });
      }

      console.log(`Produit supprimé: ${id}`);

      res.json({
        success: true,
        message: "Produit supprimé avec succès",
      });
    } catch (error) {
      console.error(`Erreur suppression produit: ${error.message}`);
      res.status(500).json({
        success: false,
        error: "Erreur interne du serveur",
      });
    }
  },

  /**
   * Mettre à jour un produit
   */
  updateProduct: async (req, res) => {
    try {
      const { id } = req.params;
      const { title, description, marginApplied, variants, images } = req.body;

      const updateData = {};
      if (title) updateData.title = title;
      if (description !== undefined) updateData.description = description;
      if (marginApplied !== undefined) updateData.marginApplied = marginApplied;

      const product = await prisma.product.update({
        where: { id },
        data: updateData,
        include: {
          variants: true,
          images: {
            include: {
              variantIds: true,
            },
          },
        },
      });

      console.log(`Produit mis à jour: ${product.id}`);

      res.json({
        success: true,
        data: product,
        message: "Produit mis à jour avec succès",
      });
    } catch (error) {
      console.error(`Erreur mise à jour produit: ${error.message}`);
      res.status(500).json({
        success: false,
        error: "Erreur interne du serveur",
      });
    }
  },
};

module.exports = productController;

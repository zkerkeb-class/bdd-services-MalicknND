const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Obtenir les crédits d'un utilisateur
const getUserCredits = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: "userId is required",
      });
    }

    // Rechercher ou créer un enregistrement de crédits pour l'utilisateur
    let userCredits = await prisma.credits.findUnique({
      where: { userId },
    });

    if (!userCredits) {
      // Créer un nouvel enregistrement avec 0 crédits
      userCredits = await prisma.credits.create({
        data: {
          userId,
          amount: 2,
        },
      });
    }

    res.json({
      success: true,
      data: {
        userId: userCredits.userId,
        credits: userCredits.amount,
        canGenerate: userCredits.amount > 0,
      },
    });
  } catch (error) {
    console.error("❌ Error getting user credits:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get user credits",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Utiliser des crédits
const useCredits = async (req, res) => {
  try {
    const { userId, amount = 1 } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: "userId is required",
      });
    }

    if (amount < 1) {
      return res.status(400).json({
        success: false,
        error: "Amount must be positive",
      });
    }

    // Utiliser une transaction pour éviter les conditions de course
    const result = await prisma.$transaction(async (tx) => {
      // Rechercher les crédits actuels
      let userCredits = await tx.credits.findUnique({
        where: { userId },
      });

      if (!userCredits) {
        return res.status(404).json({
          success: false,
          error: "User credits not found",
        });
      }

      if (userCredits.amount < amount) {
        return res.status(402).json({
          success: false,
          error: "Insufficient credits",
          data: {
            currentCredits: userCredits.amount,
            requiredCredits: amount,
            canGenerate: false,
          },
        });
      }

      // Déduire les crédits
      const updatedCredits = await tx.credits.update({
        where: { userId },
        data: {
          amount: userCredits.amount - amount,
        },
      });

      return {
        success: true,
        data: {
          userId: updatedCredits.userId,
          creditsUsed: amount,
          remainingCredits: updatedCredits.amount,
          canGenerate: updatedCredits.amount > 0,
        },
      };
    });

    if (result.success === false) {
      return res.status(result.status || 500).json(result);
    }

    console.log(
      `💳 User ${userId} used ${amount} credits (remaining: ${result.data.remainingCredits})`
    );

    res.json(result);
  } catch (error) {
    console.error("❌ Error using credits:", error);
    res.status(500).json({
      success: false,
      error: "Failed to use credits",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Ajouter des crédits (pour les webhooks Stripe)
const addCredits = async (req, res) => {
  try {
    const { userId, amount } = req.body;

    if (!userId || !amount) {
      return res.status(400).json({
        success: false,
        error: "userId and amount are required",
      });
    }

    if (amount < 1) {
      return res.status(400).json({
        success: false,
        error: "Amount must be positive",
      });
    }

    // Utiliser upsert pour créer ou mettre à jour
    const result = await prisma.credits.upsert({
      where: { userId },
      update: {
        amount: {
          increment: amount,
        },
      },
      create: {
        userId,
        amount,
      },
    });

    console.log(
      `✅ Credits added for user ${userId}: ${amount} credits (total: ${result.amount})`
    );

    res.json({
      success: true,
      data: {
        userId: result.userId,
        creditsAdded: amount,
        totalCredits: result.amount,
        canGenerate: result.amount > 0,
      },
    });
  } catch (error) {
    console.error("❌ Error adding credits:", error);
    res.status(500).json({
      success: false,
      error: "Failed to add credits",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Réinitialiser les crédits (pour les tests)
const resetCredits = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: "userId is required",
      });
    }

    const result = await prisma.credits.upsert({
      where: { userId },
      update: {
        amount: 0,
      },
      create: {
        userId,
        amount: 0,
      },
    });

    console.log(`🔄 Credits reset for user ${userId}: 0 credits`);

    res.json({
      success: true,
      data: {
        userId: result.userId,
        credits: result.amount,
        canGenerate: false,
      },
    });
  } catch (error) {
    console.error("❌ Error resetting credits:", error);
    res.status(500).json({
      success: false,
      error: "Failed to reset credits",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

module.exports = {
  getUserCredits,
  useCredits,
  addCredits,
  resetCredits,
};

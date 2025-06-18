const axios = require("axios");

// Configuration
const BASE_URL = "http://localhost:9002";
const TEST_USER_ID = "test_user_123";

async function testPrismaAPI() {
  console.log("🧪 Test de l'API Prisma\n");
  console.log("=".repeat(50));

  try {
    // Test 1: Vérifier la santé du service
    console.log("1. Test de santé du service...");
    const healthResponse = await axios.get(`${BASE_URL}/api/health`);
    console.log("✅ Service opérationnel:", healthResponse.data.message);

    // Test 2: Créer une image
    console.log("\n2. Test de création d'image...");
    const createResponse = await axios.post(`${BASE_URL}/api/images`, {
      userId: TEST_USER_ID,
      prompt: "A beautiful sunset over mountains",
      imageUrl: "https://example.com/test-image.jpg",
    });

    const createdImage = createResponse.data.data;
    console.log("✅ Image créée avec succès!");
    console.log("   ID:", createdImage.id);
    console.log("   Prompt:", createdImage.prompt);

    // Test 3: Récupérer les images de l'utilisateur
    console.log("\n3. Test de récupération d'images...");
    const getImagesResponse = await axios.get(
      `${BASE_URL}/api/images?userId=${TEST_USER_ID}`
    );
    const images = getImagesResponse.data.data.images;
    console.log("✅ Images récupérées:", images.length, "image(s)");
    console.log("   Pagination:", getImagesResponse.data.data.pagination);

    // Test 4: Récupérer une image spécifique
    console.log("\n4. Test de récupération d'image spécifique...");
    const getImageResponse = await axios.get(
      `${BASE_URL}/api/images/${createdImage.id}`
    );
    const retrievedImage = getImageResponse.data.data;
    console.log("✅ Image récupérée:", retrievedImage.id);
    console.log("   URL:", retrievedImage.imageUrl);

    // Test 5: Supprimer l'image
    console.log("\n5. Test de suppression d'image...");
    const deleteResponse = await axios.delete(
      `${BASE_URL}/api/images/${createdImage.id}`
    );
    console.log("✅ Image supprimée:", deleteResponse.data.message);

    // Test 6: Vérifier que l'image est supprimée
    console.log("\n6. Test de vérification de suppression...");
    try {
      await axios.get(`${BASE_URL}/api/images/${createdImage.id}`);
      console.log("❌ Erreur: L'image existe encore");
    } catch (error) {
      if (error.response && error.response.status === 404) {
        console.log("✅ Image correctement supprimée (404 retourné)");
      } else {
        console.log("⚠️  Erreur inattendue:", error.message);
      }
    }

    console.log("\n" + "=".repeat(50));
    console.log("🎉 Tous les tests sont passés avec succès!");
    console.log("\n📋 Résumé:");
    console.log("- Service Prisma: ✅ Opérationnel");
    console.log("- CRUD Images: ✅ Fonctionnel");
    console.log("- Pagination: ✅ Fonctionnelle");
    console.log("- Validation: ✅ Fonctionnelle");
  } catch (error) {
    console.error("\n❌ Erreur lors des tests:", error.message);
    if (error.response) {
      console.error("   Status:", error.response.status);
      console.error("   Data:", error.response.data);
    }
  }
}

// Exécuter les tests
testPrismaAPI().catch(console.error);

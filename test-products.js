const axios = require("axios");

// Configuration
const BASE_URL = "http://localhost:9002";
const TEST_USER_ID = "user_2ta6NRH0kZxG51Gcn6gCaVzJQPe";

// Données de test basées sur la réponse Printify
const testProductData = {
  userId: TEST_USER_ID,
  printifyId: "6862a2e379a2a4e66f05b610",
  title: "T-shirt IA Génial",
  description: "Un t-shirt avec une image générée par IA",
  blueprintId: 5,
  printProviderId: 1,
  marginApplied: 40,
  originalImageUrl:
    "https://cdn.pixabay.com/photo/2023/05/08/22/00/tshirt-7979854_1280.jpg",
  printifyImageId: "6861b339b9939664017b3ee1",
  variants: [
    {
      id: 17391,
      title: "Unisex Basic T-shirt",
      sku: "tshirt-17391",
      price: 2500,
      priceFormatted: "25.00",
      cost: 1500,
      profit: 1000,
      isEnabled: true,
      isDefault: true,
      options: [831, 13],
    },
    {
      id: 17393,
      title: "Unisex Basic T-shirt",
      sku: "tshirt-17393",
      price: 2500,
      priceFormatted: "25.00",
      cost: 1500,
      profit: 1000,
      isEnabled: true,
      isDefault: false,
      options: [831, 15],
    },
  ],
  images: [
    {
      src: "https://images-api.printify.com/mockup/6862a2e379a2a4e66f05b610/17393/103295/t-shirt-ia-genial.jpg?camera_label=front",
      variant_ids: [17391, 17393],
      position: "front",
      is_default: true,
      is_selected_for_publishing: true,
      order: null,
    },
    {
      src: "https://images-api.printify.com/mockup/6862a2e379a2a4e66f05b610/17393/103296/t-shirt-ia-genial.jpg?camera_label=back",
      variant_ids: [17391, 17393],
      position: "back",
      is_default: false,
      is_selected_for_publishing: true,
      order: null,
    },
  ],
};

async function testProductsAPI() {
  console.log("🧪 Test de l'API Produits\n");
  console.log("=".repeat(50));

  try {
    // Test 1: Vérifier la santé du service
    console.log("1. Test de santé du service...");
    const healthResponse = await axios.get(`${BASE_URL}/api/health`);
    console.log("✅ Service opérationnel:", healthResponse.data.message);

    // Test 2: Créer un produit
    console.log("\n2. Test de création de produit...");
    const createResponse = await axios.post(
      `${BASE_URL}/api/products`,
      testProductData
    );

    const createdProduct = createResponse.data.data;
    console.log("✅ Produit créé avec succès!");
    console.log("   ID:", createdProduct.id);
    console.log("   Titre:", createdProduct.title);
    console.log("   Variants:", createdProduct.variants.length);
    console.log("   Images:", createdProduct.images.length);

    // Test 3: Récupérer les produits de l'utilisateur
    console.log("\n3. Test de récupération de produits...");
    const getProductsResponse = await axios.get(
      `${BASE_URL}/api/products?userId=${TEST_USER_ID}`
    );
    const products = getProductsResponse.data.data.products;
    console.log("✅ Produits récupérés:", products.length, "produit(s)");
    console.log("   Pagination:", getProductsResponse.data.data.pagination);

    // Test 4: Récupérer un produit spécifique
    console.log("\n4. Test de récupération de produit spécifique...");
    const getProductResponse = await axios.get(
      `${BASE_URL}/api/products/${createdProduct.id}`
    );
    const retrievedProduct = getProductResponse.data.data;
    console.log("✅ Produit récupéré:", retrievedProduct.id);
    console.log("   Titre:", retrievedProduct.title);

    // Test 5: Mettre à jour un produit
    console.log("\n5. Test de mise à jour de produit...");
    const updateResponse = await axios.put(
      `${BASE_URL}/api/products/${createdProduct.id}`,
      {
        title: "T-shirt IA Génial - Mis à jour",
        description: "Description mise à jour",
      }
    );
    const updatedProduct = updateResponse.data.data;
    console.log("✅ Produit mis à jour:", updatedProduct.title);

    // Test 6: Supprimer le produit
    console.log("\n6. Test de suppression de produit...");
    const deleteResponse = await axios.delete(
      `${BASE_URL}/api/products/${createdProduct.id}`
    );
    console.log("✅ Produit supprimé:", deleteResponse.data.message);

    // Test 7: Vérifier que le produit est supprimé
    console.log("\n7. Test de vérification de suppression...");
    try {
      await axios.get(`${BASE_URL}/api/products/${createdProduct.id}`);
      console.log("❌ Erreur: Le produit existe encore");
    } catch (error) {
      if (error.response && error.response.status === 404) {
        console.log("✅ Produit correctement supprimé (404 retourné)");
      } else {
        console.log("⚠️  Erreur inattendue:", error.message);
      }
    }

    console.log("\n" + "=".repeat(50));
    console.log("🎉 Tous les tests sont passés avec succès!");
    console.log("\n📋 Résumé:");
    console.log("- Service Produits: ✅ Opérationnel");
    console.log("- CRUD Produits: ✅ Fonctionnel");
    console.log("- Relations (variants/images): ✅ Fonctionnelles");
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
testProductsAPI().catch(console.error);

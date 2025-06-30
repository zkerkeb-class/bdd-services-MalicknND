# Guide d'utilisation - API Produits Printify

## 📋 Description

Ce guide explique comment utiliser l'API des produits pour enregistrer et gérer les produits Printify par utilisateur dans la base de données Supabase.

## 🏗️ Architecture

- **Base de données** : PostgreSQL (Supabase) avec Prisma ORM
- **Service** : Express.js sur le port 9002
- **Modèles** : Product, ProductVariant, ProductImage, ProductImageVariant

## 📊 Modèles de Données

### Table `products`
```sql
- id (CUID)
- userId (UUID - ID utilisateur Clerk converti)
- printifyId (String - ID du produit Printify)
- title (String)
- description (String, optionnel)
- blueprintId (Int)
- printProviderId (Int)
- marginApplied (Int)
- originalImageUrl (String)
- printifyImageId (String)
- createdAt (DateTime)
```

### Table `product_variants`
```sql
- id (CUID)
- productId (CUID - référence vers products)
- printifyVariantId (Int)
- title (String)
- sku (String)
- price (Int)
- priceFormatted (String)
- cost (Int)
- profit (Int)
- isEnabled (Boolean)
- isDefault (Boolean)
- options (Int[])
```

### Table `product_images`
```sql
- id (CUID)
- productId (CUID - référence vers products)
- src (String)
- position (String)
- isDefault (Boolean)
- isSelectedForPublishing (Boolean)
- order (Int, optionnel)
```

## 🚀 API Endpoints

### POST `/api/products`
**Créer un nouveau produit**

**Body :**
```json
{
  "userId": "user_2ta6NRH0kZxG51Gcn6gCaVzJQPe",
  "printifyId": "6862a2e379a2a4e66f05b610",
  "title": "T-shirt IA Génial",
  "description": "Un t-shirt avec une image générée par IA",
  "blueprintId": 5,
  "printProviderId": 1,
  "marginApplied": 40,
  "originalImageUrl": "https://cdn.pixabay.com/photo/2023/05/08/22/00/tshirt-7979854_1280.jpg",
  "printifyImageId": "6861b339b9939664017b3ee1",
  "variants": [
    {
      "id": 17391,
      "title": "Unisex Basic T-shirt",
      "sku": "tshirt-17391",
      "price": 2500,
      "priceFormatted": "25.00",
      "cost": 1500,
      "profit": 1000,
      "isEnabled": true,
      "isDefault": true,
      "options": [831, 13]
    }
  ],
  "images": [
    {
      "src": "https://images-api.printify.com/mockup/6862a2e379a2a4e66f05b610/17393/103295/t-shirt-ia-genial.jpg",
      "variant_ids": [17391, 17393],
      "position": "front",
      "is_default": true,
      "is_selected_for_publishing": true,
      "order": null
    }
  ]
}
```

**Réponse :**
```json
{
  "success": true,
  "data": {
    "id": "clxxx...",
    "userId": "uuid-converted",
    "printifyId": "6862a2e379a2a4e66f05b610",
    "title": "T-shirt IA Génial",
    "variants": [...],
    "images": [...],
    "createdAt": "2025-06-30T14:44:51.000Z"
  },
  "message": "Produit enregistré avec succès dans la base de données"
}
```

### GET `/api/products?userId=...`
**Récupérer les produits d'un utilisateur**

**Paramètres :**
- `userId` : ID de l'utilisateur (requis)
- `page` : Numéro de page (défaut: 1)
- `limit` : Nombre de produits par page (défaut: 10)

**Réponse :**
```json
{
  "success": true,
  "data": {
    "products": [...],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "pages": 3
    }
  }
}
```

### GET `/api/products/:id`
**Récupérer un produit par ID**

### PUT `/api/products/:id`
**Mettre à jour un produit**

### DELETE `/api/products/:id`
**Supprimer un produit**

## 🔧 Configuration

### 1. Migration de la base de données
```bash
cd bdd-services-MalicknND
npx prisma migrate dev --name add_product_tables
```

### 2. Générer le client Prisma
```bash
npx prisma generate
```

### 3. Démarrer le service
```bash
npm run dev
```

## 🔗 Intégration avec Printify

### Workflow complet
1. **Création produit Printify** : Le service Printify crée un produit
2. **Enregistrement en base** : Le service BDD enregistre les métadonnées
3. **Récupération par utilisateur** : Le frontend peut consulter les produits

### Exemple d'intégration
```javascript
// Après création d'un produit Printify
const printifyResponse = await createPrintifyProduct(productData);

// Enregistrer en base de données
const dbResponse = await axios.post('http://localhost:9002/api/products', {
  userId: currentUser.id,
  printifyId: printifyResponse.data.id,
  title: printifyResponse.data.title,
  // ... autres champs
});
```

## 🧪 Tests

### Tester l'API
```bash
cd bdd-services-MalicknND
node test-products.js
```

### Tests disponibles
- ✅ Création de produit
- ✅ Récupération par utilisateur
- ✅ Récupération par ID
- ✅ Mise à jour
- ✅ Suppression
- ✅ Relations (variants/images)
- ✅ Pagination

## 🔐 Sécurité

### Conversion UUID
Les IDs Clerk sont automatiquement convertis en UUID valides :
```javascript
function clerkIdToUUID(clerkId) {
  const hash = require('crypto').createHash('md5').update(clerkId).digest('hex');
  return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-${hash.slice(12, 16)}-${hash.slice(16, 20)}-${hash.slice(20, 32)}`;
}
```

### Validation
- Validation des champs requis
- Conversion automatique des types
- Gestion des erreurs avec messages détaillés

## 📈 Performance

- **Indexation** : Index automatiques sur `userId` et `createdAt`
- **Relations** : Chargement optimisé avec `include`
- **Pagination** : Support natif pour les grandes listes
- **Cascade** : Suppression automatique des relations

## 🔄 Utilisation dans le Frontend

### Service API
```typescript
// services/bddService.ts
export const bddService = {
  async createProduct(productData: any) {
    const response = await fetch('http://localhost:9002/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData)
    });
    return response.json();
  },

  async getUserProducts(userId: string, page = 1, limit = 10) {
    const response = await fetch(
      `http://localhost:9002/api/products?userId=${userId}&page=${page}&limit=${limit}`
    );
    return response.json();
  }
};
```

### Composant React
```tsx
// components/ProductList.tsx
import { useEffect, useState } from 'react';
import { bddService } from '../services/bddService';

export function ProductList({ userId }: { userId: string }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProducts() {
      try {
        const response = await bddService.getUserProducts(userId);
        if (response.success) {
          setProducts(response.data.products);
        }
      } catch (error) {
        console.error('Erreur chargement produits:', error);
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, [userId]);

  if (loading) return <div>Chargement...</div>;

  return (
    <div>
      {products.map(product => (
        <div key={product.id}>
          <h3>{product.title}</h3>
          <p>{product.description}</p>
          <img src={product.images[0]?.src} alt={product.title} />
        </div>
      ))}
    </div>
  );
}
```

## 🐛 Débogage

### Logs disponibles
- `📥 Données produit reçues:` - Données entrantes
- `🔄 Conversion ID:` - Conversion UUID
- `✅ Validation OK` - Validation réussie
- `✅ Produit créé avec succès` - Création réussie
- `❌ Erreur` - Erreurs avec stack trace

### Erreurs courantes
- **400** : Champs manquants ou invalides
- **404** : Produit non trouvé
- **500** : Erreur interne (voir logs)

## 📝 Notes importantes

- Les produits sont liés aux utilisateurs via `userId`
- Les relations (variants/images) sont créées automatiquement
- La pagination est supportée pour les grandes listes
- Les IDs Clerk sont convertis en UUID pour PostgreSQL
- Le service est conçu pour être stateless et scalable 
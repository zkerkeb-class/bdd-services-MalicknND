# Service BDD - Base de Données Centralisée

## 📋 Description

Service de base de données centralisée utilisant **PostgreSQL** avec **Prisma ORM** pour gérer les métadonnées des images générées par IA. Ce service fait partie de l'architecture microservices et centralise toutes les données de l'application.

## 🏗️ Architecture

- **Base de données** : PostgreSQL (Supabase)
- **ORM** : Prisma
- **Framework** : Express.js
- **Port** : 9002

## 📊 Modèle de Données

### Table `images`

```sql
model Image {
    id        String   @id @default(cuid())
    userId    String   @map("user_id") @db.Uuid
    prompt    String
    imageUrl  String   @map("image_url")
    createdAt DateTime @default(now()) @map("created_at")

    @@map("images")
}
```

**Champs :**
- `id` : Identifiant unique (CUID)
- `userId` : ID de l'utilisateur (UUID converti depuis Clerk)
- `prompt` : Prompt utilisé pour générer l'image
- `imageUrl` : URL de l'image stockée dans Supabase
- `createdAt` : Date de création

## 🚀 API Endpoints

### POST `/api/images`
**Créer une nouvelle image**

```json
{
  "userId": "user_2ta6NRH0kZxG51Gcn6gCaVzJQPe",
  "prompt": "developer",
  "imageUrl": "https://supabase.co/storage/v1/object/public/images/...",
  "metadata": { /* optionnel */ }
}
```

**Réponse :**
```json
{
  "success": true,
  "data": {
    "id": "clxxx...",
    "userId": "uuid-converted",
    "prompt": "developer",
    "imageUrl": "https://...",
    "createdAt": "2025-06-18T00:00:00.000Z"
  }
}
```

### GET `/api/images?userId=...`
**Récupérer les images d'un utilisateur**

**Paramètres :**
- `userId` : ID de l'utilisateur (requis)
- `page` : Numéro de page (défaut: 1)
- `limit` : Nombre d'images par page (défaut: 10)

**Réponse :**
```json
{
  "success": true,
  "data": {
    "images": [...],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "pages": 3
    }
  }
}
```

### GET `/api/images/:id`
**Récupérer une image par ID**

**Paramètres :**
- `id` : ID de l'image
- `userId` : ID de l'utilisateur (optionnel, pour vérification)

### DELETE `/api/images/:id`
**Supprimer une image**

**Paramètres :**
- `id` : ID de l'image
- `userId` : ID de l'utilisateur (optionnel, pour vérification)

### GET `/api/health`
**Vérifier la santé du service**

## 🔧 Configuration

### Variables d'environnement

```env
# Base de données
DATABASE_URL="postgresql://user:password@host:port/database"

# Serveur
PORT=9002
```

### Scripts disponibles

```bash
# Développement
npm run dev

# Production
npm start

# Base de données
npm run db:generate    # Générer le client Prisma
npm run db:push        # Pousser le schéma vers la DB
npm run db:migrate     # Créer et appliquer une migration
npm run db:studio      # Ouvrir Prisma Studio
```

## 🔐 Sécurité

### Conversion UUID
Le service convertit automatiquement les IDs Clerk (`user_xxx`) en UUID valides pour PostgreSQL :

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

## 🔗 Intégration

### Services connectés
- **Service IA** : Envoie les métadonnées des images générées
- **Service Images** : Récupère et gère les métadonnées
- **Frontend** : Consulte l'historique des images

### Workflow
1. Service IA génère une image
2. Service Images upload vers Supabase
3. Service Images enregistre les métadonnées dans ce service BDD
4. Frontend peut consulter l'historique

## 🐛 Débogage

### Logs
Le service utilise des logs détaillés :
- `📥 Données reçues:` - Données entrantes
- `🔄 Conversion ID:` - Conversion UUID
- `✅ Validation OK` - Validation réussie
- `❌ Erreur` - Erreurs avec stack trace

### Erreurs courantes
- **400** : Champs manquants ou invalides
- **404** : Image non trouvée
- **500** : Erreur interne (voir logs)

## 📈 Performance

- **Indexation** : Index automatiques sur `userId` et `createdAt`
- **Pagination** : Support natif pour les grandes listes
- **Connexions** : Pool de connexions Prisma optimisé

## 🔄 Migrations

Pour modifier le schéma :

```bash
# Créer une migration
npx prisma migrate dev --name description

# Appliquer en production
npx prisma migrate deploy
```

## 📝 Notes de développement

- Le service est conçu pour être stateless
- Pas d'authentification directe (gérée par les services appelants)
- Compatible avec les policies RLS de Supabase
- Support complet des transactions Prisma 
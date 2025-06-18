# Service BDD avec Prisma

Ce service utilise Prisma avec PostgreSQL pour gérer les données des images.

## Configuration

### 1. Variables d'environnement

Copiez le fichier d'exemple et configurez votre base de données :

```bash
cp env-prisma.example .env
```

Modifiez le fichier `.env` avec vos paramètres PostgreSQL :

```env
DATABASE_URL="postgresql://username:password@localhost:5432/database_name?schema=public"
```

### 2. Installation des dépendances

```bash
npm install
```

### 3. Génération du client Prisma

```bash
npm run db:generate
```

### 4. Synchronisation avec la base de données

```bash
# Pour synchroniser le schéma avec la base de données
npm run db:push

# Ou pour créer une migration
npm run db:migrate
```

## Structure de la base de données

### Table `images`

```sql
CREATE TABLE "images" (
  "id" TEXT NOT NULL,
  "user_id" TEXT NOT NULL,
  "prompt" TEXT NOT NULL,
  "image_url" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "images_pkey" PRIMARY KEY ("id")
);
```

## API Endpoints

### POST /api/images
Créer une nouvelle image

**Body :**
```json
{
  "userId": "user_123",
  "prompt": "A beautiful sunset",
  "imageUrl": "https://example.com/image.jpg"
}
```

**Response :**
```json
{
  "success": true,
  "data": {
    "id": "clx1234567890",
    "userId": "user_123",
    "prompt": "A beautiful sunset",
    "imageUrl": "https://example.com/image.jpg",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### GET /api/images?userId=xxx
Récupérer les images d'un utilisateur

**Query Parameters :**
- `userId` : ID de l'utilisateur (requis)
- `page` : Numéro de page (défaut: 1)
- `limit` : Nombre d'images par page (défaut: 10)

**Response :**
```json
{
  "success": true,
  "data": {
    "images": [
      {
        "id": "clx1234567890",
        "userId": "user_123",
        "prompt": "A beautiful sunset",
        "imageUrl": "https://example.com/image.jpg",
        "createdAt": "2024-01-15T10:30:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 1,
      "pages": 1
    }
  }
}
```

### GET /api/images/:id
Récupérer le détail d'une image

**Query Parameters :**
- `userId` : ID de l'utilisateur (optionnel, pour vérification)

**Response :**
```json
{
  "success": true,
  "data": {
    "id": "clx1234567890",
    "userId": "user_123",
    "prompt": "A beautiful sunset",
    "imageUrl": "https://example.com/image.jpg",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### DELETE /api/images/:id
Supprimer une image

**Query Parameters :**
- `userId` : ID de l'utilisateur (optionnel, pour vérification)

**Response :**
```json
{
  "success": true,
  "message": "Image supprimée avec succès"
}
```

## Démarrage

### Mode développement avec Prisma
```bash
npm run dev:prisma
```

### Mode production avec Prisma
```bash
npm run start:prisma
```

## Outils Prisma

### Prisma Studio
Interface graphique pour visualiser et modifier les données :

```bash
npm run db:studio
```

### Génération du client
Après modification du schéma :

```bash
npm run db:generate
```

### Migration de la base de données
Pour créer et appliquer des migrations :

```bash
npm run db:migrate
```

## Intégration avec Supabase

Ce service peut être utilisé avec Supabase PostgreSQL. Configurez simplement la `DATABASE_URL` avec les paramètres de votre base Supabase :

```env
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"
```

## Tests

### Test de santé
```bash
curl http://localhost:9002/api/health
```

### Test de création d'image
```bash
curl -X POST http://localhost:9002/api/images \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user_123",
    "prompt": "A beautiful sunset",
    "imageUrl": "https://example.com/image.jpg"
  }'
```

### Test de récupération d'images
```bash
curl "http://localhost:9002/api/images?userId=user_123"
``` 
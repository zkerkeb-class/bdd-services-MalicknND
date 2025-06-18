# 🚀 Guide de démarrage rapide - Prisma

## Prérequis

- Node.js 18+
- PostgreSQL (local ou Supabase)
- npm ou yarn

## 1. Configuration de la base de données

### Option A: PostgreSQL local
```bash
# Créer la base de données
createdb microservices_db

# Ou avec psql
psql -c "CREATE DATABASE microservices_db;"
```

### Option B: Supabase PostgreSQL
1. Créez un projet sur [supabase.com](https://supabase.com)
2. Récupérez les paramètres de connexion depuis Settings > Database

## 2. Configuration des variables d'environnement

```bash
# Copier le fichier d'exemple
cp env-prisma.example .env

# Éditer le fichier .env
nano .env
```

**Pour PostgreSQL local :**
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/microservices_db?schema=public"
```

**Pour Supabase :**
```env
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"
```

## 3. Installation et configuration

```bash
# Installer les dépendances
npm install

# Générer le client Prisma
npm run db:generate

# Synchroniser le schéma avec la base de données
npm run db:push
```

## 4. Démarrage du service

```bash
# Mode développement
npm run dev:prisma

# Mode production
npm run start:prisma
```

Le service sera accessible sur `http://localhost:9002`

## 5. Test du service

```bash
# Test de santé
curl http://localhost:9002/api/health

# Test complet avec le script
node test-prisma.js
```

## 6. Utilisation de l'API

### Créer une image
```bash
curl -X POST http://localhost:9002/api/images \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user_123",
    "prompt": "A beautiful sunset",
    "imageUrl": "https://example.com/image.jpg"
  }'
```

### Récupérer les images d'un utilisateur
```bash
curl "http://localhost:9002/api/images?userId=user_123&page=1&limit=10"
```

### Récupérer une image spécifique
```bash
curl http://localhost:9002/api/images/image_id_here
```

### Supprimer une image
```bash
curl -X DELETE http://localhost:9002/api/images/image_id_here
```

## 7. Outils Prisma

### Prisma Studio (Interface graphique)
```bash
npm run db:studio
```
Ouvre une interface web pour visualiser et modifier les données.

### Génération du client
Après modification du schéma :
```bash
npm run db:generate
```

### Migration de la base de données
```bash
npm run db:migrate
```

## 8. Structure de la base de données

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

## 9. Intégration avec le service d'images

Le service d'images peut maintenant communiquer avec ce service BDD Prisma :

```javascript
// Dans le service d'images
const response = await fetch('http://localhost:9002/api/images', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    userId: 'user_123',
    prompt: 'Generated image prompt',
    imageUrl: 'https://supabase.co/storage/image.jpg'
  })
});
```

## 10. Dépannage

### Erreur de connexion à la base de données
- Vérifier que PostgreSQL est démarré
- Vérifier les paramètres de connexion dans `.env`
- Vérifier que la base de données existe

### Erreur Prisma
- Régénérer le client : `npm run db:generate`
- Vérifier le schéma : `npx prisma validate`
- Synchroniser la base : `npm run db:push`

### Erreur de port
- Vérifier que le port 9002 est disponible
- Modifier le port dans `.env` si nécessaire

## Support

Pour toute question ou problème, consultez la documentation complète dans `README-PRISMA.md`. 
# 📚 Documentation API - Location de Voitures

## 🚗 Base URL
```
http://localhost:5000/api/cars
```

---

## 📋 Endpoints

### 1️⃣ **GET /api/cars** - Liste des voitures
Récupère la liste des voitures **publiées** avec filtres et pagination.

**Méthode** : `GET`
**Authentification** : ❌ Non requise

**Paramètres de requête (Query)** :
```
- marque (string) : Filtrer par marque (exemple: "Toyota")
- modele (string) : Filtrer par modèle (exemple: "Prius")
- type_carburant (string) : essence, diesel, électrique, hybride
- prix_min (number) : Prix minimum par jour
- prix_max (number) : Prix maximum par jour
- transmission (string) : manuelle, automatique
- page (number) : Numéro de la page (défaut: 1)
- limit (number) : Nombre de résultats par page (défaut: 12)
```

**Exemple de requête** :
```bash
GET /api/cars?marque=Toyota&transmission=automatique&prix_max=100&page=1&limit=12
```

**Réponse réussie (200)** :
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "marque": "Toyota",
      "modele": "Prius",
      "annee": 2023,
      "type_carburant": "hybride",
      "transmission": "automatique",
      "nb_places": 5,
      "couleur": "Blanc",
      "plaque_immatriculation": "ABC-123-XY",
      "prix_par_jour": 85.50,
      "description": "Voiture écologique et économique",
      "climatise": 1,
      "wifi": 1,
      "cruise_control": 1,
      "siege_chauffant": 0,
      "toit_panoramique": 0,
      "photo_principale": "http://localhost:5000/uploads/cars/photo1.jpg"
    }
  ],
  "pagination": {
    "total": 25,
    "page": 1,
    "limit": 12,
    "total_pages": 3
  }
}
```

---

### 2️⃣ **GET /api/cars/:id** - Détail d'une voiture
Récupère les informations détaillées d'une voiture avec toutes ses photos.

**Méthode** : `GET`
**Authentification** : ❌ Non requise

**Paramètres URL** :
- `id` (number) : ID de la voiture

**Exemple de requête** :
```bash
GET /api/cars/1
```

**Réponse réussie (200)** :
```json
{
  "success": true,
  "data": {
    "id": 1,
    "marque": "Toyota",
    "modele": "Prius",
    "annee": 2023,
    "type_carburant": "hybride",
    "transmission": "automatique",
    "nb_places": 5,
    "couleur": "Blanc",
    "plaque_immatriculation": "ABC-123-XY",
    "prix_par_jour": 85.50,
    "description": "Voiture écologique et économique",
    "climatise": 1,
    "wifi": 1,
    "cruise_control": 1,
    "siege_chauffant": 0,
    "toit_panoramique": 0,
    "est_publie": 1,
    "created_at": "2024-05-22T10:30:00Z",
    "updated_at": "2024-05-22T15:45:00Z",
    "images": [
      {
        "id": 1,
        "url": "http://localhost:5000/uploads/cars/photo1.jpg",
        "est_principale": 1,
        "ordre": 1
      },
      {
        "id": 2,
        "url": "http://localhost:5000/uploads/cars/photo2.jpg",
        "est_principale": 0,
        "ordre": 2
      }
    ]
  }
}
```

**Erreur (404)** :
```json
{
  "success": false,
  "message": "Voiture introuvable."
}
```

---

### 3️⃣ **GET /api/cars/admin/all** - Liste admin (toutes les voitures)
Récupère **toutes** les voitures (publiées ET brouillons) pour l'admin.

**Méthode** : `GET`
**Authentification** : ✅ Requise (token JWT + rôle admin)

**Headers** :
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Paramètres de requête** :
```
- page (number) : Numéro de la page (défaut: 1)
- limit (number) : Nombre de résultats par page (défaut: 50)
```

**Exemple de requête** :
```bash
GET /api/cars/admin/all?page=1&limit=50
Authorization: Bearer YOUR_JWT_TOKEN
```

**Réponse réussie (200)** :
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "marque": "Toyota",
      "modele": "Prius",
      "est_publie": 1,
      "photo_principale": "http://localhost:5000/uploads/cars/photo1.jpg"
      // ... autres champs
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50
  }
}
```

---

### 4️⃣ **GET /api/cars/admin/:id** - Détail admin d'une voiture
Récupère le détail d'une voiture (publiée ou brouillon) pour l'admin.

**Méthode** : `GET`
**Authentification** : ✅ Requise (token JWT + rôle admin)

**Headers** :
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Paramètres URL** :
- `id` (number) : ID de la voiture

**Exemple de requête** :
```bash
GET /api/cars/admin/1
Authorization: Bearer YOUR_JWT_TOKEN
```

**Réponse réussie (200)** :
```json
{
  "success": true,
  "data": {
    "id": 1,
    "marque": "Toyota",
    "modele": "Prius",
    // ... tous les champs de la voiture
    "images": [
      {
        "id": 1,
        "url": "http://localhost:5000/uploads/cars/photo1.jpg",
        "est_principale": 1,
        "ordre": 1
      }
    ]
  }
}
```

---

### 5️⃣ **POST /api/cars** - Créer une voiture
Crée une nouvelle annonce de voiture (brouillon par défaut).

**Méthode** : `POST`
**Authentification** : ✅ Requise (token JWT + rôle admin)

**Headers** :
```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

**Corps de la requête** :
```json
{
  "marque": "BMW",
  "modele": "X5",
  "annee": 2024,
  "type_carburant": "diesel",
  "transmission": "automatique",
  "nb_places": 5,
  "couleur": "Noir",
  "plaque_immatriculation": "XYZ-789-AB",
  "prix_par_jour": 150.00,
  "description": "Luxueux SUV familial avec tous les équipements",
  "climatise": true,
  "wifi": true,
  "cruise_control": true,
  "siege_chauffant": true,
  "toit_panoramique": false
}
```

**Champs obligatoires** :
- `marque` (string)
- `modele` (string)
- `type_carburant` (string)
- `transmission` (string)
- `nb_places` (number)
- `plaque_immatriculation` (string)
- `prix_par_jour` (number)

**Champs optionnels** :
- `annee` (number)
- `couleur` (string)
- `description` (text)
- `climatise` (boolean) - défaut: false
- `wifi` (boolean) - défaut: false
- `cruise_control` (boolean) - défaut: false
- `siege_chauffant` (boolean) - défaut: false
- `toit_panoramique` (boolean) - défaut: false

**Exemple de requête** :
```bash
curl -X POST http://localhost:5000/api/cars \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "marque": "BMW",
    "modele": "X5",
    "annee": 2024,
    "type_carburant": "diesel",
    "transmission": "automatique",
    "nb_places": 5,
    "couleur": "Noir",
    "plaque_immatriculation": "XYZ-789-AB",
    "prix_par_jour": 150.00,
    "description": "Luxueux SUV familial",
    "climatise": true,
    "wifi": true
  }'
```

**Réponse réussie (201)** :
```json
{
  "success": true,
  "message": "Voiture créée avec succès.",
  "data": {
    "id": 2
  }
}
```

**Erreur (400)** :
```json
{
  "success": false,
  "message": "Veuillez fournir tous les champs obligatoires."
}
```

---

### 6️⃣ **PUT /api/cars/:id** - Modifier une voiture
Modifie une voiture existante.

**Méthode** : `PUT`
**Authentification** : ✅ Requise (token JWT + rôle admin)

**Headers** :
```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

**Paramètres URL** :
- `id` (number) : ID de la voiture

**Corps de la requête** (tous les champs sont optionnels) :
```json
{
  "marque": "BMW",
  "modele": "X7",
  "annee": 2024,
  "type_carburant": "diesel",
  "transmission": "automatique",
  "nb_places": 7,
  "couleur": "Gris",
  "prix_par_jour": 180.00,
  "description": "Luxueux SUV 7 places",
  "climatise": true,
  "wifi": true,
  "cruise_control": true,
  "siege_chauffant": true,
  "toit_panoramique": true
}
```

**Exemple de requête** :
```bash
curl -X PUT http://localhost:5000/api/cars/2 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "prix_par_jour": 180.00,
    "couleur": "Gris"
  }'
```

**Réponse réussie (200)** :
```json
{
  "success": true,
  "message": "Voiture mise à jour avec succès.",
  "data": {
    "id": 2
  }
}
```

**Erreur (404)** :
```json
{
  "success": false,
  "message": "Voiture introuvable."
}
```

---

### 7️⃣ **PATCH /api/cars/:id/publish** - Publier/Dépublier
Publie ou dépublie une voiture.

**Méthode** : `PATCH`
**Authentification** : ✅ Requise (token JWT + rôle admin)

**Headers** :
```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

**Paramètres URL** :
- `id` (number) : ID de la voiture

**Corps de la requête** :
```json
{
  "est_publie": true
}
```

**Exemple de requête** :
```bash
curl -X PATCH http://localhost:5000/api/cars/2/publish \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"est_publie": true}'
```

**Réponse réussie (200)** :
```json
{
  "success": true,
  "message": "Voiture publiée avec succès.",
  "data": {
    "id": 2
  }
}
```

**Erreur (400)** :
```json
{
  "success": false,
  "message": "Le champ \"est_publie\" doit être un booléen."
}
```

---

### 8️⃣ **DELETE /api/cars/:id** - Supprimer une voiture
Supprime une voiture et toutes ses images associées.

**Méthode** : `DELETE`
**Authentification** : ✅ Requise (token JWT + rôle admin)

**Headers** :
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Paramètres URL** :
- `id` (number) : ID de la voiture

**Exemple de requête** :
```bash
curl -X DELETE http://localhost:5000/api/cars/2 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Réponse réussie (200)** :
```json
{
  "success": true,
  "message": "Voiture supprimée avec succès."
}
```

**Erreur (404)** :
```json
{
  "success": false,
  "message": "Voiture introuvable."
}
```

---

## 🔑 Authentification

Les endpoints admin nécessitent un **JWT Token** fourni dans l'en-tête `Authorization` :

```
Authorization: Bearer YOUR_JWT_TOKEN
```

Pour obtenir un token :
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "your_password"
}
```

---

## 📊 Filtres et Recherche

### Recherche par marque :
```
GET /api/cars?marque=Toyota
```

### Recherche par type de carburant :
```
GET /api/cars?type_carburant=diesel
```

### Recherche par prix :
```
GET /api/cars?prix_min=50&prix_max=150
```

### Recherche combinée :
```
GET /api/cars?marque=BMW&type_carburant=diesel&prix_min=100&prix_max=200&transmission=automatique&page=1&limit=20
```

---

## 🖼️ Gestion des images (À venir)

Les endpoints pour télécharger et gérer les images des voitures seront similaires à ceux des logements :
- `POST /api/upload/car/:id` - Télécharger une image
- `DELETE /api/upload/car/:id/:imageId` - Supprimer une image

---

## ❌ Codes d'erreur

| Code | Message | Description |
|------|---------|-------------|
| 200 | OK | Requête réussie |
| 201 | Created | Voiture créée avec succès |
| 400 | Bad Request | Champs obligatoires manquants ou invalides |
| 404 | Not Found | Voiture introuvable |
| 401 | Unauthorized | Token JWT manquant ou invalide |
| 403 | Forbidden | Accès refusé (non-admin) |
| 500 | Internal Server Error | Erreur serveur |

---

## 📌 Notes importantes

- ✅ Les routes **GET sans paramètre admin** sont **publiques** (pas d'authentification)
- ✅ Les routes **GET avec /admin** et **POST, PUT, PATCH, DELETE** nécessitent l'**authentification admin**
- ✅ Les voitures sont **brouillons par défaut** après création (est_publie = false)
- ✅ Seules les voitures **publiées** (est_publie = true) apparaissent dans les listes publiques
- ✅ La **pagination** par défaut est de **12 voitures** par page
- ✅ Les images de voitures seront gérées via des endpoints séparés (voir section "Gestion des images")

---

## 🚀 Prochaines étapes

Pour intégrer complètement cette fonctionnalité, vous devez :

1. ✅ Créer la table `cars` et `car_images` dans votre base de données
2. ✅ Ajouter les routes au serveur
3. ⏳ Créer un modèle pour les réservations de voitures (`CarReservation.model.js`)
4. ⏳ Créer des endpoints pour gérer les images des voitures
5. ⏳ Intégrer les voitures au panel d'administration (frontend)

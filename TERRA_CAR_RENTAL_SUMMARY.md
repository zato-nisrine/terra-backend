# 🚗 TERRA BACKEND - API Location de Voitures

## 📌 Fichiers créés

Voici tous les fichiers que j'ai ajoutés au backend pour la fonctionnalité de location de voitures :

### Modèles
- `src/models/Car.model.js` - Gestion des voitures
- `src/models/CarReservation.model.js` - Gestion des réservations de voitures

### Contrôleurs
- `src/controllers/car.controller.js` - Logique métier pour les voitures
- `src/controllers/carReservation.controller.js` - Logique métier pour les réservations

### Routes
- `src/routes/car.routes.js` - Endpoints pour les voitures
- `src/routes/carReservation.routes.js` - Endpoints pour les réservations

### Base de données
- `database/schema.sql` - Tables `cars`, `car_images` et `car_reservations` ajoutées

### Configuration
- `server.js` - Routes intégrées

### Documentation
- `API_CARS_DOCUMENTATION.md` - Documentation complète des endpoints voitures
- `API_CAR_RESERVATIONS_DOCUMENTATION.md` - Documentation complète des endpoints réservations
- `TERRA_CAR_RENTAL_SUMMARY.md` - Ce fichier

---

## 🚗 ENDPOINTS - VOITURES

### Routes Publiques (sans authentification)

#### **GET /api/cars** - Liste des voitures publiées
```bash
GET /api/cars?marque=Toyota&type_carburant=diesel&prix_max=150&page=1&limit=12
```
Paramètres optionnels :
- `marque` - Filtrer par marque
- `modele` - Filtrer par modèle
- `type_carburant` - essence, diesel, électrique, hybride
- `prix_min` - Prix minimum par jour
- `prix_max` - Prix maximum par jour
- `transmission` - manuelle, automatique
- `page` - Numéro de page (défaut: 1)
- `limit` - Résultats par page (défaut: 12)

---

#### **GET /api/cars/:id** - Détail d'une voiture
```bash
GET /api/cars/1
```

---

### Routes Admin (authentification + rôle admin)

#### **GET /api/cars/admin/all** - Toutes les voitures (publiées + brouillons)
```bash
GET /api/cars/admin/all?page=1&limit=50
Authorization: Bearer YOUR_JWT_TOKEN
```

---

#### **GET /api/cars/admin/:id** - Détail d'une voiture (admin)
```bash
GET /api/cars/admin/1
Authorization: Bearer YOUR_JWT_TOKEN
```

---

#### **POST /api/cars** - Créer une voiture
```bash
POST /api/cars
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

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
  "description": "Luxueux SUV avec tous les équipements",
  "climatise": true,
  "wifi": true,
  "cruise_control": true,
  "siege_chauffant": true,
  "toit_panoramique": false
}
```

**Champs obligatoires :**
- marque
- modele
- type_carburant
- transmission
- nb_places
- plaque_immatriculation
- prix_par_jour

---

#### **PUT /api/cars/:id** - Modifier une voiture
```bash
PUT /api/cars/1
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "prix_par_jour": 180.00,
  "couleur": "Gris"
}
```

---

#### **PATCH /api/cars/:id/publish** - Publier/Dépublier
```bash
PATCH /api/cars/1/publish
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "est_publie": true
}
```

---

#### **DELETE /api/cars/:id** - Supprimer une voiture
```bash
DELETE /api/cars/1
Authorization: Bearer YOUR_JWT_TOKEN
```

---

## 📅 ENDPOINTS - RÉSERVATIONS DE VOITURES

### Routes Client (authentification requise)

#### **POST /api/car-reservations** - Créer une réservation
```bash
POST /api/car-reservations
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "car_id": 1,
  "date_debut": "2024-06-01",
  "date_fin": "2024-06-05",
  "nb_jours": 5,
  "prix_total": 425.50,
  "message": "Je vais faire un voyage en famille"
}
```

**Champs obligatoires :**
- car_id
- date_debut (format: YYYY-MM-DD)
- date_fin (format: YYYY-MM-DD)
- nb_jours
- prix_total

---

#### **GET /api/car-reservations** - Mes réservations
```bash
GET /api/car-reservations?page=1&limit=10
Authorization: Bearer YOUR_JWT_TOKEN
```

---

#### **GET /api/car-reservations/:id** - Détail d'une réservation
```bash
GET /api/car-reservations/1
Authorization: Bearer YOUR_JWT_TOKEN
```

---

#### **DELETE /api/car-reservations/:id** - Annuler une réservation
```bash
DELETE /api/car-reservations/1
Authorization: Bearer YOUR_JWT_TOKEN
```

---

### Routes Admin (authentification + rôle admin)

#### **GET /api/car-reservations/admin/all** - Toutes les réservations
```bash
GET /api/car-reservations/admin/all?statut=en_attente&page=1&limit=20
Authorization: Bearer YOUR_JWT_TOKEN
```

Paramètres optionnels :
- `car_id` - Filtrer par ID de voiture
- `statut` - en_attente, confirme, refuse, annule
- `page` - Numéro de page
- `limit` - Résultats par page

---

#### **PATCH /api/car-reservations/:id/status** - Mettre à jour le statut
```bash
PATCH /api/car-reservations/1/status
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "statut": "confirme",
  "note_admin": "Réservation confirmée, permis validé"
}
```

**Statuts acceptés :**
- `en_attente` - En attente de confirmation
- `confirme` - Réservation confirmée
- `refuse` - Réservation refusée
- `annule` - Réservation annulée

---

## 📊 Statuts des voitures

- `est_publie: 0` - Brouillon (non visible au public)
- `est_publie: 1` - Publié (visible au public)

---

## 🗄️ Structure des tables

### Tableau `cars`
```sql
- id (INT PRIMARY KEY)
- marque (VARCHAR)
- modele (VARCHAR)
- annee (SMALLINT)
- type_carburant (VARCHAR)
- transmission (VARCHAR)
- nb_places (SMALLINT)
- couleur (VARCHAR)
- plaque_immatriculation (VARCHAR UNIQUE)
- prix_par_jour (NUMERIC)
- description (TEXT)
- climatise (SMALLINT boolean)
- wifi (SMALLINT boolean)
- cruise_control (SMALLINT boolean)
- siege_chauffant (SMALLINT boolean)
- toit_panoramique (SMALLINT boolean)
- est_publie (SMALLINT boolean)
- cree_par (INT FK users.id)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

### Tableau `car_images`
```sql
- id (INT PRIMARY KEY)
- car_id (INT FK cars.id)
- url (VARCHAR)
- est_principale (SMALLINT boolean)
- ordre (SMALLINT)
- created_at (TIMESTAMP)
```

### Tableau `car_reservations`
```sql
- id (INT PRIMARY KEY)
- car_id (INT FK cars.id)
- user_id (INT FK users.id)
- date_debut (DATE)
- date_fin (DATE)
- nb_jours (SMALLINT)
- prix_total (NUMERIC)
- statut (VARCHAR)
- message (TEXT)
- note_admin (TEXT)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

---

## 🔐 Authentification

### Se connecter
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "your_password"
}
```

### Réponse
```json
{
  "success": true,
  "message": "Connexion réussie",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Utiliser le token
```
Header: Authorization: Bearer YOUR_JWT_TOKEN
```

---

## 📝 Prochaines étapes

### 1. Créer la base de données
```bash
# Exécuter le script schema.sql pour créer les tables
mysql -u user -p database_name < database/schema.sql
```

### 2. Tester les endpoints avec Postman/cURL
- Importer les endpoints dans votre outil API (Postman, Insomnia, Thunder Client)
- Créer une voiture via `POST /api/cars`
- Publier la voiture via `PATCH /api/cars/:id/publish`
- Créer une réservation via `POST /api/car-reservations`

### 3. Intégrer au frontend
- Créer une page de liste des voitures
- Créer une page de détail d'une voiture
- Créer un formulaire de réservation
- Créer un panel d'administration pour gérer les voitures et réservations

### 4. Ajouter la gestion des images (optionnel)
- Créer des endpoints pour télécharger les images des voitures
- Intégrer l'upload d'images au formulaire de création de voiture

---

## ✅ Fonctionnalités incluses

✅ CRUD complet pour les voitures
✅ Filtrage et recherche des voitures
✅ Pagination
✅ Gestion des statuts (brouillon/publié)
✅ CRUD complet pour les réservations
✅ Vérification automatique de la disponibilité
✅ Gestion des statuts de réservation
✅ Authentification et autorisation (rôles)
✅ Documentation API complète

---

## 🚀 Démarrage du serveur

```bash
# Installer les dépendances
npm install

# Démarrer le serveur
npm start

# Le serveur démarre sur http://localhost:5000
```

---

## 📞 Support

Pour des questions sur les endpoints ou pour tester :

1. Consulter les fichiers de documentation :
   - `API_CARS_DOCUMENTATION.md` - Endpoints voitures
   - `API_CAR_RESERVATIONS_DOCUMENTATION.md` - Endpoints réservations

2. Utiliser un outil comme Postman pour tester les endpoints

3. Vérifier les logs du serveur pour les erreurs

---

## 📚 Documentation détaillée

- **Voitures** → [API_CARS_DOCUMENTATION.md](./API_CARS_DOCUMENTATION.md)
- **Réservations** → [API_CAR_RESERVATIONS_DOCUMENTATION.md](./API_CAR_RESERVATIONS_DOCUMENTATION.md)

# 🚗 RÉSUMÉ RAPIDE - API Location de Voitures (TERRA)

## 📌 Endpoints principaux

### **VOITURES (GET, sans authentification)**

#### Lister toutes les voitures publiées
```
GET /api/cars
```
Options de filtrage :
- `marque=Toyota` - Filtrer par marque
- `prix_min=50&prix_max=150` - Prix min/max
- `type_carburant=diesel` - Type de carburant
- `page=1&limit=12` - Pagination

**Exemple:**
```
GET /api/cars?marque=BMW&prix_max=100&page=1
```

#### Voir une voiture en détail
```
GET /api/cars/1
```

---

### **VOITURES (Admin - Avec authentification)**

#### Lister TOUTES les voitures (admin)
```
GET /api/cars/admin/all
Authorization: Bearer YOUR_TOKEN
```

#### Créer une voiture
```
POST /api/cars
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "marque": "Toyota",
  "modele": "Prius",
  "type_carburant": "hybride",
  "transmission": "automatique",
  "nb_places": 5,
  "couleur": "Blanc",
  "plaque_immatriculation": "ABC-123-XY",
  "prix_par_jour": 85.50,
  "description": "Voiture écologique",
  "climatise": true,
  "wifi": true
}
```

#### Modifier une voiture
```
PUT /api/cars/1
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "prix_par_jour": 95.00,
  "couleur": "Gris"
}
```

#### Publier une voiture
```
PATCH /api/cars/1/publish
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "est_publie": true
}
```

#### Supprimer une voiture
```
DELETE /api/cars/1
Authorization: Bearer YOUR_TOKEN
```

---

### **RÉSERVATIONS (Avec authentification)**

#### Créer une réservation
```
POST /api/car-reservations
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "car_id": 1,
  "date_debut": "2024-06-01",
  "date_fin": "2024-06-05",
  "nb_jours": 5,
  "prix_total": 425.50,
  "message": "Voyage en famille"
}
```

#### Lister mes réservations
```
GET /api/car-reservations
Authorization: Bearer YOUR_TOKEN
```

#### Voir une réservation
```
GET /api/car-reservations/1
Authorization: Bearer YOUR_TOKEN
```

#### Annuler une réservation
```
DELETE /api/car-reservations/1
Authorization: Bearer YOUR_TOKEN
```

---

### **RÉSERVATIONS (Admin)**

#### Lister toutes les réservations
```
GET /api/car-reservations/admin/all
Authorization: Bearer YOUR_TOKEN
```

Filtrer :
- `statut=en_attente` - Afficher seulement les en attente
- `car_id=1` - Afficher les réservations d'une voiture

**Exemple:**
```
GET /api/car-reservations/admin/all?statut=en_attente&car_id=1
```

#### Confirmer/Refuser une réservation
```
PATCH /api/car-reservations/1/status
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "statut": "confirme",
  "note_admin": "Réservation confirmée"
}
```

Statuts possibles :
- `en_attente` - En attente
- `confirme` - Confirmée
- `refuse` - Refusée
- `annule` - Annulée

---

## 🔐 Comment obtenir un token

```
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "password"
}
```

Réponse :
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

Utiliser dans les headers :
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 📊 Propriétés des voitures

```
- id (ID unique)
- marque (Toyota, BMW, etc.)
- modele (Prius, X5, etc.)
- annee (2024)
- type_carburant (essence, diesel, électrique, hybride)
- transmission (manuelle, automatique)
- nb_places (5)
- couleur (Blanc, Noir, etc.)
- plaque_immatriculation (ABC-123-XY)
- prix_par_jour (85.50)
- description (Texte libre)
- climatise (true/false)
- wifi (true/false)
- cruise_control (true/false)
- siege_chauffant (true/false)
- toit_panoramique (true/false)
- est_publie (0 ou 1) - Brouillon si 0, Publié si 1
- photos (URL des images)
```

---

## 📅 Propriétés des réservations

```
- id (ID unique)
- car_id (ID de la voiture)
- user_id (ID du client)
- date_debut (2024-06-01)
- date_fin (2024-06-05)
- nb_jours (5)
- prix_total (425.50)
- statut (en_attente, confirme, refuse, annule)
- message (Message du client)
- note_admin (Note de l'admin)
- created_at (Date de création)
- updated_at (Dernière modification)
```

---

## 🧪 Exemples avec cURL

### Créer une voiture
```bash
curl -X POST http://localhost:5000/api/cars \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "marque": "Toyota",
    "modele": "Prius",
    "type_carburant": "hybride",
    "transmission": "automatique",
    "nb_places": 5,
    "couleur": "Blanc",
    "plaque_immatriculation": "ABC-123-XY",
    "prix_par_jour": 85.50,
    "climatise": true,
    "wifi": true
  }'
```

### Lister les voitures
```bash
curl http://localhost:5000/api/cars?marque=Toyota&prix_max=100
```

### Créer une réservation
```bash
curl -X POST http://localhost:5000/api/car-reservations \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "car_id": 1,
    "date_debut": "2024-06-01",
    "date_fin": "2024-06-05",
    "nb_jours": 5,
    "prix_total": 425.50,
    "message": "Voyage"
  }'
```

### Confirmer une réservation
```bash
curl -X PATCH http://localhost:5000/api/car-reservations/1/status \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "statut": "confirme",
    "note_admin": "Approuvée"
  }'
```

---

## ⚠️ Erreurs courantes

| Erreur | Cause | Solution |
|--------|-------|----------|
| 400 Bad Request | Champs manquants | Vérifier que tous les champs obligatoires sont fournis |
| 401 Unauthorized | Token manquant ou invalide | Se connecter via `/api/auth/login` |
| 403 Forbidden | Pas d'accès admin | Seuls les admins peuvent accéder |
| 404 Not Found | Ressource inexistante | Vérifier l'ID |
| 409 Conflict | Voiture non disponible | Choisir d'autres dates |

---

## 🔗 Ressources

- **Documentation complète voitures** : `API_CARS_DOCUMENTATION.md`
- **Documentation complète réservations** : `API_CAR_RESERVATIONS_DOCUMENTATION.md`
- **Résumé complet** : `TERRA_CAR_RENTAL_SUMMARY.md`

---

## ✅ Checklist - Avant de lancer

- [ ] Base de données créée avec les tables `cars`, `car_images`, `car_reservations`
- [ ] Fichiers des modèles créés dans `src/models/`
- [ ] Fichiers des contrôleurs créés dans `src/controllers/`
- [ ] Routes intégrées dans `server.js`
- [ ] Token d'authentification obtenu
- [ ] Voitures créées et publiées
- [ ] Test de création de réservation
- [ ] Test d'affichage de la liste des voitures

---

## 🚀 Démarrer

```bash
npm install  # Installer les dépendances
npm start    # Lancer le serveur
# Le serveur démarre sur http://localhost:5000
```

---

Prêt à ajouter la location de voitures à votre application ? 🎉

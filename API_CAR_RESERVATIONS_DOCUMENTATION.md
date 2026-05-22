# 📚 Documentation API - Réservations de Voitures

## 🚗 Base URL
```
http://localhost:5000/api/car-reservations
```

---

## 📋 Endpoints

### 1️⃣ **POST /api/car-reservations** - Créer une réservation
Crée une nouvelle réservation de voiture.

**Méthode** : `POST`
**Authentification** : ✅ Requise (token JWT)

**Headers** :
```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

**Corps de la requête** :
```json
{
  "car_id": 1,
  "date_debut": "2024-06-01",
  "date_fin": "2024-06-05",
  "nb_jours": 5,
  "prix_total": 425.50,
  "message": "Je vais faire un voyage en famille"
}
```

**Champs obligatoires** :
- `car_id` (number) : ID de la voiture
- `date_debut` (string, format: YYYY-MM-DD) : Date de début
- `date_fin` (string, format: YYYY-MM-DD) : Date de fin
- `nb_jours` (number) : Nombre de jours
- `prix_total` (number) : Prix total

**Champs optionnels** :
- `message` (string) : Message/note du client

**Exemple de requête** :
```bash
curl -X POST http://localhost:5000/api/car-reservations \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "car_id": 1,
    "date_debut": "2024-06-01",
    "date_fin": "2024-06-05",
    "nb_jours": 5,
    "prix_total": 425.50,
    "message": "Je vais faire un voyage en famille"
  }'
```

**Réponse réussie (201)** :
```json
{
  "success": true,
  "message": "Réservation créée avec succès.",
  "data": {
    "id": 1
  }
}
```

**Erreur (400)** :
```json
{
  "success": false,
  "message": "Veuillez fournir tous les champs obligatoires (car_id, date_debut, date_fin, nb_jours, prix_total)."
}
```

**Erreur (409 - Conflit)** :
```json
{
  "success": false,
  "message": "Cette voiture n'est pas disponible pour les dates sélectionnées."
}
```

---

### 2️⃣ **GET /api/car-reservations** - Mes réservations
Récupère les réservations de l'utilisateur connecté avec pagination.

**Méthode** : `GET`
**Authentification** : ✅ Requise (token JWT)

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
GET /api/car-reservations?page=1&limit=10
Authorization: Bearer YOUR_JWT_TOKEN
```

**Réponse réussie (200)** :
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "car_id": 1,
      "user_id": 5,
      "date_debut": "2024-06-01",
      "date_fin": "2024-06-05",
      "nb_jours": 5,
      "prix_total": 425.50,
      "statut": "en_attente",
      "message": "Je vais faire un voyage en famille",
      "note_admin": null,
      "marque": "Toyota",
      "modele": "Prius",
      "annee": 2023,
      "couleur": "Blanc",
      "photo_principale": "http://localhost:5000/uploads/cars/photo1.jpg",
      "created_at": "2024-05-22T10:30:00Z",
      "updated_at": "2024-05-22T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10
  }
}
```

---

### 3️⃣ **GET /api/car-reservations/:id** - Détail d'une réservation
Récupère les détails d'une réservation (client ou admin peut voir).

**Méthode** : `GET`
**Authentification** : ✅ Requise (token JWT)

**Headers** :
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Paramètres URL** :
- `id` (number) : ID de la réservation

**Exemple de requête** :
```bash
GET /api/car-reservations/1
Authorization: Bearer YOUR_JWT_TOKEN
```

**Réponse réussie (200)** :
```json
{
  "success": true,
  "data": {
    "id": 1,
    "car_id": 1,
    "user_id": 5,
    "date_debut": "2024-06-01",
    "date_fin": "2024-06-05",
    "nb_jours": 5,
    "prix_total": 425.50,
    "statut": "en_attente",
    "message": "Je vais faire un voyage en famille",
    "note_admin": null,
    "marque": "Toyota",
    "modele": "Prius",
    "annee": 2023,
    "couleur": "Blanc",
    "plaque_immatriculation": "ABC-123-XY",
    "description": "Voiture écologique et économique",
    "nom": "Dupont",
    "prenom": "Jean",
    "email": "jean@example.com",
    "telephone": "06 12 34 56 78",
    "photo_principale": "http://localhost:5000/uploads/cars/photo1.jpg",
    "created_at": "2024-05-22T10:30:00Z",
    "updated_at": "2024-05-22T10:30:00Z"
  }
}
```

**Erreur (404)** :
```json
{
  "success": false,
  "message": "Réservation introuvable."
}
```

**Erreur (403)** :
```json
{
  "success": false,
  "message": "Accès refusé."
}
```

---

### 4️⃣ **GET /api/car-reservations/admin/all** - Toutes les réservations (admin)
Récupère toutes les réservations pour l'administration avec filtres.

**Méthode** : `GET`
**Authentification** : ✅ Requise (token JWT + rôle admin)

**Headers** :
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Paramètres de requête** :
```
- car_id (number) : Filtrer par ID de voiture
- statut (string) : Filtrer par statut (en_attente, confirme, refuse, annule)
- page (number) : Numéro de la page (défaut: 1)
- limit (number) : Nombre de résultats par page (défaut: 50)
```

**Exemple de requête** :
```bash
GET /api/car-reservations/admin/all?statut=en_attente&page=1&limit=20
Authorization: Bearer YOUR_JWT_TOKEN
```

**Réponse réussie (200)** :
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "car_id": 1,
      "user_id": 5,
      "date_debut": "2024-06-01",
      "date_fin": "2024-06-05",
      "nb_jours": 5,
      "prix_total": 425.50,
      "statut": "en_attente",
      "message": "Je vais faire un voyage en famille",
      "note_admin": null,
      "marque": "Toyota",
      "modele": "Prius",
      "nom": "Dupont",
      "prenom": "Jean",
      "email": "jean@example.com",
      "created_at": "2024-05-22T10:30:00Z",
      "updated_at": "2024-05-22T10:30:00Z"
    }
  ],
  "pagination": {
    "total": 45,
    "page": 1,
    "limit": 20,
    "total_pages": 3
  }
}
```

---

### 5️⃣ **PATCH /api/car-reservations/:id/status** - Mettre à jour le statut (admin)
Met à jour le statut d'une réservation avec une note optionnelle.

**Méthode** : `PATCH`
**Authentification** : ✅ Requise (token JWT + rôle admin)

**Headers** :
```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

**Paramètres URL** :
- `id` (number) : ID de la réservation

**Corps de la requête** :
```json
{
  "statut": "confirme",
  "note_admin": "Réservation confirmée, permis de conduire validé"
}
```

**Statuts acceptés** :
- `en_attente` : En attente de confirmation
- `confirme` : Réservation confirmée
- `refuse` : Réservation refusée
- `annule` : Réservation annulée

**Champs** :
- `statut` (string) : Nouveau statut
- `note_admin` (string, optionnel) : Note/commentaire admin

**Exemple de requête** :
```bash
curl -X PATCH http://localhost:5000/api/car-reservations/1/status \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "statut": "confirme",
    "note_admin": "Réservation confirmée, permis de conduire validé"
  }'
```

**Réponse réussie (200)** :
```json
{
  "success": true,
  "message": "Statut de la réservation mise à jour.",
  "data": {
    "id": 1
  }
}
```

**Erreur (400)** :
```json
{
  "success": false,
  "message": "Statut invalide. Utilisez: en_attente, confirme, refuse, annule"
}
```

**Erreur (404)** :
```json
{
  "success": false,
  "message": "Réservation introuvable."
}
```

---

### 6️⃣ **DELETE /api/car-reservations/:id** - Annuler une réservation
Annule/supprime une réservation (client ou admin).

**Méthode** : `DELETE`
**Authentification** : ✅ Requise (token JWT)

**Headers** :
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Paramètres URL** :
- `id` (number) : ID de la réservation

**Exemple de requête** :
```bash
curl -X DELETE http://localhost:5000/api/car-reservations/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Réponse réussie (200)** :
```json
{
  "success": true,
  "message": "Réservation annulée."
}
```

**Erreur (404)** :
```json
{
  "success": false,
  "message": "Réservation introuvable."
}
```

**Erreur (403)** :
```json
{
  "success": false,
  "message": "Accès refusé."
}
```

---

## 🔑 Authentification

Tous les endpoints nécessitent un **JWT Token** dans l'en-tête `Authorization` :

```
Authorization: Bearer YOUR_JWT_TOKEN
```

### Obtenir un token
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
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

---

## 📊 Statuts des réservations

| Statut | Description |
|--------|-------------|
| `en_attente` | Réservation en cours de traitement |
| `confirme` | Réservation confirmée et approuvée |
| `refuse` | Réservation refusée par l'admin |
| `annule` | Réservation annulée par le client ou l'admin |

---

## 🔍 Filtres et Recherche

### Filtrer les réservations en attente :
```
GET /api/car-reservations/admin/all?statut=en_attente
```

### Filtrer par voiture :
```
GET /api/car-reservations/admin/all?car_id=1
```

### Combinaison de filtres :
```
GET /api/car-reservations/admin/all?car_id=1&statut=confirme&page=1&limit=20
```

---

## ❌ Codes d'erreur

| Code | Message | Description |
|------|---------|-------------|
| 200 | OK | Requête réussie |
| 201 | Created | Réservation créée |
| 400 | Bad Request | Champs invalides ou manquants |
| 403 | Forbidden | Accès refusé |
| 404 | Not Found | Réservation non trouvée |
| 409 | Conflict | Voiture non disponible pour les dates |
| 401 | Unauthorized | Token manquant ou invalide |
| 500 | Internal Server Error | Erreur serveur |

---

## 📌 Notes importantes

- ✅ Les clients **ne voient que leurs propres réservations** sauf s'ils sont admin
- ✅ Les réservations sont créées avec le statut **"en_attente"** par défaut
- ✅ Le système vérifie automatiquement la **disponibilité** de la voiture
- ✅ Les dates de fin doivent être **après les dates de début**
- ✅ Un client peut **annuler sa réservation** à tout moment
- ✅ Un admin peut modifier le **statut** de n'importe quelle réservation

---

## 🚀 Flux de réservation typique

1. **Client** crée une réservation
   ```bash
   POST /api/car-reservations
   ```

2. **Admin** reçoit la réservation
   - Vérifie les informations
   - Valide la réservation
   ```bash
   PATCH /api/car-reservations/:id/status
   {"statut": "confirme", "note_admin": "Validée"}
   ```

3. **Client** reçoit la confirmation et peut consulter ses réservations
   ```bash
   GET /api/car-reservations
   ```

4. Après la date limite, les réservations peuvent être annulées
   ```bash
   DELETE /api/car-reservations/:id
   ```

---

## 🔗 Endpoints associés

- **Voitures** : [API_CARS_DOCUMENTATION.md](./API_CARS_DOCUMENTATION.md)
- **Authentification** : `/api/auth/login`

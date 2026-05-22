// EXEMPLES D'INTÉGRATION FRONTEND - Location de Voitures

/**
 * Ce fichier contient des exemples pour intégrer les API 
 * de location de voitures dans votre frontend
 */

// ============================================================
// 1. CONFIGURATION DE BASE
// ============================================================

const BASE_URL = 'http://localhost:5000/api';

// Récupérer le token depuis localStorage
function getToken() {
  return localStorage.getItem('authToken');
}

// Fonction helper pour les appels API
async function apiCall(method, endpoint, data = null) {
  const headers = {
    'Content-Type': 'application/json',
  };

  // Ajouter le token si disponible
  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const options = {
    method,
    headers,
  };

  if (data) {
    options.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, options);
    const json = await response.json();

    if (!response.ok) {
      throw new Error(json.message || `Erreur ${response.status}`);
    }

    return json;
  } catch (error) {
    console.error('Erreur API:', error);
    throw error;
  }
}

// ============================================================
// 2. GESTION DES VOITURES
// ============================================================

// Récupérer la liste des voitures publiées
async function getVoitures(filtres = {}) {
  const params = new URLSearchParams();
  
  if (filtres.marque) params.append('marque', filtres.marque);
  if (filtres.modele) params.append('modele', filtres.modele);
  if (filtres.type_carburant) params.append('type_carburant', filtres.type_carburant);
  if (filtres.prix_min) params.append('prix_min', filtres.prix_min);
  if (filtres.prix_max) params.append('prix_max', filtres.prix_max);
  if (filtres.transmission) params.append('transmission', filtres.transmission);
  if (filtres.page) params.append('page', filtres.page);
  if (filtres.limit) params.append('limit', filtres.limit);

  const queryString = params.toString();
  const endpoint = queryString ? `/cars?${queryString}` : '/cars';

  return apiCall('GET', endpoint);
}

// Helper pour FormData (upload de fichiers)
async function apiCallFormData(method, endpoint, formData) {
  const headers = {};
  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const options = {
    method,
    headers,
    body: formData,
  };

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, options);
    const json = await response.json();

    if (!response.ok) {
      throw new Error(json.message || `Erreur ${response.status}`);
    }

    return json;
  } catch (error) {
    console.error('Erreur API:', error);
    throw error;
  }
}

// Exemple d'utilisation
async function afficherVoitures() {
  try {
    const result = await getVoitures({
      marque: 'Toyota',
      prix_max: 150,
      page: 1,
      limit: 12,
    });

    console.log('Voitures trouvées:', result.data);
    console.log('Pagination:', result.pagination);

    // Afficher les voitures dans le DOM
    result.data.forEach(car => {
      console.log(`${car.marque} ${car.modele} - ${car.prix_par_jour}€/jour`);
    });
  } catch (error) {
    console.error('Erreur lors du chargement des voitures:', error);
  }
}

// ============================================================
// 3. DÉTAIL D'UNE VOITURE
// ============================================================

// Récupérer le détail d'une voiture avec ses photos
async function getVoitureDetail(id) {
  return apiCall('GET', `/cars/${id}`);
}

// Exemple d'utilisation
async function afficherDetailVoiture(id) {
  try {
    const result = await getVoitureDetail(id);
    const car = result.data;

    console.log('Voiture détail:', {
      nom: `${car.marque} ${car.modele}`,
      prix: `${car.prix_par_jour}€/jour`,
      description: car.description,
      options: {
        climatise: car.climatise ? '✅' : '❌',
        wifi: car.wifi ? '✅' : '❌',
        cruise_control: car.cruise_control ? '✅' : '❌',
        siege_chauffant: car.siege_chauffant ? '✅' : '❌',
        toit_panoramique: car.toit_panoramique ? '✅' : '❌',
      },
      images: car.images,
    });
  } catch (error) {
    console.error('Erreur lors du chargement du détail:', error);
  }
}

// ============================================================
// 4. CRÉER UNE RÉSERVATION
// ============================================================

// Créer une nouvelle réservation
async function creerReservation(reservation) {
  return apiCall('POST', '/car-reservations', {
    car_id: reservation.carId,
    date_debut: reservation.dateDebut,
    date_fin: reservation.dateFin,
    nb_jours: reservation.nbJours,
    prix_total: reservation.prixTotal,
    message: reservation.message || '',
  });
}

// Exemple d'utilisation - Formulaire de réservation
async function traiterFormulairReservation(formData) {
  try {
    // Vérifier l'authentification
    if (!getToken()) {
      alert('Veuillez vous connecter pour réserver');
      return;
    }

    // Calculer les dates et le nombre de jours
    const dateDebut = new Date(formData.dateDebut);
    const dateFin = new Date(formData.dateFin);
    const nbJours = Math.ceil((dateFin - dateDebut) / (1000 * 60 * 60 * 24));

    // Calculer le prix total
    const prixParJour = formData.prixParJour;
    const prixTotal = prixParJour * nbJours;

    // Créer la réservation
    const result = await creerReservation({
      carId: formData.carId,
      dateDebut: formData.dateDebut,
      dateFin: formData.dateFin,
      nbJours: nbJours,
      prixTotal: prixTotal,
      message: formData.message,
    });

    console.log('Réservation créée:', result);
    alert(`Réservation créée ! ID: ${result.data.id}`);
    return result.data;
  } catch (error) {
    console.error('Erreur lors de la création de la réservation:', error);
    alert(`Erreur: ${error.message}`);
  }
}

// ============================================================
// 5. AFFICHER MES RÉSERVATIONS
// ============================================================

// Récupérer les réservations de l'utilisateur
async function getMesReservations(page = 1, limit = 10) {
  return apiCall('GET', `/car-reservations?page=${page}&limit=${limit}`);
}

// Exemple d'utilisation
async function afficherMesReservations() {
  try {
    if (!getToken()) {
      console.log('Non connecté');
      return;
    }

    const result = await getMesReservations();
    console.log('Mes réservations:', result.data);

    result.data.forEach(reservation => {
      console.log(`
        Réservation #${reservation.id}
        ${reservation.marque} ${reservation.modele}
        Du ${reservation.date_debut} au ${reservation.date_fin}
        Statut: ${reservation.statut}
        Prix: ${reservation.prix_total}€
      `);
    });
  } catch (error) {
    console.error('Erreur:', error);
  }
}

// ============================================================
// 6. DÉTAIL D'UNE RÉSERVATION
// ============================================================

// Récupérer le détail d'une réservation
async function getReservationDetail(id) {
  return apiCall('GET', `/car-reservations/${id}`);
}

// ============================================================
// 7. ANNULER UNE RÉSERVATION
// ============================================================

// Annuler une réservation
async function annulerReservation(id) {
  return apiCall('DELETE', `/car-reservations/${id}`);
}

// Exemple d'utilisation
async function traiterAnnulation(reservationId) {
  try {
    if (confirm('Êtes-vous sûr de vouloir annuler cette réservation ?')) {
      const result = await annulerReservation(reservationId);
      console.log('Réservation annulée:', result);
      alert('Réservation annulée avec succès');
    }
  } catch (error) {
    console.error('Erreur lors de l\'annulation:', error);
    alert(`Erreur: ${error.message}`);
  }
}

// ============================================================
// 8. ADMIN - CRÉER UNE VOITURE
// ============================================================

// Créer une nouvelle voiture (admin)
async function creerVoiture(voiture) {
  return apiCall('POST', '/cars', {
    marque: voiture.marque,
    modele: voiture.modele,
    annee: voiture.annee,
    type_carburant: voiture.typeCarburant,
    transmission: voiture.transmission,
    nb_places: voiture.nbPlaces,
    couleur: voiture.couleur,
    plaque_immatriculation: voiture.plaqueImmatriculation,
    prix_par_jour: voiture.prixParJour,
    description: voiture.description,
    climatise: voiture.climatise || false,
    wifi: voiture.wifi || false,
    cruise_control: voiture.cruiseControl || false,
    siege_chauffant: voiture.siegeChiauffant || false,
    toit_panoramique: voiture.toitPanoramique || false,
  });
}

// Exemple d'utilisation
async function traiterFormulairCreationVoiture(formData) {
  try {
    if (!getToken()) {
      alert('Authentification requise');
      return;
    }

    const result = await creerVoiture({
      marque: formData.marque,
      modele: formData.modele,
      annee: parseInt(formData.annee),
      typeCarburant: formData.typeCarburant,
      transmission: formData.transmission,
      nbPlaces: parseInt(formData.nbPlaces),
      couleur: formData.couleur,
      plaqueImmatriculation: formData.plaqueImmatriculation,
      prixParJour: parseFloat(formData.prixParJour),
      description: formData.description,
      climatise: formData.climatise === 'on',
      wifi: formData.wifi === 'on',
      cruiseControl: formData.cruiseControl === 'on',
      siegeChiauffant: formData.siegeChiauffant === 'on',
      toitPanoramique: formData.toitPanoramique === 'on',
    });

    console.log('Voiture créée:', result);
    alert(`Voiture créée ! ID: ${result.data.id}`);
    return result.data;
  } catch (error) {
    console.error('Erreur lors de la création:', error);
    alert(`Erreur: ${error.message}`);
  }
}

// ============================================================
// 8.1 ADMIN - UPLOAD PHOTO VOITURE
// ============================================================

// Uploader des images pour une voiture (admin)
async function uploadCarImages(carId, files, options = {}) {
  const formData = new FormData();

  if (Array.isArray(files)) {
    files.forEach((file) => formData.append('images', file));
  } else if (files) {
    formData.append('image', files);
  }

  if (options.est_principale !== undefined) {
    formData.append('est_principale', options.est_principale ? 'true' : 'false');
  }
  if (options.photo_principale_index !== undefined) {
    formData.append('photo_principale_index', String(options.photo_principale_index));
  }

  return apiCallFormData('POST', `/upload/car/${carId}`, formData);
}

// Sélectionner une image principale pour une voiture (admin)
async function setCarPrimaryImage(imageId) {
  return apiCall('PATCH', `/upload/car/image/${imageId}/primary`, {});
}

// Supprimer une image de voiture (admin)
async function deleteCarImage(imageId) {
  return apiCall('DELETE', `/upload/car/image/${imageId}`);
}

// Exemple d'utilisation - formulaire d'upload
async function traiterUploadImagesVoiture(carId, fileInput, options = {}) {
  try {
    if (!getToken()) {
      alert('Authentification requise');
      return;
    }

    const files = Array.from(fileInput.files);
    if (files.length === 0) {
      alert('Sélectionnez au moins une image.');
      return;
    }

    const result = await uploadCarImages(carId, files, options);
    console.log('Images uploadées:', result.data);
    alert(`Images uploadées : ${result.data.length}`);
    return result.data;
  } catch (error) {
    console.error('Erreur lors de l\'upload :', error);
    alert(`Erreur: ${error.message}`);
  }
}

// Exemple d'HTML à utiliser dans un formulaire :
// <input type="file" id="carImages" name="images" multiple accept="image/*" />
// <button onclick="handleUploadCarImages()">Uploader</button>
// function handleUploadCarImages() {
//   const input = document.getElementById('carImages');
//   traiterUploadImagesVoiture(1, input, { est_principale: true, photo_principale_index: 0 });
// }

// ============================================================
// 9. ADMIN - MODIFIER UNE VOITURE
// ============================================================

// Modifier une voiture (admin)
async function modifierVoiture(id, updates) {
  return apiCall('PUT', `/cars/${id}`, updates);
}

// Exemple d'utilisation
async function traiterModificationVoiture(id, formData) {
  try {
    const result = await modifierVoiture(id, {
      prix_par_jour: parseFloat(formData.prixParJour),
      couleur: formData.couleur,
      // Ajouter d'autres champs selon vos besoins
    });

    console.log('Voiture modifiée:', result);
    alert('Voiture modifiée avec succès');
  } catch (error) {
    console.error('Erreur lors de la modification:', error);
    alert(`Erreur: ${error.message}`);
  }
}

// ============================================================
// 10. ADMIN - PUBLIER UNE VOITURE
// ============================================================

// Publier ou dépublier une voiture
async function publierVoiture(id, estPublie) {
  return apiCall('PATCH', `/cars/${id}/publish`, {
    est_publie: estPublie,
  });
}

// Exemple d'utilisation
async function togglePublicationVoiture(id, estActuellementPublie) {
  try {
    const result = await publierVoiture(id, !estActuellementPublie);
    console.log('Statut de publication modifié:', result);
    alert(`Voiture ${!estActuellementPublie ? 'publiée' : 'dépubliée'}`);
  } catch (error) {
    console.error('Erreur:', error);
    alert(`Erreur: ${error.message}`);
  }
}

// ============================================================
// 11. ADMIN - SUPPRIMER UNE VOITURE
// ============================================================

// Supprimer une voiture
async function supprimerVoiture(id) {
  return apiCall('DELETE', `/cars/${id}`);
}

// Exemple d'utilisation
async function traiterSuppressionVoiture(id) {
  try {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette voiture ?')) {
      const result = await supprimerVoiture(id);
      console.log('Voiture supprimée:', result);
      alert('Voiture supprimée avec succès');
    }
  } catch (error) {
    console.error('Erreur lors de la suppression:', error);
    alert(`Erreur: ${error.message}`);
  }
}

// ============================================================
// 12. ADMIN - LISTER TOUTES LES RÉSERVATIONS
// ============================================================

// Lister toutes les réservations (admin)
async function getToutesReservations(filtres = {}) {
  let endpoint = '/car-reservations/admin/all?';
  
  if (filtres.statut) endpoint += `statut=${filtres.statut}&`;
  if (filtres.carId) endpoint += `car_id=${filtres.carId}&`;
  if (filtres.page) endpoint += `page=${filtres.page}&`;
  if (filtres.limit) endpoint += `limit=${filtres.limit}&`;

  // Supprimer le dernier &
  endpoint = endpoint.slice(0, -1);

  return apiCall('GET', endpoint);
}

// Exemple d'utilisation
async function afficherToutesReservations() {
  try {
    const result = await getToutesReservations({
      statut: 'en_attente',
      page: 1,
      limit: 20,
    });

    console.log('Toutes les réservations:', result.data);
    result.data.forEach(resa => {
      console.log(`
        #${resa.id} - ${resa.nom} ${resa.prenom}
        ${resa.marque} ${resa.modele}
        ${resa.date_debut} -> ${resa.date_fin}
        Statut: ${resa.statut}
      `);
    });
  } catch (error) {
    console.error('Erreur:', error);
  }
}

// ============================================================
// 13. ADMIN - CHANGER LE STATUT D'UNE RÉSERVATION
// ============================================================

// Mettre à jour le statut d'une réservation
async function changerStatutReservation(id, statut, noteAdmin = '') {
  return apiCall('PATCH', `/car-reservations/${id}/status`, {
    statut: statut,
    note_admin: noteAdmin,
  });
}

// Exemple d'utilisation
async function confirmerReservation(id) {
  try {
    const result = await changerStatutReservation(
      id,
      'confirme',
      'Réservation confirmée, permis validé'
    );
    console.log('Réservation confirmée:', result);
    alert('Réservation confirmée');
  } catch (error) {
    console.error('Erreur:', error);
    alert(`Erreur: ${error.message}`);
  }
}

// Refuser une réservation
async function refuserReservation(id, raison) {
  try {
    const result = await changerStatutReservation(id, 'refuse', raison);
    console.log('Réservation refusée:', result);
    alert('Réservation refusée');
  } catch (error) {
    console.error('Erreur:', error);
  }
}

// ============================================================
// EXPORTS (si vous utilisez les modules)
// ============================================================

// export {
//   getVoitures,
//   getVoitureDetail,
//   creerReservation,
//   getMesReservations,
//   getReservationDetail,
//   annulerReservation,
//   creerVoiture,
//   modifierVoiture,
//   publierVoiture,
//   supprimerVoiture,
//   getToutesReservations,
//   changerStatutReservation,
// };

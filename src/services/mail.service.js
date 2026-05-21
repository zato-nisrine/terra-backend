// src/services/mail.service.js
// Envoi d'e-mails (confirmation / refus de réservation)

const nodemailer = require('nodemailer');

let transporter = null;

const isConfigured = () =>
  Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);

const getTransporter = () => {
  if (!isConfigured()) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host:   process.env.SMTP_HOST,
      port:   Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return transporter;
};

const formatDate = (value) => {
  if (!value) return null;
  try {
    return new Date(value).toLocaleDateString('fr-FR', {
      weekday: 'long',
      day:     'numeric',
      month:   'long',
      year:    'numeric',
    });
  } catch {
    return String(value);
  }
};

const buildReservationEmail = (reservation, statut) => {
  const typeLabel =
    reservation.type === 'visite' ? 'demande de visite' : 'demande de réservation';
  const logement = reservation.logement_titre || 'votre logement';
  const clientName = [reservation.client_prenom, reservation.client_nom]
    .filter(Boolean)
    .join(' ')
    .trim() || 'Bonjour';

  if (statut === 'confirme') {
    const dateLine = reservation.date_souhaitee
      ? `<p><strong>Date souhaitée :</strong> ${formatDate(reservation.date_souhaitee)}</p>`
      : '';

    return {
      subject: `Terra — Votre ${typeLabel} est confirmée`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:560px;color:#1c1917">
          <h2 style="color:#b45309">Bonne nouvelle !</h2>
          <p>${clientName},</p>
          <p>Votre <strong>${typeLabel}</strong> pour le logement
             <strong>${logement}</strong> a été <strong>confirmée</strong> par notre équipe.</p>
          ${dateLine}
          ${reservation.note_admin ? `<p><strong>Message de l'équipe :</strong><br>${reservation.note_admin}</p>` : ''}
          <p>Connectez-vous sur Terra pour consulter le détail dans « Mes réservations ».</p>
          <p style="color:#78716c;font-size:13px">— L'équipe Terra</p>
        </div>
      `,
    };
  }

  if (statut === 'refuse') {
    return {
      subject: `Terra — Mise à jour de votre ${typeLabel}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:560px;color:#1c1917">
          <h2 style="color:#b45309">Mise à jour de votre demande</h2>
          <p>${clientName},</p>
          <p>Votre <strong>${typeLabel}</strong> pour le logement
             <strong>${logement}</strong> n'a pas pu être acceptée pour le moment.</p>
          ${reservation.note_admin ? `<p><strong>Message de l'équipe :</strong><br>${reservation.note_admin}</p>` : ''}
          <p>N'hésitez pas à nous contacter ou à consulter d'autres logements sur Terra.</p>
          <p style="color:#78716c;font-size:13px">— L'équipe Terra</p>
        </div>
      `,
    };
  }

  return null;
};

const sendReservationStatusEmail = async (reservation, statut) => {
  const content = buildReservationEmail(reservation, statut);
  if (!content) return { sent: false, reason: 'statut_non_notifie' };

  const to = reservation.client_email;
  if (!to) {
    console.warn('⚠️ Email client manquant — notification non envoyée.');
    return { sent: false, reason: 'email_manquant' };
  }

  const transport = getTransporter();
  if (!transport) {
    console.warn(
      '⚠️ SMTP non configuré (SMTP_HOST, SMTP_USER, SMTP_PASS) — email non envoyé à',
      to
    );
    return { sent: false, reason: 'smtp_non_configure' };
  }

  const from = process.env.MAIL_FROM || process.env.SMTP_USER;

  await transport.sendMail({
    from:    `"Terra" <${from}>`,
    to,
    subject: content.subject,
    html:    content.html,
  });

  console.log(`✉️ Notification envoyée à ${to} (${statut})`);
  return { sent: true };
};

module.exports = {
  isConfigured,
  sendReservationStatusEmail,
};

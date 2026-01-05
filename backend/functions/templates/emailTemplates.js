const { companyInfo } = require("../config/emailConfig");

// ============================================
// HEADER COMMUN
// ============================================
const emailHeader = `
  <div style="background: linear-gradient(135deg, #18181b 0%, #27272a 100%); border-radius: 16px 16px 0 0; padding: 40px 30px; text-align: center;">
    <h1 style="margin: 0; font-size: 32px;">
      <span style="color: #22c55e;">Green</span><span style="color: #ffffff;">RoadServices</span>
    </h1>
    <p style="color: #a1a1aa; margin: 10px 0 0 0; font-size: 14px;">Votre chauffeur privé VTC premium</p>
  </div>
`;

// ============================================
// FOOTER COMMUN
// ============================================
const emailFooter = `
  <div style="text-align: center; padding: 30px 20px;">
    <p style="font-size: 14px; color: #52525b; margin: 0 0 15px 0;">
      <strong>L'équipe Green Road Services</strong>
    </p>
    <p style="font-size: 13px; color: #a1a1aa; margin: 0; line-height: 1.8;">
      📞 ${companyInfo.phone}<br>
      📧 ${companyInfo.email}<br>
      📍 ${companyInfo.address}
    </p>
    <div style="margin-top: 20px;">
      <a href="${companyInfo.website}" style="display: inline-block; background-color: #18181b; color: #ffffff; text-decoration: none; padding: 10px 25px; border-radius: 6px; font-size: 13px;">
        Visiter notre site
      </a>
    </div>
  </div>
`;

// ============================================
// WRAPPER HTML
// ============================================
const wrapEmail = (content) => `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
  </head>
  <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
    <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
      ${emailHeader}
      <div style="background-color: #ffffff; padding: 40px 30px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        ${content}
      </div>
      ${emailFooter}
    </div>
  </body>
  </html>
`;

// ============================================
// BOUTON CTA
// ============================================
const ctaButton = (text, link, color = "#22c55e") => `
  <div style="text-align: center; margin: 35px 0;">
    <a href="${link}" style="display: inline-block; background-color: ${color}; color: #ffffff; text-decoration: none; padding: 16px 50px; border-radius: 10px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 14px rgba(34, 197, 94, 0.4);">
      ${text}
    </a>
  </div>
`;

// ============================================
// TEMPLATE: EMAIL DE VÉRIFICATION
// ============================================
const verificationEmailTemplate = (name, verificationLink) => {
  const content = `
    <p style="font-size: 18px; color: #18181b; margin: 0 0 20px 0;">
      Bonjour <strong>${name}</strong>,
    </p>
    
    <p style="font-size: 16px; color: #52525b; line-height: 1.6; margin: 0 0 20px 0;">
      Merci de vous être inscrit sur <strong style="color: #22c55e;">Green Road Services</strong>, votre service de chauffeur privé VTC premium à Reims et en Champagne.
    </p>
    
    <p style="font-size: 16px; color: #52525b; line-height: 1.6; margin: 0 0 30px 0;">
      Pour activer votre compte et commencer à réserver vos courses, veuillez confirmer votre adresse email en cliquant sur le bouton ci-dessous :
    </p>
    
    ${ctaButton("✓ Confirmer mon adresse email", verificationLink)}
    
    <p style="font-size: 13px; color: #a1a1aa; line-height: 1.5; margin: 30px 0 0 0;">
      Ou copiez ce lien dans votre navigateur :<br>
      <a href="${verificationLink}" style="color: #22c55e; word-break: break-all;">${verificationLink}</a>
    </p>
    
    <hr style="border: none; border-top: 1px solid #e4e4e7; margin: 30px 0;">
    
    <p style="font-size: 13px; color: #a1a1aa; margin: 0;">
      Si vous n'avez pas créé de compte sur notre site, vous pouvez ignorer cet email.
    </p>
  `;

  return wrapEmail(content);
};

// ============================================
// TEMPLATE: RENVOI EMAIL DE VÉRIFICATION
// ============================================
const resendVerificationEmailTemplate = (name, verificationLink) => {
  const content = `
    <p style="font-size: 18px; color: #18181b; margin: 0 0 20px 0;">
      Bonjour <strong>${name}</strong>,
    </p>
    
    <p style="font-size: 16px; color: #52525b; line-height: 1.6; margin: 0 0 20px 0;">
      Vous avez demandé un nouvel email de confirmation pour votre compte <strong style="color: #22c55e;">Green Road Services</strong>.
    </p>
    
    <p style="font-size: 16px; color: #52525b; line-height: 1.6; margin: 0 0 30px 0;">
      Cliquez sur le bouton ci-dessous pour confirmer votre adresse email :
    </p>
    
    ${ctaButton("✓ Confirmer mon adresse email", verificationLink)}
    
    <p style="font-size: 13px; color: #a1a1aa; line-height: 1.5; margin: 30px 0 0 0;">
      Ou copiez ce lien dans votre navigateur :<br>
      <a href="${verificationLink}" style="color: #22c55e; word-break: break-all;">${verificationLink}</a>
    </p>
    
    <hr style="border: none; border-top: 1px solid #e4e4e7; margin: 30px 0;">
    
    <p style="font-size: 13px; color: #a1a1aa; margin: 0;">
      Si vous n'avez pas fait cette demande, vous pouvez ignorer cet email.
    </p>
  `;

  return wrapEmail(content);
};

// ============================================
// TEMPLATE: RÉINITIALISATION MOT DE PASSE
// ============================================
const passwordResetEmailTemplate = (name, resetLink) => {
  const content = `
    <p style="font-size: 18px; color: #18181b; margin: 0 0 20px 0;">
      Bonjour <strong>${name}</strong>,
    </p>
    
    <p style="font-size: 16px; color: #52525b; line-height: 1.6; margin: 0 0 20px 0;">
      Vous avez demandé la réinitialisation de votre mot de passe pour votre compte <strong style="color: #22c55e;">Green Road Services</strong>.
    </p>
    
    <p style="font-size: 16px; color: #52525b; line-height: 1.6; margin: 0 0 30px 0;">
      Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe :
    </p>
    
    ${ctaButton("🔐 Réinitialiser mon mot de passe", resetLink, "#3b82f6")}
    
    <p style="font-size: 13px; color: #a1a1aa; line-height: 1.5; margin: 30px 0 0 0;">
      Ou copiez ce lien dans votre navigateur :<br>
      <a href="${resetLink}" style="color: #3b82f6; word-break: break-all;">${resetLink}</a>
    </p>
    
    <hr style="border: none; border-top: 1px solid #e4e4e7; margin: 30px 0;">
    
    <p style="font-size: 13px; color: #a1a1aa; margin: 0;">
      Ce lien expire dans 1 heure. Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.
    </p>
  `;

  return wrapEmail(content);
};

// ============================================
// TEMPLATE: BIENVENUE (après vérification)
// ============================================
const welcomeEmailTemplate = (name) => {
  const content = `
    <div style="text-align: center; margin-bottom: 30px;">
      <span style="font-size: 60px;">🎉</span>
    </div>
    
    <p style="font-size: 18px; color: #18181b; margin: 0 0 20px 0; text-align: center;">
      Bienvenue <strong>${name}</strong> !
    </p>
    
    <p style="font-size: 16px; color: #52525b; line-height: 1.6; margin: 0 0 20px 0; text-align: center;">
      Votre compte <strong style="color: #22c55e;">Green Road Services</strong> est maintenant actif !
    </p>
    
    <p style="font-size: 16px; color: #52525b; line-height: 1.6; margin: 0 0 30px 0;">
      Vous pouvez dès maintenant profiter de nos services :
    </p>
    
    <ul style="font-size: 15px; color: #52525b; line-height: 2; padding-left: 20px;">
      <li>✈️ Transferts aéroports (CDG, Orly, Beauvais)</li>
      <li>🚄 Transferts gares TGV</li>
      <li>🍾 Circuits découverte Champagne</li>
      <li>💒 Transport mariages et événements</li>
      <li>🚗 Mise à disposition horaire</li>
    </ul>
    
    ${ctaButton("Réserver une course", `${companyInfo.website}/booking`)}
    
    <hr style="border: none; border-top: 1px solid #e4e4e7; margin: 30px 0;">
    
    <p style="font-size: 13px; color: #a1a1aa; margin: 0; text-align: center;">
      Une question ? Contactez-nous au ${companyInfo.phone}
    </p>
  `;

  return wrapEmail(content);
};

// ============================================
// TEMPLATE: NOTIFICATION NOUVELLE COURSE (pour le chauffeur)
// ============================================
const newBookingNotificationTemplate = (booking) => {
  const {
    clientName,
    phone,
    email,
    pickup,
    dropoff,
    datetime,
    passengers,
    prix,
    kilometers,
    bookingId,
    type = "course",
    forfaitNom = null,
    allerRetour = false,
  } = booking;

  // Formater la date
  const dateObj = new Date(datetime);
  const dateFormatted = dateObj.toLocaleDateString("fr-FR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const timeFormatted = dateObj.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  // Titre selon le type
  const title =
    type === "forfait"
      ? "Nouvelle réservation forfait !"
      : type === "miseAdisposition"
      ? "Nouvelle demande de mise à disposition !"
      : "Nouvelle demande de course !";

  const emoji =
    type === "forfait" ? "🎫" : type === "miseAdisposition" ? "⏱️" : "🚗";

  const content = `
    <div style="text-align: center; margin-bottom: 30px;">
      <span style="font-size: 60px;">${emoji}</span>
      <h2 style="color: #22c55e; margin: 10px 0;">${title}</h2>
      ${
        type === "forfait" && forfaitNom
          ? `<p style="color: #71717a; margin: 0;">Forfait : <strong>${forfaitNom}</strong></p>`
          : ""
      }
      ${
        allerRetour
          ? `<p style="background-color: #fef3c7; color: #92400e; padding: 5px 15px; border-radius: 20px; display: inline-block; font-size: 14px; margin-top: 10px;">↔️ Aller-retour</p>`
          : ""
      }
    </div>
    
    <div style="background-color: #f4f4f5; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
      <h3 style="color: #18181b; margin: 0 0 15px 0; font-size: 18px;">👤 Client</h3>
      <table style="width: 100%; font-size: 15px;">
        <tr>
          <td style="padding: 8px 0; color: #71717a; width: 120px;">Nom :</td>
          <td style="padding: 8px 0; color: #18181b; font-weight: 600;">${clientName}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #71717a;">Téléphone :</td>
          <td style="padding: 8px 0; color: #18181b; font-weight: 600;">
            <a href="tel:${phone}" style="color: #22c55e; text-decoration: none;">${phone}</a>
          </td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #71717a;">Email :</td>
          <td style="padding: 8px 0; color: #18181b;">${email}</td>
        </tr>
      </table>
    </div>
    
    <div style="background-color: #f4f4f5; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
      <h3 style="color: #18181b; margin: 0 0 15px 0; font-size: 18px;">📍 Trajet</h3>
      <table style="width: 100%; font-size: 15px;">
        <tr>
          <td style="padding: 8px 0; color: #71717a; width: 120px;">Départ :</td>
          <td style="padding: 8px 0; color: #18181b; font-weight: 600;">${pickup}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #71717a;">Arrivée :</td>
          <td style="padding: 8px 0; color: #18181b; font-weight: 600;">${dropoff}</td>
        </tr>
        ${
          kilometers
            ? `
        <tr>
          <td style="padding: 8px 0; color: #71717a;">Distance :</td>
          <td style="padding: 8px 0; color: #18181b;">${kilometers} km</td>
        </tr>
        `
            : ""
        }
      </table>
    </div>
    
    <div style="background-color: #f4f4f5; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
      <h3 style="color: #18181b; margin: 0 0 15px 0; font-size: 18px;">📅 Date & Heure</h3>
      <p style="font-size: 18px; color: #18181b; margin: 0;">
        <strong>${dateFormatted}</strong> à <strong>${timeFormatted}</strong>
      </p>
      ${
        passengers
          ? `
      <p style="font-size: 14px; color: #71717a; margin: 10px 0 0 0;">
        👥 ${passengers} passager(s)
      </p>
      `
          : ""
      }
    </div>
    
    ${
      prix
        ? `
    <div style="background-color: #22c55e; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 20px;">
      <p style="color: #ffffff; margin: 0; font-size: 14px;">Prix de la course</p>
      <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 32px; font-weight: bold;">${prix} €</p>
    </div>
    `
        : ""
    }
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${
        companyInfo.website
      }/dashboard" style="display: inline-block; background-color: #18181b; color: #ffffff; text-decoration: none; padding: 16px 50px; border-radius: 10px; font-size: 16px; font-weight: 600;">
        📋 Voir dans le Dashboard
      </a>
    </div>
    
    <hr style="border: none; border-top: 1px solid #e4e4e7; margin: 30px 0;">
    
    <p style="font-size: 12px; color: #a1a1aa; text-align: center; margin: 0;">
      ID de réservation : ${bookingId}
    </p>
  `;

  return wrapEmail(content);
};

// ============================================
// TEMPLATE: NOTIFICATION MISE À DISPOSITION (pour le chauffeur)
// ============================================
const newAvailabilityNotificationTemplate = (data) => {
  const {
    name,
    phone,
    email,
    pickupAddress,
    date,
    time,
    duration,
    details,
    requestId,
  } = data;

  // Formater la date
  const dateObj = new Date(date);
  const dateFormatted = dateObj.toLocaleDateString("fr-FR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const content = `
    <div style="text-align: center; margin-bottom: 30px;">
      <span style="font-size: 60px;">⏱️</span>
      <h2 style="color: #22c55e; margin: 10px 0;">Nouvelle demande de mise à disposition !</h2>
    </div>
    
    <div style="background-color: #f4f4f5; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
      <h3 style="color: #18181b; margin: 0 0 15px 0; font-size: 18px;">👤 Client</h3>
      <table style="width: 100%; font-size: 15px;">
        <tr>
          <td style="padding: 8px 0; color: #71717a; width: 120px;">Nom :</td>
          <td style="padding: 8px 0; color: #18181b; font-weight: 600;">${
            name || "Non renseigné"
          }</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #71717a;">Téléphone :</td>
          <td style="padding: 8px 0; color: #18181b; font-weight: 600;">
            <a href="tel:${phone}" style="color: #22c55e; text-decoration: none;">${phone}</a>
          </td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #71717a;">Email :</td>
          <td style="padding: 8px 0; color: #18181b;">${email}</td>
        </tr>
      </table>
    </div>
    
    <div style="background-color: #f4f4f5; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
      <h3 style="color: #18181b; margin: 0 0 15px 0; font-size: 18px;">📍 Lieu de prise en charge</h3>
      <p style="font-size: 16px; color: #18181b; margin: 0; font-weight: 600;">${pickupAddress}</p>
    </div>
    
    <div style="background-color: #f4f4f5; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
      <h3 style="color: #18181b; margin: 0 0 15px 0; font-size: 18px;">📅 Date & Durée</h3>
      <table style="width: 100%; font-size: 15px;">
        <tr>
          <td style="padding: 8px 0; color: #71717a; width: 120px;">Date :</td>
          <td style="padding: 8px 0; color: #18181b; font-weight: 600;">${dateFormatted}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #71717a;">Heure :</td>
          <td style="padding: 8px 0; color: #18181b; font-weight: 600;">${time}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #71717a;">Durée :</td>
          <td style="padding: 8px 0; color: #18181b; font-weight: 600;">${duration}</td>
        </tr>
      </table>
    </div>
    
    ${
      details
        ? `
    <div style="background-color: #fef3c7; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
      <h3 style="color: #92400e; margin: 0 0 10px 0; font-size: 16px;">📝 Détails supplémentaires</h3>
      <p style="font-size: 14px; color: #78350f; margin: 0; line-height: 1.6;">${details}</p>
    </div>
    `
        : ""
    }
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${
        companyInfo.website
      }/dashboard" style="display: inline-block; background-color: #18181b; color: #ffffff; text-decoration: none; padding: 16px 50px; border-radius: 10px; font-size: 16px; font-weight: 600;">
        📋 Voir dans le Dashboard
      </a>
    </div>
    
    <hr style="border: none; border-top: 1px solid #e4e4e7; margin: 30px 0;">
    
    <p style="font-size: 12px; color: #a1a1aa; text-align: center; margin: 0;">
      ID de demande : ${requestId}
    </p>
  `;

  return wrapEmail(content);
};

module.exports = {
  verificationEmailTemplate,
  resendVerificationEmailTemplate,
  passwordResetEmailTemplate,
  welcomeEmailTemplate,
  newBookingNotificationTemplate,
  newAvailabilityNotificationTemplate,
  wrapEmail,
  ctaButton,
};

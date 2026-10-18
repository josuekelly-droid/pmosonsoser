import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const BRAND = {
  red: "#E30613",
  black: "#1A1A1A",
  gray: "#F5F5F5",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "https://pmosonsoser.com",
  siteName: "PM Osons Oser",
  // URL absolue pour que le logo s'affiche dans Gmail/Outlook
  logoUrl: `${process.env.NEXT_PUBLIC_SITE_URL || "https://pmosonsoser.com"}/logo/pm-osons-oser-1.jpg`,
};

/* ---------------- Layout HTML commun ---------------- */
function htmlLayout(content: string, title: string): string {
  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:${BRAND.gray};font-family:'Inter',Arial,sans-serif;color:${BRAND.black};">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:${BRAND.gray};padding:40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 8px 40px -12px rgba(0,0,0,0.1);">
          <!-- Header avec Logo -->
          <tr>
            <td style="background:${BRAND.black};padding:32px 40px;text-align:center;">
              <img src="${BRAND.logoUrl}" alt="${BRAND.siteName}" style="width:64px;height:64px;border-radius:50%;margin:0 auto 12px;display:block;object-fit:cover;border:2px solid ${BRAND.red};" />
              <div style="font-family:'Arial Black',Arial,sans-serif;font-size:22px;letter-spacing:2px;color:#fff;">
                PM <span style="color:${BRAND.red};">OSONS OSER</span>
              </div>
              <div style="font-size:10px;letter-spacing:3px;color:rgba(255,255,255,0.5);margin-top:4px;text-transform:uppercase;">
                Motos · Pièces · Lubrifiants
              </div>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding:40px;">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:${BRAND.black};padding:24px 40px;text-align:center;">
              <p style="margin:0;font-size:12px;color:rgba(255,255,255,0.5);line-height:1.6;">
                © ${new Date().getFullYear()} ${BRAND.siteName}<br>
                <a href="${BRAND.siteUrl}" style="color:${BRAND.red};text-decoration:none;">${BRAND.siteUrl}</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/* ---------------- Bouton CTA ---------------- */
function ctaButton(label: string, url: string): string {
  return `
    <table role="presentation" cellspacing="0" cellpadding="0" style="margin:28px auto 0;">
      <tr>
        <td style="border-radius:9999px;background:${BRAND.red};box-shadow:0 8px 24px -8px rgba(227,6,19,0.5);">
          <a href="${url}" style="display:inline-block;padding:14px 32px;font-size:14px;font-weight:600;color:#fff;text-decoration:none;text-transform:uppercase;letter-spacing:1px;">
            ${label}
          </a>
        </td>
      </tr>
    </table>
  `;
}

/* ---------------- Code à 6 chiffres ---------------- */
function codeBlock(code: string): string {
  const digits = code
    .split("")
    .map(
      (d) =>
        `<td style="padding:0 4px;"><span style="display:inline-block;width:44px;height:56px;line-height:56px;text-align:center;font-family:'Courier New',monospace;font-size:28px;font-weight:700;color:${BRAND.black};background:${BRAND.gray};border-radius:10px;">${d}</span></td>`
    )
    .join("");

  return `
    <table role="presentation" cellspacing="0" cellpadding="0" style="margin:28px auto;">
      <tr>${digits}</tr>
    </table>
  `;
}

/* ============================================================
   EMAIL 1 : Vérification de compte
   ============================================================ */
export async function sendVerificationEmail(email: string, name: string, code: string) {
  const content = `
    <h1 style="margin:0 0 8px;font-size:24px;font-weight:700;color:${BRAND.black};">
      Bienvenue ${name} !
    </h1>
    <p style="margin:0;font-size:15px;line-height:1.6;color:#4B5563;">
      Merci d'avoir créé votre compte chez ${BRAND.siteName}. Pour activer votre compte,
      saisissez le code de vérification ci-dessous :
    </p>
    ${codeBlock(code)}
    <p style="margin:0;font-size:13px;line-height:1.6;color:#6B7280;text-align:center;">
      Ce code expire dans <strong>15 minutes</strong>.<br>
      Si vous n'êtes pas à l'origine de cette inscription, ignorez cet email.
    </p>
  `;

  await transporter.sendMail({
    from: `"${BRAND.siteName}" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `${code} — Votre code de vérification PM Osons Oser`,
    html: htmlLayout(content, "Vérification de compte"),
  });
}

/* ============================================================
   EMAIL 2 : Mot de passe oublié
   ============================================================ */
export async function sendPasswordResetEmail(email: string, name: string, token: string) {
  const resetUrl = `${BRAND.siteUrl}/nouveau-mot-de-passe?token=${token}`;

  const content = `
    <h1 style="margin:0 0 8px;font-size:24px;font-weight:700;color:${BRAND.black};">
      Réinitialisation de mot de passe
    </h1>
    <p style="margin:0;font-size:15px;line-height:1.6;color:#4B5563;">
      Bonjour ${name},<br>
      Vous avez demandé à réinitialiser votre mot de passe. Cliquez sur le bouton
      ci-dessous pour en choisir un nouveau.
    </p>
    ${ctaButton("Réinitialiser mon mot de passe", resetUrl)}
    <p style="margin:28px 0 0;font-size:13px;line-height:1.6;color:#6B7280;">
      Ce lien expire dans <strong>1 heure</strong>.<br>
      Si vous n'avez pas demandé cette réinitialisation, ignorez cet email — votre
      mot de passe actuel reste inchangé.
    </p>
  `;

  await transporter.sendMail({
    from: `"${BRAND.siteName}" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Réinitialisation de votre mot de passe — PM Osons Oser",
    html: htmlLayout(content, "Mot de passe oublié"),
  });
}

/* ============================================================
   EMAIL 3 : Confirmation de changement de mot de passe
   ============================================================ */
export async function sendPasswordChangedEmail(email: string, name: string) {
  const content = `
    <h1 style="margin:0 0 8px;font-size:24px;font-weight:700;color:${BRAND.black};">
      Mot de passe modifié
    </h1>
    <p style="margin:0;font-size:15px;line-height:1.6;color:#4B5563;">
      Bonjour ${name},<br><br>
      Votre mot de passe a bien été modifié. Vous pouvez maintenant vous
      connecter avec vos nouveaux identifiants.
    </p>
    ${ctaButton("Se connecter", `${BRAND.siteUrl}/connexion`)}
    <p style="margin:28px 0 0;font-size:13px;line-height:1.6;color:#6B7280;">
      Si vous n'êtes pas à l'origine de ce changement, contactez-nous immédiatement
      à <a href="mailto:${process.env.EMAIL_USER}" style="color:${BRAND.red};">${process.env.EMAIL_USER}</a>.
    </p>
  `;

  await transporter.sendMail({
    from: `"${BRAND.siteName}" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Votre mot de passe a été modifié — PM Osons Oser",
    html: htmlLayout(content, "Mot de passe modifié"),
  });
}

/* ============================================================
   EMAIL 4 : Bienvenue (Compte vérifié)
   ============================================================ */
export async function sendWelcomeEmail(email: string, name: string) {
  const content = `
    <h1 style="margin:0 0 8px;font-size:24px;font-weight:700;color:${BRAND.black};">
      Compte activé 🎉
    </h1>
    <p style="margin:0;font-size:15px;line-height:1.6;color:#4B5563;">
      Félicitations ${name}, votre compte est désormais actif. Vous pouvez
      commencer à explorer notre catalogue de motos, tricycles, pièces
      détachées et lubrifiants.
    </p>
    ${ctaButton("Découvrir le catalogue", `${BRAND.siteUrl}/motos`)}
  `;

  await transporter.sendMail({
    from: `"${BRAND.siteName}" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Bienvenue chez PM Osons Oser 🏍️",
    html: htmlLayout(content, "Compte activé"),
  });
}

/* ============================================================
   EMAIL 5 : Confirmation de commande (Client)
   ============================================================ */
export async function sendOrderConfirmationEmail(
  email: string,
  name: string,
  orderNumber: string,
  total: number,
  items: { name: string; quantity: number }[]
) {
  const itemsHtml = items
    .map(
      (i) =>
        `<tr>
          <td style="padding:8px 0;font-size:14px;color:#4B5563;border-bottom:1px solid #F3F4F6;">${i.quantity}x ${i.name}</td>
        </tr>`
    )
    .join("");

  const formattedTotal = new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "XOF",
  })
    .format(total)
    .replace("XOF", "FCFA");

  const content = `
    <h1 style="margin:0 0 8px;font-size:24px;font-weight:700;color:${BRAND.black};">
      Commande confirmée !
    </h1>
    <p style="margin:0;font-size:15px;line-height:1.6;color:#4B5563;">
      Bonjour ${name},<br><br>
      Merci pour votre commande. Nous avons bien reçu vos informations et préparons vos articles.
    </p>
    
    <div style="background:${BRAND.gray};padding:16px;border-radius:12px;margin:24px 0;text-align:center;">
      <p style="margin:0;font-size:11px;color:#6B7280;text-transform:uppercase;font-weight:bold;letter-spacing:1px;">Numéro de commande</p>
      <p style="margin:6px 0 0;font-size:20px;font-weight:bold;color:${BRAND.black};">${orderNumber}</p>
    </div>

    <table style="width:100%;border-collapse:collapse;margin-bottom:16px;">
      ${itemsHtml}
      <tr>
        <td style="padding-top:16px;font-size:16px;font-weight:bold;color:${BRAND.black};">
          Total : ${formattedTotal}
        </td>
      </tr>
    </table>

    ${ctaButton("Suivre ma commande", `${BRAND.siteUrl}/compte`)}
    
    <p style="margin:24px 0 0;font-size:13px;line-height:1.6;color:#6B7280;text-align:center;">
      Une question ? Contactez-nous à <a href="mailto:${process.env.EMAIL_USER}" style="color:${BRAND.red};">${process.env.EMAIL_USER}</a>
    </p>
  `;

  await transporter.sendMail({
    from: `"${BRAND.siteName}" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `Commande ${orderNumber} confirmée — ${BRAND.siteName}`,
    html: htmlLayout(content, "Commande confirmée"),
  });
}

/* ============================================================
   EMAIL 6 : Nouvelle commande (Admin)
   ============================================================ */
export async function sendNewOrderAdminEmail(
  orderNumber: string,
  customerName: string,
  total: number,
  adminEmail: string
) {
  const formattedTotal = new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "XOF",
  })
    .format(total)
    .replace("XOF", "FCFA");

  const content = `
    <h1 style="margin:0 0 8px;font-size:24px;font-weight:700;color:${BRAND.black};">
      Nouvelle commande ! 🔔
    </h1>
    <p style="margin:0;font-size:15px;line-height:1.6;color:#4B5563;">
      Une nouvelle commande vient d'être passée sur le site.
    </p>

    <div style="background:${BRAND.gray};padding:20px;border-radius:12px;margin:24px 0;">
      <p style="margin:0;font-size:11px;color:#6B7280;text-transform:uppercase;font-weight:bold;letter-spacing:1px;">Commande</p>
      <p style="margin:4px 0 12px;font-size:18px;font-weight:bold;color:${BRAND.black};">${orderNumber}</p>
      
      <p style="margin:0;font-size:11px;color:#6B7280;text-transform:uppercase;font-weight:bold;letter-spacing:1px;">Client</p>
      <p style="margin:4px 0 12px;font-size:15px;color:${BRAND.black};"><strong>${customerName}</strong></p>

      <p style="margin:0;font-size:11px;color:#6B7280;text-transform:uppercase;font-weight:bold;letter-spacing:1px;">Montant Total</p>
      <p style="margin:4px 0 0;font-size:18px;font-weight:bold;color:${BRAND.red};">${formattedTotal}</p>
    </div>

    ${ctaButton("Voir la commande dans l'admin", `${BRAND.siteUrl}/admin/commandes`)}
  `;

  await transporter.sendMail({
    from: `"${BRAND.siteName}" <${process.env.EMAIL_USER}>`,
    to: adminEmail,
    subject: `🔔 Nouvelle commande ${orderNumber} (${formattedTotal})`,
    html: htmlLayout(content, "Nouvelle commande"),
  });
}

/* ============================================================
   EMAIL 7 : Changement de statut (Client)
   ============================================================ */
export async function sendOrderStatusUpdateEmail(
  email: string,
  name: string,
  orderNumber: string,
  statut: string
) {
  const messages: Record<string, { title: string; text: string; color: string }> = {
    PAYE: { 
      title: "Paiement confirmé", 
      text: "Nous avons bien reçu votre paiement. Votre commande est en cours de préparation.",
      color: "#10B981" // Vert
    },
    EXPEDIE: { 
      title: "Commande expédiée", 
      text: "Votre commande est en cours de livraison. Notre livreur vous contactera bientôt.",
      color: "#8B5CF6" // Violet
    },
    LIVRE: { 
      title: "Commande livrée", 
      text: "Votre commande a été livrée avec succès. Merci de votre confiance !",
      color: "#10B981"
    },
    ANNULE: { 
      title: "Commande annulée", 
      text: "Votre commande a été annulée. Si vous avez des questions, contactez notre support.",
      color: "#EF4444" // Rouge
    },
  };

  const msg = messages[statut] || { title: "Mise à jour de commande", text: `Votre commande est maintenant : ${statut}`, color: BRAND.red };

  const content = `
    <h1 style="margin:0 0 8px;font-size:24px;font-weight:700;color:${BRAND.black};">
      ${msg.title}
    </h1>
    <p style="margin:0;font-size:15px;line-height:1.6;color:#4B5563;">
      Bonjour ${name},<br><br>
      ${msg.text}
    </p>
    <div style="background:${BRAND.gray};padding:16px;border-radius:12px;margin:24px 0;text-align:center;">
      <p style="margin:0;font-size:11px;color:#6B7280;text-transform:uppercase;font-weight:bold;letter-spacing:1px;">Numéro de commande</p>
      <p style="margin:6px 0 0;font-size:20px;font-weight:bold;color:${msg.color};">${orderNumber}</p>
    </div>
    ${ctaButton("Suivre ma commande", `${BRAND.siteUrl}/compte/commandes`)}
  `;

  await transporter.sendMail({
    from: `"${BRAND.siteName}" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `${msg.title} — Commande ${orderNumber}`,
    html: htmlLayout(content, msg.title),
  });
}

/* ============================================================
   EMAIL 8 : Changement de statut (Admin)
   ============================================================ */
export async function sendOrderStatusAdminEmail(
  orderNumber: string,
  customerName: string,
  statut: string,
  adminEmail: string
) {
  const content = `
    <h1 style="margin:0 0 8px;font-size:24px;font-weight:700;color:${BRAND.black};">
      Mise à jour de commande
    </h1>
    <p style="margin:0;font-size:15px;line-height:1.6;color:#4B5563;">
      La commande <strong>${orderNumber}</strong> de <strong>${customerName}</strong> a été passée au statut <strong>${statut}</strong>.
    </p>
    ${ctaButton("Voir dans l'admin", `${BRAND.siteUrl}/admin/commandes`)}
  `;

  await transporter.sendMail({
    from: `"${BRAND.siteName}" <${process.env.EMAIL_USER}>`,
    to: adminEmail,
    subject: `Mise à jour : Commande ${orderNumber} -> ${statut}`,
    html: htmlLayout(content, "Mise à jour de commande"),
  });
}

export async function sendContactEmail(name: string, email: string, subject: string, message: string) {
  const content = `
    <h1 style="font-size:20px;color:${BRAND.black};">Nouveau message de contact</h1>
    <p><strong>De :</strong> ${name} (${email})</p>
    <p><strong>Sujet :</strong> ${subject}</p>
    <div style="background:${BRAND.gray};padding:16px;border-radius:8px;margin-top:16px;">
      <p style="white-space:pre-wrap;font-size:14px;">${message}</p>
    </div>
  `;
  await transporter.sendMail({
    from: `"${BRAND.siteName}" <${process.env.EMAIL_USER}>`,
    to: process.env.EMAIL_USER,
    replyTo: email,
    subject: `[Contact] ${subject}`,
    html: htmlLayout(content, "Nouveau message"),
  });
}
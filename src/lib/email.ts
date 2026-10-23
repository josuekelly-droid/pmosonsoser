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
  redDark: "#B8040F",
  black: "#0A0A0B",
  darkGray: "#1A1A1A",
  lightGray: "#F5F5F5",
  border: "#E5E7EB",
  text: "#374151",
  textLight: "#6B7280",
  green: "#10B981",
  orange: "#F59E0B",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "https://pmosonsoser.com",
  siteName: "PM Osons Oser",
  logoUrl: `${process.env.NEXT_PUBLIC_SITE_URL || "https://pmosonsoser.com"}/logo/pm-osons-oser-1.jpg`,
};

/* ---------------- Helpers ---------------- */
const formatMoney = (amount: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "XOF" })
    .format(amount)
    .replace("XOF", "FCFA");

const formatDate = (date: Date | string) =>
  new Date(date).toLocaleString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const PAYMENT_LABELS: Record<string, string> = {
  FEDAPAY: "Mobile Money (FedaPay)",
  WESTERN_UNION: "Western Union",
  VIREMENT: "Virement bancaire",
};

const STATUS_LABELS: Record<string, string> = {
  EN_ATTENTE: "En attente",
  PAYE: "Payé",
  EXPEDIE: "Expédié",
  LIVRE: "Livré",
  ANNULE: "Annulé",
};

/* ---------------- Types ---------------- */
export type EmailOrderItem = {
  productName: string;
  brandName?: string;
  quantity: number;
  price: number;
  image?: string;
  colorName?: string | null;
  colorHex?: string | null;
};

export type EmailOrder = {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  telephone: string;
  adresseLivraison: string;
  notes?: string | null;
  methodePaiement: string;
  total: number;
  deliveryFee: number;
  subtotal: number;
  createdAt: Date | string;
  items: EmailOrderItem[];
};

/* ---------------- Layout HTML commun ---------------- */
function htmlLayout(content: string, title: string, preheader = ""): string {
  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:${BRAND.lightGray};font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;color:${BRAND.black};-webkit-font-smoothing:antialiased;">
  <div style="display:none;font-size:1px;color:${BRAND.lightGray};line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">${preheader}</div>
  
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:${BRAND.lightGray};padding:40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:600px;background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 12px 48px -12px rgba(0,0,0,0.12);">
          
          <tr>
            <td style="background:${BRAND.black};padding:36px 40px 28px;text-align:center;">
              <img src="${BRAND.logoUrl}" alt="${BRAND.siteName}" width="64" height="64" style="width:64px;height:64px;border-radius:50%;margin:0 auto 14px;display:block;object-fit:cover;border:2px solid ${BRAND.red};" />
              <div style="font-family:'Arial Black',Arial,sans-serif;font-size:22px;letter-spacing:3px;color:#ffffff;">
                PM <span style="color:${BRAND.red};">OSONS OSER</span>
              </div>
              <div style="font-size:10px;letter-spacing:3px;color:rgba(255,255,255,0.5);margin-top:6px;text-transform:uppercase;">
                Motos · Pièces · Lubrifiants
              </div>
            </td>
          </tr>
          
          <tr>
            <td style="padding:40px 40px 32px;">
              ${content}
            </td>
          </tr>
          
          <tr>
            <td style="background:${BRAND.black};padding:28px 40px;text-align:center;">
              <p style="margin:0 0 8px;font-size:12px;color:rgba(255,255,255,0.7);line-height:1.6;">
                Une question ? Contactez-nous à <a href="mailto:${process.env.EMAIL_USER}" style="color:${BRAND.red};text-decoration:none;font-weight:600;">${process.env.EMAIL_USER}</a>
              </p>
              <p style="margin:0;font-size:11px;color:rgba(255,255,255,0.4);line-height:1.6;">
                © ${new Date().getFullYear()} ${BRAND.siteName} — Tous droits réservés<br>
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
function ctaButton(label: string, url: string, color = BRAND.red): string {
  return `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:28px auto 0;">
      <tr>
        <td style="border-radius:9999px;background:${color};box-shadow:0 8px 24px -8px rgba(227,6,19,0.5);">
          <a href="${url}" style="display:inline-block;padding:16px 36px;font-size:14px;font-weight:700;color:#fff;text-decoration:none;text-transform:uppercase;letter-spacing:1.5px;">
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
        `<td style="padding:0 4px;"><span style="display:inline-block;width:48px;height:60px;line-height:60px;text-align:center;font-family:'Courier New',monospace;font-size:30px;font-weight:800;color:${BRAND.black};background:${BRAND.lightGray};border-radius:12px;border:1px solid ${BRAND.border};">${d}</span></td>`
    )
    .join("");

  return `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:28px auto;">
      <tr>${digits}</tr>
    </table>
  `;
}

/* ---------------- Bloc de résumé (KPI) ---------------- */
function summaryBlock(rows: { label: string; value: string; highlight?: boolean }[]): string {
  const rowsHtml = rows
    .map(
      (r) => `
      <tr>
        <td style="padding:10px 0;font-size:14px;color:${BRAND.textLight};font-weight:500;">${r.label}</td>
        <td style="padding:10px 0;font-size:14px;color:${r.highlight ? BRAND.red : BRAND.black};font-weight:${r.highlight ? "800" : "600"};text-align:right;">${r.value}</td>
      </tr>
    `
    )
    .join("");

  return `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:${BRAND.lightGray};border-radius:16px;padding:20px 24px;margin:20px 0;">
      <tr>
        <td>
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
            ${rowsHtml}
          </table>
        </td>
      </tr>
    </table>
  `;
}

/* ---------------- Bloc d'info ---------------- */
function infoCard(title: string, lines: string[]): string {
  const linesHtml = lines
    .map(
      (l) =>
        `<p style="margin:0 0 6px;font-size:14px;line-height:1.6;color:${BRAND.text};">${l}</p>`
    )
    .join("");

  return `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:16px 0;">
      <tr>
        <td style="padding:20px 24px;background:#ffffff;border:1px solid ${BRAND.border};border-radius:16px;">
          <p style="margin:0 0 12px;font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:1.5px;color:${BRAND.red};">${title}</p>
          ${linesHtml}
        </td>
      </tr>
    </table>
  `;
}

/* ---------------- Ligne de tableau produit ---------------- */
// ⚠️ CORRECTION : utilise `productName` au lieu de `name`
function productRow(item: EmailOrderItem): string {
  const total = item.quantity * item.price;
  const displayName = item.productName;

  const imageHtml = item.image
    ? `<img src="${item.image}" alt="${displayName}" width="56" height="56" style="width:56px;height:56px;border-radius:12px;object-fit:cover;border:1px solid ${BRAND.border};display:block;" />`
    : `<div style="width:56px;height:56px;border-radius:12px;background:${BRAND.lightGray};border:1px solid ${BRAND.border};text-align:center;line-height:56px;font-size:11px;font-weight:800;color:${BRAND.textLight};">${(item.brandName || "???").slice(0, 3).toUpperCase()}</div>`;

  const colorHtml = item.colorName
    ? `<p style="margin:4px 0 0;font-size:12px;color:${BRAND.textLight};">
         <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${item.colorHex || "#888"};border:1px solid ${BRAND.border};vertical-align:middle;margin-right:6px;"></span>
         ${item.colorName}
       </p>`
    : "";

  return `
    <tr>
      <td style="padding:16px 0;border-bottom:1px solid ${BRAND.border};">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
          <tr>
            <td width="72" style="vertical-align:top;">${imageHtml}</td>
            <td style="padding-left:14px;vertical-align:top;">
              <p style="margin:0;font-size:14px;font-weight:700;color:${BRAND.black};line-height:1.4;">${displayName}</p>
              ${item.brandName ? `<p style="margin:2px 0 0;font-size:12px;color:${BRAND.textLight};">${item.brandName}</p>` : ""}
              ${colorHtml}
              <p style="margin:6px 0 0;font-size:12px;color:${BRAND.textLight};">Quantité : ${item.quantity} × ${formatMoney(item.price)}</p>
            </td>
            <td style="text-align:right;vertical-align:top;padding-left:12px;">
              <p style="margin:0;font-size:15px;font-weight:800;color:${BRAND.black};white-space:nowrap;">${formatMoney(total)}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `;
}

/* ---------------- Titre de section ---------------- */
function sectionTitle(label: string, title: string): string {
  return `
    <p style="margin:0 0 4px;font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:2px;color:${BRAND.red};">${label}</p>
    <h2 style="margin:0 0 16px;font-size:20px;font-weight:700;color:${BRAND.black};">${title}</h2>
  `;
}

/* ============================================================
   EMAIL 1 : Vérification de compte
   ============================================================ */
export async function sendVerificationEmail(email: string, name: string, code: string) {
  const content = `
    <h1 style="margin:0 0 12px;font-size:28px;font-weight:800;color:${BRAND.black};">
      Bienvenue ${name} ! 👋
    </h1>
    <p style="margin:0;font-size:15px;line-height:1.7;color:${BRAND.text};">
      Merci d'avoir créé votre compte chez <strong>${BRAND.siteName}</strong>. Pour activer votre compte et accéder à notre catalogue, saisissez le code de vérification ci-dessous :
    </p>
    ${codeBlock(code)}
    <p style="margin:0;font-size:13px;line-height:1.6;color:${BRAND.textLight};text-align:center;">
      Ce code expire dans <strong style="color:${BRAND.black};">15 minutes</strong>.<br>
      Si vous n'êtes pas à l'origine de cette inscription, ignorez cet email.
    </p>
  `;

  await transporter.sendMail({
    from: `"${BRAND.siteName}" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `${code} — Votre code de vérification PM Osons Oser`,
    html: htmlLayout(content, "Vérification de compte", `Votre code : ${code}`),
  });
}

/* ============================================================
   EMAIL 2 : Mot de passe oublié
   ============================================================ */
export async function sendPasswordResetEmail(email: string, name: string, token: string) {
  const resetUrl = `${BRAND.siteUrl}/nouveau-mot-de-passe?token=${token}`;

  const content = `
    <h1 style="margin:0 0 12px;font-size:28px;font-weight:800;color:${BRAND.black};">
      Réinitialisation de mot de passe 🔐
    </h1>
    <p style="margin:0;font-size:15px;line-height:1.7;color:${BRAND.text};">
      Bonjour ${name},<br><br>
      Vous avez demandé à réinitialiser votre mot de passe. Cliquez sur le bouton ci-dessous pour en choisir un nouveau.
    </p>
    ${ctaButton("Réinitialiser mon mot de passe", resetUrl)}
    <p style="margin:32px 0 0;font-size:13px;line-height:1.6;color:${BRAND.textLight};">
      Ce lien expire dans <strong style="color:${BRAND.black};">1 heure</strong>.<br>
      Si vous n'avez pas demandé cette réinitialisation, ignorez cet email — votre mot de passe actuel reste inchangé.
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
    <h1 style="margin:0 0 12px;font-size:28px;font-weight:800;color:${BRAND.black};">
      Mot de passe modifié ✅
    </h1>
    <p style="margin:0;font-size:15px;line-height:1.7;color:${BRAND.text};">
      Bonjour ${name},<br><br>
      Votre mot de passe a bien été modifié. Vous pouvez maintenant vous connecter avec vos nouveaux identifiants.
    </p>
    ${ctaButton("Se connecter", `${BRAND.siteUrl}/connexion`)}
    <p style="margin:32px 0 0;font-size:13px;line-height:1.6;color:${BRAND.textLight};">
      Si vous n'êtes pas à l'origine de ce changement, contactez-nous immédiatement à <a href="mailto:${process.env.EMAIL_USER}" style="color:${BRAND.red};font-weight:600;">${process.env.EMAIL_USER}</a>.
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
    <h1 style="margin:0 0 12px;font-size:28px;font-weight:800;color:${BRAND.black};">
      Compte activé 🎉
    </h1>
    <p style="margin:0;font-size:15px;line-height:1.7;color:${BRAND.text};">
      Félicitations ${name}, votre compte est désormais actif ! Vous pouvez dès maintenant explorer notre catalogue complet :
    </p>
    ${summaryBlock([
      { label: "🏍️ Motos", value: "Apsonic, Honda, TVS, Haojue..." },
      { label: "🛺 Tricycles", value: "Transport & livraison" },
      { label: "⚙️ Pièces détachées", value: "Toutes marques" },
      { label: "🛢️ Lubrifiants", value: "Huiles & graisses" },
    ])}
    ${ctaButton("Découvrir le catalogue", `${BRAND.siteUrl}/motos`)}
    <p style="margin:32px 0 0;font-size:13px;line-height:1.6;color:${BRAND.textLight};text-align:center;">
      Besoin d'aide ? Notre équipe est à votre disposition à <a href="mailto:${process.env.EMAIL_USER}" style="color:${BRAND.red};font-weight:600;">${process.env.EMAIL_USER}</a>
    </p>
  `;

  await transporter.sendMail({
    from: `"${BRAND.siteName}" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Bienvenue chez PM Osons Oser 🏍️",
    html: htmlLayout(content, "Compte activé"),
  });
}

/* ============================================================
   EMAIL 5 : Confirmation de commande (Client) — RICHE
   ============================================================ */
export async function sendOrderConfirmationEmail(order: EmailOrder) {
  const productsHtml = order.items.map(productRow).join("");

  const content = `
    <h1 style="margin:0 0 12px;font-size:28px;font-weight:800;color:${BRAND.black};">
      Merci pour votre commande ! 🎉
    </h1>
    <p style="margin:0;font-size:15px;line-height:1.7;color:${BRAND.text};">
      Bonjour ${order.customerName},<br><br>
      Nous avons bien reçu votre commande et nous vous remercions de votre confiance. Notre équipe prépare vos articles avec le plus grand soin.
    </p>

    ${summaryBlock([
      { label: "Numéro de commande", value: order.orderNumber, highlight: true },
      { label: "Date", value: formatDate(order.createdAt) },
      { label: "Mode de paiement", value: PAYMENT_LABELS[order.methodePaiement] || order.methodePaiement },
    ])}

    <div style="margin-top:32px;">
      ${sectionTitle("Votre commande", "Articles")}
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
        ${productsHtml}
      </table>
    </div>

    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top:20px;">
      <tr>
        <td style="padding:8px 0;font-size:14px;color:${BRAND.textLight};">Sous-total</td>
        <td style="padding:8px 0;font-size:14px;color:${BRAND.black};font-weight:600;text-align:right;">${formatMoney(order.subtotal)}</td>
      </tr>
      <tr>
        <td style="padding:8px 0;font-size:14px;color:${BRAND.textLight};">Livraison</td>
        <td style="padding:8px 0;font-size:14px;color:${order.deliveryFee === 0 ? BRAND.green : BRAND.black};font-weight:600;text-align:right;">${order.deliveryFee === 0 ? "Offerte" : formatMoney(order.deliveryFee)}</td>
      </tr>
      <tr>
        <td style="padding:16px 0 0;border-top:2px solid ${BRAND.black};font-size:16px;font-weight:800;color:${BRAND.black};">Total</td>
        <td style="padding:16px 0 0;border-top:2px solid ${BRAND.black};font-size:22px;font-weight:800;color:${BRAND.red};text-align:right;">${formatMoney(order.total)}</td>
      </tr>
    </table>

    ${infoCard("Livraison", [
      `<strong>${order.customerName}</strong>`,
      order.adresseLivraison,
      `📞 ${order.telephone}`,
      order.notes ? `<em style="color:${BRAND.textLight};">« ${order.notes} »</em>` : "",
    ].filter(Boolean))}

    ${ctaButton("Suivre ma commande", `${BRAND.siteUrl}/compte/commandes`)}
    
    <p style="margin:32px 0 0;font-size:13px;line-height:1.6;color:${BRAND.textLight};text-align:center;">
      Une question sur votre commande ?<br>
      Contactez-nous à <a href="mailto:${process.env.EMAIL_USER}" style="color:${BRAND.red};font-weight:600;">${process.env.EMAIL_USER}</a>
    </p>
  `;

  await transporter.sendMail({
    from: `"${BRAND.siteName}" <${process.env.EMAIL_USER}>`,
    to: order.customerEmail,
    subject: `Commande ${order.orderNumber} confirmée — ${BRAND.siteName}`,
    html: htmlLayout(content, "Commande confirmée", `Votre commande ${order.orderNumber} est confirmée.`),
  });
}

/* ============================================================
   EMAIL 6 : Nouvelle commande (Admin) — RICHE
   ============================================================ */
export async function sendNewOrderAdminEmail(order: EmailOrder, adminEmail: string) {
  const productsHtml = order.items.map(productRow).join("");

  const content = `
    <h1 style="margin:0 0 12px;font-size:28px;font-weight:800;color:${BRAND.black};">
      Nouvelle commande ! 🔔
    </h1>
    <p style="margin:0;font-size:15px;line-height:1.7;color:${BRAND.text};">
      Une nouvelle commande vient d'être passée sur le site. Voici les détails complets.
    </p>

    ${summaryBlock([
      { label: "Commande", value: order.orderNumber, highlight: true },
      { label: "Date", value: formatDate(order.createdAt) },
      { label: "Client", value: order.customerName },
      { label: "Montant Total", value: formatMoney(order.total), highlight: true },
      { label: "Paiement", value: PAYMENT_LABELS[order.methodePaiement] || order.methodePaiement },
    ])}

    <div style="margin-top:24px;">
      ${sectionTitle("Articles commandés", `${order.items.length} produit${order.items.length > 1 ? "s" : ""}`)}
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
        ${productsHtml}
      </table>
    </div>

    ${infoCard("Coordonnées Client", [
      `<strong>${order.customerName}</strong>`,
      `📧 ${order.customerEmail}`,
      `📞 ${order.telephone}`,
      `📍 ${order.adresseLivraison}`,
      order.notes ? `<em style="color:${BRAND.textLight};">« ${order.notes} »</em>` : "",
    ].filter(Boolean))}

    ${ctaButton("Voir la commande dans l'admin", `${BRAND.siteUrl}/admin/commandes`)}
  `;

  await transporter.sendMail({
    from: `"${BRAND.siteName}" <${process.env.EMAIL_USER}>`,
    to: adminEmail,
    subject: `🔔 Nouvelle commande ${order.orderNumber} (${formatMoney(order.total)})`,
    html: htmlLayout(content, "Nouvelle commande", `Commande de ${order.customerName}`),
  });
}

/* ============================================================
   EMAIL 7 : Changement de statut (Client) — RICHE
   ============================================================ */
export async function sendOrderStatusUpdateEmail(
  order: EmailOrder,
  statut: string
) {
  const configs: Record<string, { title: string; text: string; emoji: string; color: string }> = {
    PAYE: {
      title: "Paiement confirmé",
      text: "Nous avons bien reçu votre paiement. Votre commande est en cours de préparation.",
      emoji: "✅",
      color: BRAND.green,
    },
    EXPEDIE: {
      title: "Commande expédiée",
      text: "Votre commande est en cours de livraison. Notre livreur vous contactera bientôt.",
      emoji: "🚚",
      color: "#8B5CF6",
    },
    LIVRE: {
      title: "Commande livrée",
      text: "Votre commande a été livrée avec succès. Merci de votre confiance !",
      emoji: "🎉",
      color: BRAND.green,
    },
    ANNULE: {
      title: "Commande annulée",
      text: "Votre commande a été annulée. Si vous avez des questions, contactez notre support.",
      emoji: "❌",
      color: BRAND.red,
    },
  };

  const msg = configs[statut] || {
    title: "Mise à jour de commande",
    text: `Votre commande est maintenant : ${statut}`,
    emoji: "ℹ️",
    color: BRAND.red,
  };

  const productsHtml = order.items.map(productRow).join("");

  const content = `
    <h1 style="margin:0 0 12px;font-size:28px;font-weight:800;color:${BRAND.black};">
      ${msg.emoji} ${msg.title}
    </h1>
    <p style="margin:0;font-size:15px;line-height:1.7;color:${BRAND.text};">
      Bonjour ${order.customerName},<br><br>
      ${msg.text}
    </p>

    ${summaryBlock([
      { label: "Numéro de commande", value: order.orderNumber, highlight: true },
      { label: "Nouveau statut", value: STATUS_LABELS[statut] || statut, highlight: true },
      { label: "Total", value: formatMoney(order.total) },
    ])}

    <div style="margin-top:24px;">
      ${sectionTitle("Récapitulatif", "Articles")}
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
        ${productsHtml}
      </table>
    </div>

    ${infoCard("Adresse de livraison", [
      `<strong>${order.customerName}</strong>`,
      order.adresseLivraison,
      `📞 ${order.telephone}`,
    ])}

    ${ctaButton("Suivre ma commande", `${BRAND.siteUrl}/compte/commandes`)}
  `;

  await transporter.sendMail({
    from: `"${BRAND.siteName}" <${process.env.EMAIL_USER}>`,
    to: order.customerEmail,
    subject: `${msg.emoji} ${msg.title} — Commande ${order.orderNumber}`,
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
    <h1 style="margin:0 0 12px;font-size:24px;font-weight:800;color:${BRAND.black};">
      Mise à jour de commande
    </h1>
    <p style="margin:0;font-size:15px;line-height:1.7;color:${BRAND.text};">
      La commande <strong>${orderNumber}</strong> de <strong>${customerName}</strong> a été passée au statut <strong style="color:${BRAND.red};">${STATUS_LABELS[statut] || statut}</strong>.
    </p>
    ${ctaButton("Voir dans l'admin", `${BRAND.siteUrl}/admin/commandes`)}
  `;

  await transporter.sendMail({
    from: `"${BRAND.siteName}" <${process.env.EMAIL_USER}>`,
    to: adminEmail,
    subject: `Mise à jour : Commande ${orderNumber} → ${STATUS_LABELS[statut] || statut}`,
    html: htmlLayout(content, "Mise à jour de commande"),
  });
}

/* ============================================================
   EMAIL 9 : Contact
   ============================================================ */
export async function sendContactEmail(name: string, email: string, subject: string, message: string) {
  const content = `
    <h1 style="margin:0 0 12px;font-size:24px;font-weight:800;color:${BRAND.black};">
      Nouveau message de contact
    </h1>
    ${summaryBlock([
      { label: "Nom", value: name },
      { label: "Email", value: email },
      { label: "Sujet", value: subject },
    ])}
    <div style="background:${BRAND.lightGray};padding:20px 24px;border-radius:16px;margin:20px 0;">
      <p style="margin:0 0 8px;font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:1.5px;color:${BRAND.red};">Message</p>
      <p style="margin:0;font-size:14px;line-height:1.7;color:${BRAND.text};white-space:pre-wrap;">${message}</p>
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
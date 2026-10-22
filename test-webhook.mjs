import crypto from 'crypto';

// ⚠️ REMPLACE PAR LE NUMÉRO DE TA COMMANDE EN ATTENTE
const ORDER_NUMBER = "PM-20261021-7622"; 

// ⚠️ REMPLACE PAR TON SECRET WEBHOOK (commençant par wh_live_...)
const WEBHOOK_SECRET = "wh_live_sOZXkBLVUbeLNimPm3GHfuDz"; 

// ⚠️ URL DE TON SITE
const TARGET_URL = "https://pmosonsoser.com/api/webhooks/fedapay";

const payload = {
  name: "transaction.approved",
  object: "transaction",
  entity: {
    klass: "v1/transaction",
    id: 113799331,
    reference: "trx_test_12341",
    amount: 1500,
    description: `Commande ${ORDER_NUMBER}`,
    status: "approved",
    customer: { full_name: "Test Client" }
  }
};

const rawBody = JSON.stringify(payload);

// 1. Générer le timestamp actuel
const timestamp = Math.floor(Date.now() / 1000);

// 2. Le SDK FedaPay concatène le timestamp et le body avec un point
const signedPayload = `${timestamp}.${rawBody}`;

// 3. Générer la signature HMAC sur cette chaîne
const signatureHash = crypto
  .createHmac("sha256", WEBHOOK_SECRET)
  .update(signedPayload)
  .digest("hex");

// 4. Formater le header comme l'attend FedaPay : t=timestamp,v1=hash
const header = `t=${timestamp},v1=${signatureHash}`;

console.log("⏳ Envoi du faux webhook avec le bon format...");
console.log(`🔑 Header généré : ${header}`);

// 5. Envoyer la requête
try {
  const response = await fetch(TARGET_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-fedapay-signature": header,
    },
    body: rawBody,
  });

  const data = await response.json();
  console.log(`✅ Statut HTTP : ${response.status}`);
  console.log(`📥 Réponse de ton serveur :`, data);
} catch (error) {
  console.error("❌ Erreur lors de l'envoi :", error);
}
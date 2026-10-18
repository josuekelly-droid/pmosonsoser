import crypto from "crypto";

/**
 * Génère un code numérique à 6 chiffres (pour vérification email / 2FA)
 */
export function generateSixDigitCode(): string {
  // crypto.randomInt est cryptographiquement sûr
  return crypto.randomInt(100000, 999999).toString();
}

/**
 * Génère un token URL-safe de 32 octets (pour reset password)
 */
export function generateSecureToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Durées d'expiration en millisecondes
 */
export const EXPIRY = {
  EMAIL_CODE: 15 * 60 * 1000, // 15 minutes
  PASSWORD_RESET: 60 * 60 * 1000, // 1 heure
};
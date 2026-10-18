import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

/**
 * Limiteurs prêts à l'emploi.
 * Toutes les fenêtres sont glissantes (sliding window).
 */
export const rateLimiters = {
  // Inscription : 5 tentatives par heure par IP
  register: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, "1 h"),
    analytics: true,
    prefix: "rl:register",
  }),

  // Connexion : 10 tentatives par 15 minutes par IP
  login: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, "15 m"),
    analytics: true,
    prefix: "rl:login",
  }),

  // Vérification code : 5 tentatives par 15 min
  verify: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, "15 m"),
    analytics: true,
    prefix: "rl:verify",
  }),

  // Renvoi de code : 3 par heure
  resendCode: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(3, "1 h"),
    analytics: true,
    prefix: "rl:resend",
  }),

  // Mot de passe oublié : 3 par heure
  forgotPassword: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(3, "1 h"),
    analytics: true,
    prefix: "rl:forgot",
  }),

  // Reset password : 5 par heure
  resetPassword: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, "1 h"),
    analytics: true,
    prefix: "rl:reset",
  }),
};

/** Extrait l'IP du client depuis les headers */
export function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "unknown";
}
<div align="center">

# PM Osons Oser

**Plateforme e-commerce premium pour la vente de motos, tricycles, pièces détachées, machines agricoles et lubrifiants au Bénin.**

[![Next.js](https://img.shields.io/badge/Next.js-16.4-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react&logoColor=white)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-6.0-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![Neon](https://img.shields.io/badge/Neon_PostgreSQL-00E599?style=for-the-badge&logo=postgresql&logoColor=white)](https://neon.tech/)
[![Vercel](https://img.shields.io/badge/Vercel-Deployed-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)

[Site Web](https://pmosonsoser.com) · [Signaler un bug](https://github.com/josuekelly-droid/pmosonsoser/issues) · [Demander une fonctionnalité](https://github.com/josuekelly-droid/pmosonsoser/issues)

</div>

---

## Table des Matières

- [À propos du projet](#-à-propos-du-projet)
- [Stack Technique](#-stack-technique)
- [Fonctionnalités Principales](#-fonctionnalités-principales)
- [Sécurité & Performance](#-sécurité--performance)
- [SEO & PWA](#-seo--pwa)
- [Démarrage Rapide](#-démarrage-rapide)
- [Variables d'Environnement](#-variables-denvironnement)
- [Structure du Projet](#-structure-du-projet)
- [Déploiement](#-déploiement)
- [Auteur & Crédits](#-auteur--crédits)

---

##  À propos du projet

**PM Osons Oser** est une plateforme e-commerce moderne conçue pour digitaliser la vente de véhicules (motos, tricycles), de pièces détachées, de machines agricoles et de lubrifiants au Bénin. 

L'objectif est de fournir une expérience d'achat **premium, rapide et sécurisée**, avec une gestion complète des prix (B2C et B2B), des paiements en ligne (FedaPay, Mobile Money, Western Union, Virement) et un tableau de bord d'administration robuste.

### Pourquoi ce projet ?
- **Transparence** : Prix clairs et détaillés pour les particuliers et les professionnels.
- **Confiance** : Paiements sécurisés et produits certifiés.
- **Innovation** : Une interface "Dark Luxury" moderne, fluide et responsive.

---

## Stack Technique

### Frontend
- **Framework** : [Next.js 16](https://nextjs.org/) (App Router, Turbopack)
- **Langage** : [TypeScript](https://www.typescriptlang.org/)
- **Styling** : [Tailwind CSS v4](https://tailwindcss.com/)
- **Composants UI** : [Shadcn/UI](https://ui.shadcn.com/), [Lucide React](https://lucide.dev/) (icônes)
- **Animations** : [Framer Motion](https://www.framer.com/motion/)
- **Graphiques** : [Recharts](https://recharts.org/)
- **Gestion d'état** : [Zustand](https://zustand-demo.pmnd.rs/) (panier)

### Backend & Base de Données
- **API** : Next.js Route Handlers (Serverless)
- **ORM** : [Prisma](https://www.prisma.io/)
- **Base de données** : [Neon PostgreSQL](https://neon.tech/) (Serverless)
- **Authentification** : [NextAuth.js v5](https://authjs.dev/) (JWT + bcrypt)
- **Emails** : [Nodemailer](https://nodemailer.com/) (Gmail SMTP)

### Paiements & Médias
- **Paiement en ligne** : [FedaPay](https://fedapay.com/) (Mobile Money : MTN, Moov, Celtiis)
- **Upload d'images** : [Cloudinary](https://cloudinary.com/)
- **Cartographie** : [Leaflet](https://leafletjs.com/) + [OpenStreetMap](https://www.openstreetmap.org/) + [OpenRouteService](https://openrouteservice.org/)

### Sécurité & Performance
- **Rate Limiting** : [Upstash Redis](https://upstash.com/)
- **Validation** : [Zod](https://zod.dev/)
- **Webhooks** : Vérification HMAC-SHA256 (signature FedaPay)

---

## Fonctionnalités Principales

###  Boutique (Public)
- [x] Catalogue par catégories (Motos, Tricycles, Pièces, Machines Agricoles, Lubrifiants).
- [x] Filtres avancés (marque, prix, tri) + pagination SEO-friendly.
- [x] Recherche globale avec modale (⌘K / Ctrl+K).
- [x] Fiche produit détaillée avec galerie d'images, stock temps réel, choix des couleurs.
- [x] Panier persistant (Zustand) avec gestion des couleurs (produit + couleur = ligne unique).
- [x] Checkout avec calcul des frais de livraison par distance GPS (carte interactive).
- [x] Paiement sécurisé via FedaPay, Western Union ou Virement bancaire.

### Espace Client (Compte)
- [x] Tableau de bord avec historique des commandes et suivi en temps réel.
- [x] Gestion du profil (nom, téléphone, changement de mot de passe).
- [x] Demande de passage en compte **Professionnel (B2B)** avec validation admin.
- [x] Affichage des prix B2B et des économies réalisées.

### Administration (Dashboard Admin)
- [x] **Produits** : CRUD complet, upload d'images via Cloudinary, gestion des stocks.
- [x] **Marques & Catégories** : Gestion complète avec slugs automatiques.
- [x] **Couleurs** : Palette réutilisable avec codes hexadécimaux.
- [x] **Commandes** : Gestion des statuts, validation manuelle des paiements WU/Virement, remise en stock automatique.
- [x] **Utilisateurs** : Validation des comptes B2B, promotion admin.
- [x] **Avis** : Modération (approuver/masquer, mettre en vedette).
- [x] **Paramètres** : Configuration des coordonnées, des frais de livraison et des infos de paiement.
- [x] **Statistiques** : Graphiques des ventes (7 derniers jours), CA, alertes de stock faible.

---

## Sécurité & Performance

- **Protection des prix** : Les prix sont toujours recalculés côté serveur à partir de la base de données (aucune confiance au front-end).
- **Idempotence** : Protection contre les doubles clics lors du paiement.
- **Atomicité** : Transactions Prisma pour éviter les stocks négatifs.
- **Honeypot** : Anti-bot sur les formulaires (inscription, contact, newsletter).
- **Rate Limiting** : Limitation des tentatives (connexion, inscription, mot de passe oublié).
- **Webhooks sécurisés** : Validation cryptographique des notifications FedaPay.
- **JWT** : Session sécurisée avec cookies HttpOnly.

---

## SEO & PWA

- **Métadonnées dynamiques** : Titres, descriptions et images Open Graph générés par page.
- **JSON-LD** : Données structurées (Product, ItemList, Breadcrumb, Store) pour Google.
- **Sitemap dynamique** : Génération automatique de `sitemap.xml`.
- **Robots.txt** : Configuration stricte pour les pages privées (admin, compte, API).
- **PWA (Progressive Web App)** : Application installable sur mobile (Android/iOS) avec manifeste, icônes et service worker.
- **Responsive** : Design premium adapté à tous les écrans (Mobile, Tablette, Desktop).

---

## 🏁 Démarrage Rapide

### Prérequis
- Node.js 20+
- npm ou pnpm
- Une base de données PostgreSQL (Neon)
- Un compte Gmail (pour l'envoi d'emails)
- Un compte FedaPay (clés API)
- Un compte Cloudinary (upload d'images)

### Installation

1. **Cloner le dépôt**
   ```bash
   git clone https://github.com/josuekelly-droid/pmosonsoser.git
   cd pmosonsoser
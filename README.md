## Fonctionnalité :

- Voir la carte
- Système de compte via par **mail** (avec verif du mail)
- Commander :
    - confirmation d'une commande envoie par mail
- commande **Click & collect** ou **Livraison**
- Gestion des stocks avec gestion des **épuisement**
- Adaptation du site **mobile** et **PC**
- Panel **admin** avec stat
    - vente
    - prix des commandes des matières
    - salarié avec leur heures et salaire
    - modifie la carte
- Panel de gestion des commande des clients:
    - accès par employé et admin
    - changement du status de la commande (système de **pooling**)
- pouvoir modifier la composition de son burger style mcdo
- Page Client :
    - Info perso + adresse
    - commande en cours et passé avec leur détaille

## Architecture du site avec fonctionnalité:

### Barre de navigation :

- [x]  bouton d’authentification
- [x]  bouton de deconnexion
- [x]  bouton pour passer une commande
- [x]  Bouton page d’accueil
- [x]  bouton pour page user
- [ ]  bouton admin
- [ ]  bouton pour coté employe

### Footer:

- [x]  retour au début de la page d’accueil ( avoir si je garde le navbar au scroll)
- [x]  contact a un admin
- [x]  Copyright
- [x]  les mentions légals

### Page d'accueil (/) :

- [x]  Catalogue des produits filtrable par catégories (Burgers, Boissons, Desserts, etc.).
- [x]  Carte pour chaque produit avec un bouton “Ajouter au panier”
- [x]  **Panier:**
    - **Version pc:** Un tiroir (Sheet Shadcn) ou une sidebar Panier accessible directement à droite de l'écran pour voir ses articles en temps réel.
    - **Version Mobile:** un bouton pour voir le panier ("Bottom Sheet")

### Page Connexion / Inscription (/login & /register) :

- [x]  Accessible depuis la NavBar, ou déclenchée si l'utilisateur veut valider son panier.
- [x]  formulaire de connexion
- [x]  formulaire d’inscription

### Page Validation de Commande (/checkout) :

- [x]  Protégée : demande la connexion si nécessaire.
- [x]  choix entre click & collect ou livraison
- [x]  Saisie de l'adresse de livraison (rue, ville, code_postal), si livraison
- [x]  confirmation finale.

### Page User :

- [x]  info User
- [x]  adresse par default
- [x]  commande en cours et passé (avec detail des commandes)

### Page admin:

- [ ]  Sous page gestion des stocks
- [ ]  Sous page gestion des employé
- [ ]  Sous page commande fournisseur
- [ ]  Sous page Statistique
- [ ]  Sous page Gestion de la carte du fast food

### Page employé :

- [ ]  afficher les commandes
- [ ]  modifier le status de la commande
- [ ]  Donné l’accès au admin

## Tecno:

- **Frontend :** React
- **CSS**: Tailwind + shadcn/ui
- **Backend:** Spring
- **BDD:** PostgreSQL
- **Docker**
- **Service Mail:** Mailhog
- **Service de payement:** Stripe (mode test)
- **Gestion de version** git et maven

## A faire :

- Corriger le bug du panier pas sychronisé
- Finir les fonctionnalité Client
- Ajouter fonctionnalité Employé et Admin
- Corriger les bug :
    - bug de synchronisation du panier front ↔back
    - problème de token user au lieu de token email
- Rendre plus beau le front
- Docker

## Plan

1. Faire le plan de la base de donné sur draw.io
2. Creer la base de donné
3. Backend
    1. Configuration initiale du projet Spring
    2. Modélisation des Entités JPA & Repositories
    3. Sécurité & Authenticité (JWT & Mail)
    4. Gestion du Menu (Carte & Catégories)
    5. Gestion du Panier & des Commandes
    6. Panel Administrateur & Statistiques
4. Logique entre back et BD (gestion des stock, creation de compte ...)
5. Mail verification par mail pour user (Mailtrap / Mailhog)
6. Frontend simple
7. Auth côté frontend
    - Login/register
    - stockage du token (JWT)
    - protéger certaines pages
8. Interface Admin
    - ajouter/modifier produits
    - voir commandes
    - changer statut commande
9. Rendre beau le frontend
10. Dockeriser

## Ce qui est fait :

- Le plan
- Schema de la base de donnée sur draw.io
- Creé la base de donné postgreSQL
- Configuration initiale du projet Spring avec aplication proprieties
- Modélisation des Entités JPA & Repositories
- Sécurité & Authenticité (JWT) (pour User pour commencer)
- Gestion du Menu (Carte & Catégories)
- Gestion du Panier & des Commandes
- Module Approvisionnement (/api/admin/fournisseurs)
- Module Employés & Saisie des heures
- Module Statistiques
- Authentification par mails
- recipicer de confirmation d'une commande
- Backend — Sécurité & CORS
- Configuration react router et axios
- Créer la page d'accueil avec l'affichage de la carte et des produits (en connectant l'API backend pour récupérer les produits et catégories).
- Créer le contexte de panier (PanierContext) pour que l'utilisateur puisse ajouter/supprimer des produits localement (dans le navigateur), sans avoir besoin d'être connecté !
- Page de connexions/inscriptions
- Page validation de commandes:
    - se connecter si besoin
    - recap du pannier
    - adresse de livraison
## Fonctionnalité :

- Voir la carte
- Système de compte via par **mail** (avec verif du mail)
- Commander :
    - confirmation d'une commande envoie par mail
- commande **Click & collect** ou **Livraison**
- Gestion des stocks avec gestion des **épuisement**
- Adaptation du site **mobile** et **PC**
- Panel **admin** avec states :
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
- [x]  bouton admin
- [x]  bouton pour coté employe

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

- [ ]  Sous page gestion des employé
    - [ ]  Afficher nom + salaire
    - [ ]  ajouter un employé avec un mail special  “***@tacoburger.fr”**
    - [ ]  Virer un employé
    - [ ]  modifier salaire
    - [ ]  Voir planning employé
    - [ ]  gérer les horaires d’un employé
    - [ ]  Gestion des droits (admin employe et client)
- [ ]  Sous page commande fournisseur + stocks
    - [ ]  Afficher les matieres premieres et leurs quantité en stock
    - [ ]  Voir le catalogue d’un fournisseur
    - [ ]  commander chez un fournisseur
    - [ ]  suivie des commandes fournisseur (avec changement de status)
    - [ ]  Ajouter un catalogue
- [x]  Sous page Statistique :
    - [x]  Chiffres d’affaire
    - [x]  nombre de commande selon jour ou semaine
    - [x]  prix d’un panier moyen
    - [x]  Dépenses Approvisionnement
    - [x]  Masse salarial
    - [x]  Top des ventes
    - [x]  adapté les stats selon une periode ou global
- [ ]  Sous page Gestion de la carte du fast food
    - [x]  Afficher tout les produits
    - [x]  Ajouter un produit a la carte
    - [x]  Enlever un produit de la carte
    - [x]  Modifier un produit de la carte (prix, nom …)
    - [x]  rendre un produit disponible ou pas

### Page employé :

- [x]  afficher les commandes
- [x]  modifier le status de la commande
- [x]  Donné l’accès au admin

## Tecno:

- **Frontend :** React
- **CSS**: Tailwind + shadcn/ui
- **Backend:** Spring
- **BDD:** PostgreSQL
- **Docker**
- **Service Mail:** Mailhog
- **Gestion de version** git et maven

## A faire :

- Finir fonctionnalité  Admin
- Tester toute les fonctionnalités
- Corriger les bug :
    - problème de token user au lieu de token email ?
    - Bug du calcul du CA ?
    - bug sur la quantité des produits a la validation d’une commande ?
    - bug sur la modification du nombre de produit du panier dans la page commande
    - crash d’application quand token user expire
    - Problème d’historique des commande user ?
    - bug produit dans le panier puis supprimer de la carte produit puis passer la commande ?
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
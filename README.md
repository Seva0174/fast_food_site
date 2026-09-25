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

- [x]  Sous page gestion des employé
    - [x]  Afficher nom + salaire + metier + mail
    - [x]  ajouter un employé avec un mail special  “***@tacoburger.fr” ?**
    - [x]  Virer un employé
    - [x]  modifier salaire
    - [x]  sauvegarde du nombre d’heure d’un jour
    - [x]  gérer les horaires d’un employé
    - [x]  Calcul salaire mensuel d’un employee
    - [x]  Gestion des droits
- [x]  Sous page commande fournisseur + stocks
    - [x]  Voir le catalogue d’un fournisseur
    - [x]  commander chez un fournisseur
    - [x]  Ajouter un catalogue csv
    - [x]  suivie des commandes fournisseur (avec changement de status)
    - [x]  Voir détail des commandes fournisseurs
- [ ]  Sous page stocks et composition produit de la carte
    - [ ]  Afficher les matieres premieres +quantité en stock
    - [ ]  pouvoir modifier la compsition d’un produit de la carte
- [x]  Sous page Statistique :
    - [x]  Chiffres d’affaire
    - [x]  nombre de commande selon jour ou semaine
    - [x]  prix d’un panier moyen
    - [x]  Dépenses Approvisionnement
    - [x]  Masse salarial
    - [x]  Top des ventes
    - [x]  adapté les stats selon une periode ou global
- [x]  Sous page Gestion de la carte du fast food
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

- Ajouter l'onglet des stocks 
- Système de personalisation des matieres premiere dans un produit de la carte
- Finir fonctionnalité  Admin
- Corriger les bug :
    - problème de token user au lieu de token email ?
    - Bug du calcul du CA ?
    - bug sur la quantité des produits a la validation d’une commande ?
    - bug sur la modification du nombre de produit du panier dans la page commande
    - crash d’application quand token user expire
    - Problème d’historique des commande user ?
    - bug produit dans le panier puis supprimer de la carte produit puis passer la commande ?
    - bug lors de creation de compte qui est entre employé ou admin
    - verifier le systeme de changement de status de commande
- Tester toute les fonctionnalités pour trouver les bug
- Rendre plus beau le front et factoriser en composant reutilisable
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
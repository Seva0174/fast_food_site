## Fonctionnalité :

- Voir la carte
- Système de compte via par **mail** (avec verif du mail)
- Commander :
    - confirmation d'une commande envoie par mail
    - mail quand la commande est prete ou en cours de livraison
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
- [x]  Sous page stocks et composition produit de la carte
    - [x]  Afficher les matieres premieres +quantité en stock
    - [x]  ajouter/supprimer une matiere premiere
    - [x]  Securiser la supression par rapport au catalogue ou carte des produits ou commandes fournisseur
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
    - [x]  pouvoir modifier la compsition d’un produit de la carte
    - [ ]  gerer la compostion d’un produit par un client

### Page employé :

- [x]  afficher les commandes
- [x]  modifier le status de la commande
- [x]  Donné l’accès au admin
- [x]  envoyer un mail quand une commande est recupérable ou en cours de livraison

## Tecno:

- **Frontend :** React
- **CSS**: Tailwind + shadcn/ui
- **Backend:** Spring
- **BDD:** PostgreSQL
- **Docker**
- **Service Mail:** Mailhog
- **Gestion de version** git et maven

## A faire :

- Ajouter choix de composition d’un produit par un client
- Corriger les bug :
    - Vérifier la bonne gestion des stocks après :
        - commande fournisseur
        - commande passé
        - gerer les annulation de commandes
        - gestion des choix de compostion d’un produit par un client
    - afficher dans admin les produit_carte, commande_fournisseur, stock_matiere_1ere, employe EN TRIER SELON l ID
    - bug select qui s’affiche mal (pas entierement)
    - Enlever les tacos car il faut faire la composition en direct
- Tester toute les fonctionnalités pour trouver les bug
- Rendre plus beau le front et factoriser le fronted composant réutilisable
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
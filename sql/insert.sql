-- =====================================================================
-- UTILISATEURS
-- Mots de passe stockés en clair ici uniquement pour la démo :
-- =====================================================================
INSERT INTO users (email, mdp, nom, role, est_verif, date_creation) VALUES
('admin@tacoburger.fr',     '$2a$10$TOccMYVM3IdwUaMat/lMnuYqFKGipUGpNuUxdQjB82TxzvfWmilzO', 'Amine Belkacem', 'admin',   TRUE, '2025-01-10 09:00:00'), --password
('julie.martin@mail.fr',    '$2a$10$TOccMYVM3IdwUaMat/lMnuYqFKGipUGpNuUxdQjB82TxzvfWmilzO', 'Julie Martin',   'client',  TRUE, '2025-02-14 12:30:00'),
('thomas.dubois@mail.fr',   '$2a$10$TOccMYVM3IdwUaMat/lMnuYqFKGipUGpNuUxdQjB82TxzvfWmilzO', 'Thomas Dubois',  'client',  TRUE, '2025-03-01 18:45:00'),
('sofia.garcia@mail.fr',    '$2a$10$TOccMYVM3IdwUaMat/lMnuYqFKGipUGpNuUxdQjB82TxzvfWmilzO', 'Sofia Garcia',   'client',  FALSE,'2025-06-20 10:15:00'),
('karim.said@tacoburger.fr','$2a$10$TOccMYVM3IdwUaMat/lMnuYqFKGipUGpNuUxdQjB82TxzvfWmilzO', 'Karim Saidi',    'employe', TRUE, '2025-01-15 08:00:00');

-- =====================================================================
-- ADRESSES
-- =====================================================================
INSERT INTO adresse (id_user, rue, ville, code_postal) VALUES
(2, '12 rue des Lilas',        'Lyon',    '69000'),
(3, '5 avenue de la République','Villeurbanne', '69100'),
(4, '3 impasse du Marché',     'Décines-Charpieu', '69150');

-- =====================================================================
-- TOKENS DE VÉRIFICATION D'EMAIL
-- =====================================================================
INSERT INTO email_verification_tokens (id_user, token, expire_le) VALUES
(4, 'a1b2c3d4e5f6-sofia-token', '2025-06-21 10:15:00');

-- =====================================================================
-- CATÉGORIES DU MENU
-- =====================================================================
INSERT INTO categorie (nom) VALUES
('Tacos'),
('Burgers'),
('Wings'),
('Accompagnements'),
('Boissons'),
('Desserts');

-- =====================================================================
-- PRODUITS DU MENU
-- =====================================================================
INSERT INTO produit_menu (id_categorie, description, prix, image_url, nom, est_dispo) VALUES
-- Tacos (categorie 1)
(1, 'Tacos simple viande au choix, sauce fromagère et frites incluses',        7.50, '/img/tacos_simple.jpg',   'Tacos Simple',        TRUE),
(1, 'Tacos double viande, sauce fromagère, crudités et frites',                9.50, '/img/tacos_double.jpg',   'Tacos Double',        TRUE),
(1, 'Tacos XXL 3 viandes, cheddar fondu et sauce au choix',                    12.90,'/img/tacos_xxl.jpg',      'Tacos XXL',           TRUE),

-- Burgers (categorie 2)
(2, 'Steak haché 150g, cheddar, salade, tomate, oignons, sauce burger',        8.90, '/img/classic_burger.jpg', 'Classic Burger',      TRUE),
(2, 'Double steak haché, double cheddar, bacon grillé, sauce BBQ',            11.90,'/img/bacon_burger.jpg',   'Bacon Cheese Burger', TRUE),
(2, 'Poulet croustillant pané, salade, sauce épicée',                          9.50, '/img/chicken_burger.jpg', 'Spicy Chicken Burger',TRUE),

-- Wings (categorie 3)
(3, '6 ailes de poulet marinées, sauce BBQ maison',                            6.50, '/img/wings_bbq.jpg',      'Wings BBQ (x6)',      TRUE),
(3, '6 ailes de poulet, sauce buffalo bien relevée',                           6.50, '/img/wings_buffalo.jpg',  'Wings Buffalo (x6)',  TRUE),
(3, '12 ailes de poulet, sauce au choix, format partage',                     11.90,'/img/wings_12.jpg',       'Wings Party (x12)',   TRUE),

-- Accompagnements (categorie 4)
(4, 'Frites maison croustillantes',                                            3.50, '/img/frites.jpg',         'Frites',              TRUE),
(4, 'Onion rings croustillants, sauce fromagère',                              4.50, '/img/onion_rings.jpg',    'Onion Rings',         TRUE),

-- Boissons (categorie 5)
(5, 'Canette 33cl',                                                            2.00, '/img/soda.jpg',           'Soda 33cl',           TRUE),
(5, 'Bouteille eau minérale 50cl',                                             1.50, '/img/eau.jpg',            'Eau minérale 50cl',   TRUE),

-- Desserts (categorie 6)
(6, 'Moelleux au chocolat fait maison',                                        3.90, '/img/moelleux.jpg',       'Moelleux Chocolat',   TRUE),
(6, 'Tiramisu individuel',                                                     3.90, '/img/tiramisu.jpg',       'Tiramisu',            FALSE);

-- =====================================================================
-- MATIÈRES PREMIÈRES EN STOCK
-- =====================================================================
INSERT INTO stock_matiere_premiere (nom, quantite) VALUES
('Galette tacos',            300.000),
('Pain burger',               250.000),
('Steak haché 150g',          180.000),
('Filet de poulet',           220.000),
('Ailes de poulet',           400.000),
('Cheddar (tranches)',        500.000),
('Sauce fromagère (L)',       25.000),
('Sauce BBQ (L)',             18.000),
('Sauce buffalo (L)',         15.000),
('Pommes de terre (kg)',      150.000),
('Salade (kg)',               20.000),
('Tomates (kg)',              25.000),
('Oignons (kg)',              20.000),
('Bacon (kg)',                 30.000);

-- =====================================================================
-- FOURNISSEURS
-- =====================================================================
INSERT INTO fournisseur (nom) VALUES
('Metro Cash & Carry'),
('Boucherie Grossiste Rhône'),
('Sysco France');

-- =====================================================================
-- CATALOGUE FOURNISSEUR (prix proposé par chaque fournisseur pour chaque
-- matière première)
-- =====================================================================
INSERT INTO catalogue_fournisseur (id_fournisseur, id_stock, prix_unitaire) VALUES
(1, 1,  0.35),  -- Metro - Galette tacos
(1, 10, 0.90),  -- Metro - Pommes de terre (kg)
(1, 11, 1.80),  -- Metro - Salade (kg)
(2, 3,  6.50),  -- Boucherie - Steak haché
(2, 4,  7.20),  -- Boucherie - Filet de poulet
(2, 5,  5.90),  -- Boucherie - Ailes de poulet
(2, 14, 8.40),  -- Boucherie - Bacon
(3, 2,  0.28),  -- Sysco - Pain burger
(3, 6,  4.10),  -- Sysco - Cheddar
(3, 7,  3.20),  -- Sysco - Sauce fromagère
(3, 8,  3.50),  -- Sysco - Sauce BBQ
(3, 9,  3.50);  -- Sysco - Sauce buffalo

-- =====================================================================
-- RECETTES (matières premières nécessaires pour chaque produit du menu)
-- =====================================================================
INSERT INTO recette (id_produit, id_matiere, quantite_requise) VALUES
-- Tacos Simple (produit 1)
(1, 1, 1.000),   -- galette
(1, 3, 0.150),   -- steak haché
(1, 7, 0.050),   -- sauce fromagère
-- Tacos Double (produit 2)
(2, 1, 1.000),
(2, 3, 0.300),
(2, 7, 0.070),
-- Burger Classic (produit 4)
(4, 2, 1.000),   -- pain burger
(4, 3, 0.150),   -- steak haché
(4, 6, 1.000),   -- cheddar
(4, 11, 0.030),  -- salade
(4, 12, 0.020),  -- tomates
-- Bacon Cheese Burger (produit 5)
(5, 2, 1.000),
(5, 3, 0.300),
(5, 6, 2.000),
(5, 14, 0.040),
-- Wings BBQ x6 (produit 7)
(7, 5, 0.600),   -- ailes de poulet
(7, 8, 0.040);   -- sauce BBQ

-- =====================================================================
-- PANIERS EN COURS
-- =====================================================================
INSERT INTO panier (id_user) VALUES
(2),
(3);

INSERT INTO panier_items (id_panier, id_produit, quantite) VALUES
(1, 2, 1),   -- Julie : 1 Tacos Double
(1, 11, 1),  -- Julie : 1 Frites
(1, 12, 2),  -- Julie : 2 Sodas
(2, 5, 1),   -- Thomas : 1 Bacon Cheese Burger
(2, 9, 1);   -- Thomas : 1 Wings Party

-- =====================================================================
-- COMMANDES CLIENTS (historique)
-- =====================================================================
INSERT INTO commandes (id_user, status, cp_rue, cp_ville, cp_code_postal, total, date_creation) VALUES
(2, 'livree',       '12 rue des Lilas',         'Lyon',              '69000', 15.00, '2025-07-10 19:32:00'),
(3, 'en_preparation','5 avenue de la République','Villeurbanne',      '69100', 21.80, '2025-08-01 20:05:00'),
(4, 'en_attente',   '3 impasse du Marché',      'Décines-Charpieu',  '69150', 12.90, '2025-08-02 12:10:00');

INSERT INTO commandes_menu (id_commande, id_produit, quantite, prix) VALUES
-- commande 1 (Julie) : 1 Tacos Double + 1 Soda
(1, 2, 1, 9.50),
(1, 12, 1, 2.00),
(1, 11, 1, 3.50),
-- commande 2 (Thomas) : 1 Bacon Cheese Burger + 1 Wings Buffalo + 1 Soda
(2, 5, 1, 11.90),
(2, 8, 1, 6.50),
(2, 12, 1, 2.00),
(2, 11, 1, 3.50) -- ajustement + frites
ON CONFLICT DO NOTHING;

INSERT INTO commandes_menu (id_commande, id_produit, quantite, prix) VALUES
-- commande 3 (Sofia) : 1 Tacos XXL
(3, 3, 1, 12.90);

-- =====================================================================
-- EMPLOYÉS ET HEURES TRAVAILLÉES
-- =====================================================================
INSERT INTO employe (nom, role, salaire_heure) VALUES
('Karim Saidi',  'cuisinier', 12.50),
('Léa Fontaine', 'caissiere', 11.88),
('Nabil Kaced',  'manager',   15.00);

INSERT INTO employe_heure (id_employe, nb_heure, date) VALUES
(1, 8.0, '2025-08-01'),
(1, 7.5, '2025-08-02'),
(2, 6.0, '2025-08-01'),
(3, 9.0, '2025-08-01');

-- =====================================================================
-- COMMANDES FOURNISSEURS (réapprovisionnement)
-- =====================================================================
INSERT INTO commandes_fournisseurs (id_fournisseur, date_commande, date_reception, status) VALUES
(2, '2025-07-28', '2025-07-30', 'recue'),
(1, '2025-08-01', NULL,          'en_attente'),
(3, '2025-07-25', '2025-07-27', 'recue');

INSERT INTO commandes_fournisseurs_details (id_commande_fournisseur, id_stock, quantite, prix_unitaire) VALUES
(1, 3, 50.000, 6.50),   -- steak haché
(1, 5, 40.000, 5.90),   -- ailes de poulet
(2, 1, 100.000, 0.35),  -- galettes tacos
(2, 10, 80.000, 0.90),  -- pommes de terre
(3, 2, 120.000, 0.28),  -- pain burger
(3, 6, 60.000, 4.10);   -- cheddar
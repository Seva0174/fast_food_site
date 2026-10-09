DROP TABLE IF EXISTS commande_item_options CASCADE;
DROP TABLE IF EXISTS panier_item_options CASCADE;
DROP TABLE IF EXISTS option_item CASCADE;
DROP TABLE IF EXISTS option_groupe CASCADE;
DROP TABLE IF EXISTS formule_groupe_produit CASCADE;
DROP TABLE IF EXISTS formule_groupe CASCADE;
DROP TABLE IF EXISTS commandes_fournisseurs_details CASCADE;
DROP TABLE IF EXISTS recette CASCADE;
DROP TABLE IF EXISTS catalogue_fournisseur CASCADE;
DROP TABLE IF EXISTS commandes_fournisseurs CASCADE;
DROP TABLE IF EXISTS employe_heure CASCADE;
DROP TABLE IF EXISTS commandes_menu CASCADE;
DROP TABLE IF EXISTS panier_items CASCADE;
DROP TABLE IF EXISTS commandes CASCADE;
DROP TABLE IF EXISTS email_verification_tokens CASCADE;
DROP TABLE IF EXISTS adresse CASCADE;
DROP TABLE IF EXISTS panier CASCADE;
DROP TABLE IF EXISTS produit_menu CASCADE;
DROP TABLE IF EXISTS employe CASCADE;
DROP TABLE IF EXISTS fournisseur CASCADE;
DROP TABLE IF EXISTS stock_matiere_premiere CASCADE;
DROP TABLE IF EXISTS categorie CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- =====================================================================
-- TABLES SANS DÉPENDANCES
-- =====================================================================

CREATE TABLE users (
    id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    email           VARCHAR(255) NOT NULL UNIQUE,
    mdp             VARCHAR(255) NOT NULL,
    nom             VARCHAR(150) NOT NULL,
    role            VARCHAR(30) NOT NULL DEFAULT 'client'
                        CHECK (role IN ('client', 'admin', 'employe')),
    est_verif       BOOLEAN NOT NULL DEFAULT FALSE,
    date_creation   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE categorie (
    id      BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nom     VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE stock_matiere_premiere (
    id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nom         VARCHAR(150) NOT NULL UNIQUE,
    quantite    NUMERIC(12,3) NOT NULL DEFAULT 0,
    unite_mesure VARCHAR(20) NOT NULL DEFAULT 'unite'
);

CREATE TABLE fournisseur (
    id      BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nom     VARCHAR(150) NOT NULL
);

CREATE TABLE employe (
    id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_user         BIGINT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    nom             VARCHAR(150) NOT NULL,
    role            VARCHAR(50)  NOT NULL,
    salaire_heure   NUMERIC(8,2) NOT NULL
);

-- =====================================================================
-- TABLES DÉPENDANTES DE users / categorie
-- =====================================================================

CREATE TABLE produit_menu (
    id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_categorie    BIGINT NOT NULL REFERENCES categorie(id) ON DELETE RESTRICT,
    description     TEXT,
    prix            NUMERIC(8,2) NOT NULL,
    image_url       VARCHAR(500),
    nom             VARCHAR(150) NOT NULL,
    est_dispo       BOOLEAN NOT NULL DEFAULT TRUE,
    est_formule     BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE panier (
    id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_user     BIGINT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE adresse (
    id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_user         BIGINT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rue             VARCHAR(255) NOT NULL,
    ville           VARCHAR(150) NOT NULL,
    code_postal     VARCHAR(20)  NOT NULL
);

CREATE TABLE email_verification_tokens (
    id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_user     BIGINT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token       VARCHAR(255) NOT NULL,
    expire_le   TIMESTAMP NOT NULL
);

CREATE TABLE commandes (
    id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_user         BIGINT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    type_retrait    VARCHAR(20) NOT NULL DEFAULT 'livraison'
                        CHECK (type_retrait IN ('livraison', 'click_and_collect')),
    status          VARCHAR(30) NOT NULL DEFAULT 'en_attente'
                        CHECK (status IN ('en_attente', 'en_preparation', 'prete', 'livree', 'retiree', 'annulee')),
    cp_rue          VARCHAR(255),        
    cp_ville        VARCHAR(150),        
    cp_code_postal  VARCHAR(20), 
    total           NUMERIC(10,2) NOT NULL DEFAULT 0,
    date_creation   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT check_adresse_si_livraison CHECK (
        type_retrait = 'click_and_collect' OR 
        (cp_rue IS NOT NULL AND cp_ville IS NOT NULL AND cp_code_postal IS NOT NULL)
    )
);

-- =====================================================================
-- TABLES DE FORMULES (MENUS)
-- =====================================================================

CREATE TABLE formule_groupe (
    id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_formule      BIGINT NOT NULL REFERENCES produit_menu(id) ON DELETE CASCADE,
    nom             VARCHAR(100) NOT NULL,
    min_selection   INTEGER NOT NULL DEFAULT 1,
    max_selection   INTEGER NOT NULL DEFAULT 1,
    ordre           INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT check_formule_groupe_selection
        CHECK (min_selection >= 0 AND max_selection >= min_selection)
);

CREATE TABLE formule_groupe_produit (
    id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_groupe   BIGINT NOT NULL REFERENCES formule_groupe(id) ON DELETE CASCADE,
    id_produit  BIGINT NOT NULL REFERENCES produit_menu(id) ON DELETE RESTRICT,
    surcout     NUMERIC(8,2) NOT NULL DEFAULT 0.00,

    CONSTRAINT uq_formule_groupe_produit UNIQUE (id_groupe, id_produit)
);

-- =====================================================================
-- TABLES DE LIAISON (PANIERS & COMMANDES)
-- =====================================================================

CREATE TABLE panier_items (
    id                  BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_panier           BIGINT REFERENCES panier(id) ON DELETE CASCADE,
    id_produit          BIGINT NOT NULL REFERENCES produit_menu(id) ON DELETE CASCADE,
    quantite            INTEGER NOT NULL CHECK (quantite > 0),
    id_item_parent      BIGINT REFERENCES panier_items(id) ON DELETE CASCADE,
    id_formule_groupe   BIGINT REFERENCES formule_groupe(id) ON DELETE CASCADE,

    -- Ligne principale : rattachée au panier.
    -- Composant d'une formule : rattaché uniquement à sa ligne parent (pas directement au panier).
    CONSTRAINT check_panier_item_rattachement CHECK (
        (id_item_parent IS NULL AND id_panier IS NOT NULL AND id_formule_groupe IS NULL)
        OR
        (id_item_parent IS NOT NULL AND id_panier IS NULL AND id_formule_groupe IS NOT NULL)
    )
);

CREATE TABLE commandes_menu (
    id                  BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_commande         BIGINT NOT NULL REFERENCES commandes(id) ON DELETE CASCADE,
    id_produit          BIGINT NOT NULL REFERENCES produit_menu(id) ON DELETE RESTRICT,
    quantite            INTEGER NOT NULL CHECK (quantite > 0),
    prix                NUMERIC(8,2) NOT NULL,
    id_item_parent      BIGINT REFERENCES commandes_menu(id) ON DELETE CASCADE,
    id_formule_groupe   BIGINT REFERENCES formule_groupe(id) ON DELETE SET NULL
);

CREATE TABLE employe_heure (
    id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_employe  BIGINT NOT NULL REFERENCES employe(id) ON DELETE CASCADE,
    nb_heure    NUMERIC(5,2) NOT NULL,
    date        DATE NOT NULL
);

CREATE TABLE commandes_fournisseurs (
    id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_fournisseur  BIGINT NOT NULL REFERENCES fournisseur(id) ON DELETE RESTRICT,
    date_commande   DATE NOT NULL DEFAULT CURRENT_DATE,
    date_reception  DATE,
    status          VARCHAR(30) NOT NULL DEFAULT 'en_attente'
                        CHECK (status IN ('en_attente', 'expediee', 'recue', 'annulee'))
);

CREATE TABLE catalogue_fournisseur (
    id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_fournisseur  BIGINT NOT NULL REFERENCES fournisseur(id) ON DELETE CASCADE,
    id_stock        BIGINT NOT NULL REFERENCES stock_matiere_premiere(id) ON DELETE CASCADE,
    prix_unitaire   NUMERIC(8,2) NOT NULL
);

CREATE TABLE recette (
    id                  BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_produit          BIGINT NOT NULL REFERENCES produit_menu(id) ON DELETE CASCADE,
    id_matiere          BIGINT NOT NULL REFERENCES stock_matiere_premiere(id) ON DELETE RESTRICT,
    quantite_requise    NUMERIC(10,3) NOT NULL
);

CREATE TABLE commandes_fournisseurs_details (
    id                         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_commande_fournisseur    BIGINT NOT NULL REFERENCES commandes_fournisseurs(id) ON DELETE CASCADE,
    id_stock                   BIGINT NOT NULL REFERENCES stock_matiere_premiere(id) ON DELETE RESTRICT,
    quantite                   NUMERIC(12,3) NOT NULL,
    prix_unitaire              NUMERIC(8,2) NOT NULL
);

-- =====================================================================
-- TABLES POUR LA COMPOSITION D'UN PRODUIT (OPTIONS)
-- =====================================================================

CREATE TABLE option_groupe (
    id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_produit      BIGINT NOT NULL REFERENCES produit_menu(id) ON DELETE CASCADE,
    nom             VARCHAR(100) NOT NULL,
    min_selection   INTEGER NOT NULL DEFAULT 1,
    max_selection   INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE option_item (
    id                  BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_groupe           BIGINT NOT NULL REFERENCES option_groupe(id) ON DELETE CASCADE,
    id_matiere          BIGINT NOT NULL REFERENCES stock_matiere_premiere(id) ON DELETE RESTRICT,
    nom                 VARCHAR(100) NOT NULL,
    quantite_deduite    NUMERIC(10,3) NOT NULL DEFAULT 1,
    surcout             NUMERIC(8,2) NOT NULL DEFAULT 0.00
);

CREATE TABLE panier_item_options (
    id                  BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_panier_item      BIGINT NOT NULL REFERENCES panier_items(id) ON DELETE CASCADE,
    id_option_item      BIGINT NOT NULL REFERENCES option_item(id) ON DELETE CASCADE
);

CREATE TABLE commande_item_options (
    id                  BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_commande_menu    BIGINT NOT NULL REFERENCES commandes_menu(id) ON DELETE CASCADE,
    id_option_item      BIGINT REFERENCES option_item(id) ON DELETE SET NULL,
    nom_option          VARCHAR(100) NOT NULL,
    surcout             NUMERIC(8,2) NOT NULL DEFAULT 0.00
);

-- =====================================================================
-- INDEX UTILES SUR LES CLÉS ÉTRANGÈRES
-- =====================================================================

CREATE INDEX idx_produit_menu_categorie        ON produit_menu(id_categorie);
CREATE INDEX idx_panier_user                   ON panier(id_user);
CREATE INDEX idx_adresse_user                  ON adresse(id_user);
CREATE INDEX idx_email_tokens_user             ON email_verification_tokens(id_user);
CREATE INDEX idx_commandes_user                ON commandes(id_user);
CREATE INDEX idx_panier_items_panier           ON panier_items(id_panier);
CREATE INDEX idx_panier_items_produit          ON panier_items(id_produit);
CREATE INDEX idx_commandes_menu_commande       ON commandes_menu(id_commande);
CREATE INDEX idx_commandes_menu_produit        ON commandes_menu(id_produit);
CREATE INDEX idx_employe_heure_employe         ON employe_heure(id_employe);
CREATE INDEX idx_commandes_fournisseurs_fourn  ON commandes_fournisseurs(id_fournisseur);
CREATE INDEX idx_catalogue_fournisseur_fourn   ON catalogue_fournisseur(id_fournisseur);
CREATE INDEX idx_catalogue_fournisseur_stock   ON catalogue_fournisseur(id_stock);
CREATE INDEX idx_recette_produit               ON recette(id_produit);
CREATE INDEX idx_recette_matiere               ON recette(id_matiere);
CREATE INDEX idx_cf_details_commande           ON commandes_fournisseurs_details(id_commande_fournisseur);
CREATE INDEX idx_cf_details_stock              ON commandes_fournisseurs_details(id_stock);
CREATE INDEX idx_employe_user                  ON employe(id_user);
CREATE INDEX idx_option_groupe_produit         ON option_groupe(id_produit);
CREATE INDEX idx_option_item_groupe            ON option_item(id_groupe);
CREATE INDEX idx_option_item_matiere           ON option_item(id_matiere);
CREATE INDEX idx_panier_item_options_item      ON panier_item_options(id_panier_item);
CREATE INDEX idx_panier_item_options_option    ON panier_item_options(id_option_item);
CREATE INDEX idx_commande_item_options_menu    ON commande_item_options(id_commande_menu);
CREATE INDEX idx_commande_item_options_option  ON commande_item_options(id_option_item);

-- Index pour les formules
CREATE INDEX idx_formule_groupe_formule        ON formule_groupe(id_formule);
CREATE INDEX idx_formule_groupe_produit_groupe ON formule_groupe_produit(id_groupe);
CREATE INDEX idx_formule_groupe_produit_produit ON formule_groupe_produit(id_produit);
CREATE INDEX idx_panier_items_parent           ON panier_items(id_item_parent);
CREATE INDEX idx_commandes_menu_parent         ON commandes_menu(id_item_parent);
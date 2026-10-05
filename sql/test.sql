-- 1. Historique Commande : conserve le nom et met l'ID à NULL en cas de suppression de l'option
ALTER TABLE commande_item_options 
  ALTER COLUMN id_option_item DROP NOT NULL;

ALTER TABLE commande_item_options 
  DROP CONSTRAINT commande_item_options_id_option_item_fkey,
  ADD CONSTRAINT commande_item_options_id_option_item_fkey 
    FOREIGN KEY (id_option_item) REFERENCES option_item(id) ON DELETE SET NULL;

-- 2. Panier : supprime la ligne du panier si l'option n'existe plus
ALTER TABLE panier_item_options 
  DROP CONSTRAINT panier_item_options_id_option_item_fkey,
  ADD CONSTRAINT panier_item_options_id_option_item_fkey 
    FOREIGN KEY (id_option_item) REFERENCES option_item(id) ON DELETE CASCADE;
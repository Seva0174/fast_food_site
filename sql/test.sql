ALTER TABLE option_groupe
    ADD CONSTRAINT check_option_groupe_selection
    CHECK (min_selection >= 0 AND max_selection >= min_selection);
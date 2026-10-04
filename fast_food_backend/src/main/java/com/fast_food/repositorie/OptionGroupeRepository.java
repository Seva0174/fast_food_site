package com.fast_food.repositorie;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.fast_food.entite.OptionGroupe;
import com.fast_food.entite.ProduitMenu;

@Repository
public interface OptionGroupeRepository extends JpaRepository<OptionGroupe, Long> {
    List<OptionGroupe> findByProduitMenu(ProduitMenu produitMenu);
}
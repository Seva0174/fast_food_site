package com.fast_food.repositorie;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.fast_food.entite.ProduitMenu;

@Repository
public interface ProduitMenuRepository extends JpaRepository<ProduitMenu,Long>{
    List<ProduitMenu> findByCategorieId(Long categorieId);
    boolean existsByCategorieId(Long categorieId);
}

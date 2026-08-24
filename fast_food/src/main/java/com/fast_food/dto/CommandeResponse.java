package com.fast_food.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import lombok.Data;

@Data
public class CommandeResponse {
    private Long id;
    private String status;
    private String cpRue;
    private String cpVille;
    private String cpCodePostal;
    private BigDecimal total;
    private LocalDateTime dateCreation;
    private List<CommandeItemResponse> items;
}
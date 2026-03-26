package com.clickmunch.MenuService.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Schema(description = "Menu Categories are used to organize menu items within a restaurant's menu." +
        " Each category represents a specific type of food or drink, such as Appetizers, Main Courses, Desserts, or" +
        " Beverages.")
@Data
@Document("menu_categories")
public class MenuCategory {
    @Schema(description = "Unique identifier for the menu category", example = "682f1a2b3c4d5e6f78901234")
    @Id
    private String id;
    @Schema(description = "Identifier of the restaurant this category belongs to", example = "10")
    @Indexed
    private Long restaurantId;
    @Schema(description = "Name of the menu category", example = "BEBIDA")
    private Category category;
}

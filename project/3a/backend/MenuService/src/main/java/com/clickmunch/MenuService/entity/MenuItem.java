package com.clickmunch.MenuService.entity;

import java.math.BigDecimal;
import java.time.LocalTime;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Schema(description = "Menu Items represent individual food or drink offerings within a restaurant's menu. " +
        "Each menu item is associated with a specific category and includes details such as name, description, price," +
        " and image URL.")
@Data
@Document("menu_items")
public class MenuItem {
    @Schema(description = "Unique identifier for the menu item", example = "682f1a2b3c4d5e6f78905678")
    @Id
    private String id;
    @Schema(description = "Identifier of the category this menu item belongs to", example = "682f1a2b3c4d5e6f78901234")
    @Indexed
    private String categoryId;
    @Schema(description = "Name of the menu item", example = "Cheeseburger")
    private String name;
    @Schema(description = "Description of the menu item", example = "A juicy grilled cheeseburger with lettuce, tomato," +
            " and pickles.")
    private String description;
    @Schema(description = "Price of the menu item", example = "9.99")
    private BigDecimal price;
    @Schema(description = "Image URL of the menu item", example = "http://example.com/images/cheeseburger.jpg")
    private String imageUrl;
    @Schema(description = "Time from which this item is available (null = always available)", example = "11:00")
    private LocalTime availableFrom;
    @Schema(description = "Time until which this item is available (null = always available)", example = "15:00")
    private LocalTime availableTo;
    @Schema(description = "Estimated preparation time in minutes", example = "20")
    private Integer preparationMinutes;
}

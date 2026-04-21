package com.gameseeker.ranking.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class GamePriceMessage {
    private String name;
    private String store;
    @JsonProperty("price_cents")
    private long priceCents;
    @JsonProperty("original_price_cents")
    private long originalPriceCents;
    private String currency;
    private String url;
    @JsonProperty("image_url")
    private String imageUrl;
}

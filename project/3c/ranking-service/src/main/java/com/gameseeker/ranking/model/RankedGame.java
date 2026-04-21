package com.gameseeker.ranking.model;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class RankedGame {
    private int rank;
    private String name;
    private String slug;
    private String store;
    private long priceCents;
    private long originalPriceCents;
    private String currency;
    private int discountPct;
    private String url;
    private String imageUrl;
}

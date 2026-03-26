package com.clickmunch.GeoService.entity;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.Transient;
import org.springframework.data.relational.core.mapping.Table;

@Data
@Table("locations")
public class Location {
    @Id
    private Long id;
    private Long restaurantId;
    private String name;
    private LocationType type;
    private Double latitude;
    private Double longitude;

    @Transient
    private String geom;
}

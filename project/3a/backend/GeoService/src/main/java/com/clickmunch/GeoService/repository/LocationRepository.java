package com.clickmunch.GeoService.repository;

import java.util.List;

import org.springframework.data.jdbc.repository.query.Query;
import org.springframework.data.repository.ListCrudRepository;
import org.springframework.data.repository.query.Param;

import com.clickmunch.GeoService.entity.Location;

public interface LocationRepository extends ListCrudRepository<Location, Long> {

    @Query("""
        SELECT id, restaurant_id, name, type, latitude, longitude
        FROM locations
        WHERE ST_DWithin(
            geom::geography,
            ST_SetSRID(ST_MakePoint(:longitude, :latitude), 4326)::geography,
            :radiusInKm * 1000
        )
        ORDER BY ST_Distance(
            geom::geography,
            ST_SetSRID(ST_MakePoint(:longitude, :latitude), 4326)::geography
        )
    """)
    List<Location> findNearby(
            @Param("latitude") Double latitude,
            @Param("longitude") Double longitude,
            @Param("radiusInKm") Double radiusInKm);

    @Query("SELECT * FROM locations WHERE type = :type ORDER BY name")
    List<Location> findByType(@Param("type") String type);

    @Query("""
        SELECT id, restaurant_id, name, type, latitude, longitude,
            ST_Distance(
                geom::geography,
                ST_SetSRID(ST_MakePoint(:longitude, :latitude), 4326)::geography
            ) AS distance_meters
        FROM locations
        WHERE ST_DWithin(
            geom::geography,
            ST_SetSRID(ST_MakePoint(:longitude, :latitude), 4326)::geography,
            :radiusInKm * 1000
        )
        AND type = :type
        ORDER BY ST_Distance(
            geom::geography,
            ST_SetSRID(ST_MakePoint(:longitude, :latitude), 4326)::geography
        )
    """)
    List<Location> findNearbyByType(
            @Param("latitude") Double latitude,
            @Param("longitude") Double longitude,
            @Param("radiusInKm") Double radiusInKm,
            @Param("type") String type);

    @Query("""
        SELECT ST_Distance(
            (SELECT geom::geography FROM locations WHERE restaurant_id = :restaurantId LIMIT 1),
            ST_SetSRID(ST_MakePoint(:longitude, :latitude), 4326)::geography
        ) AS distance_meters
    """)
    Double calculateDistance(
            @Param("restaurantId") Long restaurantId,
            @Param("latitude") Double latitude,
            @Param("longitude") Double longitude);

}

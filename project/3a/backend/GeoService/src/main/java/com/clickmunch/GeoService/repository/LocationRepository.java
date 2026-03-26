package com.clickmunch.GeoService.repository;

import com.clickmunch.GeoService.entity.Location;
import org.springframework.data.jdbc.repository.query.Query;
import org.springframework.data.repository.ListCrudRepository;
import org.springframework.data.repository.query.Param;

import java.util.List;

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

}

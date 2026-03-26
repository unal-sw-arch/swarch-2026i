package com.clickmunch.GeoService.repository;

import com.clickmunch.GeoService.config.TestPostgisConfig;
import com.clickmunch.GeoService.entity.Location;
import com.clickmunch.GeoService.entity.LocationType;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jdbc.test.autoconfigure.DataJdbcTest;
import org.springframework.context.annotation.Import;

import java.util.List;

@DataJdbcTest
@Import(TestPostgisConfig.class)
public class LocationRepositoryTest {

    @Autowired
    private LocationRepository locationRepository;

    @Test
    public void findNearbyTest() {
        Location location = new Location();
        location.setName("Test Location");
        location.setLatitude(12.9716);
        location.setLongitude(77.5946);
        location.setType(LocationType.RESTAURANT);

        locationRepository.save(location);

        List<Location> nearbyLocations = locationRepository.findNearby(12.9716, 77.5946, 5.0);
        assert !nearbyLocations.isEmpty();
        assert nearbyLocations.getFirst().getName().equals("Test Location");


    }

}

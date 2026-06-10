package com.clickmunch.GeoService.service;

import com.clickmunch.GeoService.entity.Location;
import com.clickmunch.GeoService.repository.LocationRepository;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.util.List;

public class LocationServiceTest {

    @Test
    void testFindNearbyLocations() {

        LocationRepository locationRepository = Mockito.mock(LocationRepository.class);
        LocationService locationService = new LocationService(locationRepository);

        Location location = new Location();
        location.setId(1L);
        location.setName("Test Location");
        location.setLatitude(12.9716);
        location.setLongitude(77.5946);

        Mockito.when(locationRepository.findNearby(12.9716, 77.5946, 5.0))
               .thenReturn(java.util.List.of(location));
        List<Location> nearbyLocations = locationService.findNearby(12.9716, 77.5946, 5.0);

        assert nearbyLocations.size() == 1;
        assert nearbyLocations.getFirst().getName().equals("Test Location");

        Mockito.verify(locationRepository).findNearby(12.9716, 77.5946, 5.0);
    }
}

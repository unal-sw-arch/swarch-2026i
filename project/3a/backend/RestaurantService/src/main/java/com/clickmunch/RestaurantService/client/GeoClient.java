package com.clickmunch.RestaurantService.client;

import com.clickmunch.RestaurantService.dto.LocationDto;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.Arrays;
import java.util.List;
import java.util.Map;

@Component
public class GeoClient {

    private final RestTemplate restTemplate = new RestTemplate();
    private static final String GEO_URL = "http://localhost:8083/api/geo";


    public Long createLocation(String name, Double latitude, Double longitude) {
        Map<String, Object> request = Map.of(
                "name", name,
                "type", "RESTAURANT",
                "latitude", latitude,
                "longitude", longitude
        );

        Map response = restTemplate.postForObject(GEO_URL + "/locations", request, Map.class);
        assert response != null;
        return Long.valueOf(response.get("id").toString());
    }

    public List<LocationDto> findNearbyLocations(Double latitude, Double longitude, Double radiusInKm) {
        Map<String, Object> request = Map.of(
                "latitude", latitude,
                "longitude", longitude,
                "radiusInKm", radiusInKm
        );

        LocationDto[] response = restTemplate.postForObject(GEO_URL + "/nearby", request, LocationDto[].class);
        assert response != null;
        return Arrays.asList(response);
    }

    public LocationDto getLocationById(Long locationId) {
        return restTemplate.getForObject(GEO_URL + "/locations/" + locationId, LocationDto.class);
    }

    public String getAddressById(Long locationId) {
        LocationDto location = getLocationById(locationId);
        if (location != null) {
            return location.address();
        }
        return null;
    }

}

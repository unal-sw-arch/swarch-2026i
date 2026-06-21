package com.clickmunch.GeoService.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.clickmunch.GeoService.dto.LocationRequest;
import com.clickmunch.GeoService.dto.LocationResponse;
import com.clickmunch.GeoService.dto.NearbySearchRequest;
import com.clickmunch.GeoService.entity.Location;
import com.clickmunch.GeoService.entity.LocationType;
import com.clickmunch.GeoService.service.LocationService;

@RestController
@RequestMapping("/api/geo")
public class LocationController {

    private final LocationService locationService;

    public LocationController(LocationService locationService) {
        this.locationService = locationService;
    }

    @PostMapping("/locations")
    public ResponseEntity<Location> addLocation(@RequestBody LocationRequest locationRequest) {
        Location location = new Location();
        location.setRestaurantId(locationRequest.restaurantId());
        location.setName(locationRequest.name());
        location.setType(Enum.valueOf(LocationType.class, locationRequest.type()));
        location.setLatitude(locationRequest.latitude());
        location.setLongitude(locationRequest.longitude());

        Location savedLocation = locationService.save(location);

        assert savedLocation != null;
        LocationResponse locationResponse = new LocationResponse(
                savedLocation.getId(),
                savedLocation.getRestaurantId(),
                savedLocation.getName(),
                savedLocation.getType().name(),
                savedLocation.getLatitude(),
                savedLocation.getLongitude(),
                null
        );

        return ResponseEntity.ok(locationService.save(location));
    }

    @PostMapping("/nearby")
    public ResponseEntity<List<LocationResponse>> getNearbyLocations(@RequestBody NearbySearchRequest nearbySearchRequest){
        List<Location> locations;
        if (nearbySearchRequest.type() != null && !nearbySearchRequest.type().isBlank()) {
            locations = locationService.findNearbyByType(
                    nearbySearchRequest.latitude(),
                    nearbySearchRequest.longitude(),
                    nearbySearchRequest.radiusInKm(),
                    nearbySearchRequest.type()
            );
        } else {
            locations = locationService.findNearby(
                    nearbySearchRequest.latitude(),
                    nearbySearchRequest.longitude(),
                    nearbySearchRequest.radiusInKm()
            );
        }
        var locationResponses = locations.stream().map(location -> new LocationResponse(
                location.getId(),
                location.getRestaurantId(),
                location.getName(),
                location.getType().name(),
                location.getLatitude(),
                location.getLongitude(),
                null
        )).toList();
        return ResponseEntity.ok(locationResponses);
    }

    @GetMapping("/locations/type/{type}")
    public ResponseEntity<List<LocationResponse>> getLocationsByType(@PathVariable String type) {
        List<Location> locations = locationService.findByType(type);
        var locationResponses = locations.stream().map(location -> new LocationResponse(
                location.getId(),
                location.getRestaurantId(),
                location.getName(),
                location.getType().name(),
                location.getLatitude(),
                location.getLongitude(),
                null
        )).toList();
        return ResponseEntity.ok(locationResponses);
    }

    @GetMapping("/distance")
    public ResponseEntity<Double> getDistance(
            @RequestParam Long restaurantId,
            @RequestParam Double latitude,
            @RequestParam Double longitude) {
        Double distance = locationService.calculateDistance(restaurantId, latitude, longitude);
        return ResponseEntity.ok(distance);
    }

    @GetMapping("/eta")
    public ResponseEntity<Double> getEta(
            @RequestParam Long restaurantId,
            @RequestParam Double latitude,
            @RequestParam Double longitude) {
        Double etaMinutes = locationService.estimateEtaMinutes(restaurantId, latitude, longitude);
        return ResponseEntity.ok(etaMinutes);
    }

    @GetMapping("/locations")
    public ResponseEntity<List<Location>> getAllLocations() {
        List<Location> locations = locationService.findAll();
        return ResponseEntity.ok(locations);
    }


    }

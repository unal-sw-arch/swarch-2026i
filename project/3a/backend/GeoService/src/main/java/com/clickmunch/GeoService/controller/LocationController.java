package com.clickmunch.GeoService.controller;

import com.clickmunch.GeoService.dto.LocationRequest;
import com.clickmunch.GeoService.dto.LocationResponse;
import com.clickmunch.GeoService.dto.NearbySearchRequest;
import com.clickmunch.GeoService.entity.Location;
import com.clickmunch.GeoService.entity.LocationType;
import com.clickmunch.GeoService.service.LocationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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
        List<Location> locations = locationService.findNearby(
                nearbySearchRequest.latitude(),
                nearbySearchRequest.longitude(),
                nearbySearchRequest.radiusInKm()
        );
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

    @GetMapping("/locations")
    public ResponseEntity<List<Location>> getAllLocations() {
        List<Location> locations = locationService.findAll();
        return ResponseEntity.ok(locations);
    }


    }

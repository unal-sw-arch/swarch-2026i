package com.clickmunch.GeoService.service;

import java.util.List;

import org.jspecify.annotations.Nullable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.clickmunch.GeoService.entity.Location;
import com.clickmunch.GeoService.repository.LocationRepository;

@Service
public class LocationService {
    private final LocationRepository locationRepository;

    public LocationService(LocationRepository locationRepository) {
        this.locationRepository = locationRepository;
    }

    public List<Location> findNearby(Double latitude, Double longitude, Double radiusInKm) {
        return locationRepository.findNearby(latitude, longitude, radiusInKm);
    }

    public List<Location> findNearbyByType(Double latitude, Double longitude, Double radiusInKm, String type) {
        return locationRepository.findNearbyByType(latitude, longitude, radiusInKm, type);
    }

    public List<Location> findByType(String type) {
        return locationRepository.findByType(type);
    }

    public Double calculateDistance(Long restaurantId, Double latitude, Double longitude) {
        return locationRepository.calculateDistance(restaurantId, latitude, longitude);
    }

    public Double estimateEtaMinutes(Long restaurantId, Double latitude, Double longitude) {
        Double distanceMeters = calculateDistance(restaurantId, latitude, longitude);
        if (distanceMeters == null) return null;
        // Average walking speed ~5 km/h = 83.3 m/min; driving ~40 km/h = 666.7 m/min
        // Use driving estimate as default
        return Math.ceil(distanceMeters / 666.7);
    }

    @Transactional
    public @Nullable Location save(Location location) {
        return locationRepository.save(location);
    }

    public List<Location> findAll() {
        return locationRepository.findAll();
    }
}

package com.clickmunch.GeoService.service;

import com.clickmunch.GeoService.entity.Location;
import com.clickmunch.GeoService.repository.LocationRepository;
import org.jspecify.annotations.Nullable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class LocationService {
    private final LocationRepository locationRepository;

    public LocationService(LocationRepository locationRepository) {
        this.locationRepository = locationRepository;
    }

    public List<Location> findNearby(Double latitude, Double longitude, Double radiusInKm) {
        return locationRepository.findNearby(latitude, longitude, radiusInKm);
    }

    @Transactional
    public @Nullable Location save(Location location) {
        return locationRepository.save(location);
    }

    public List<Location> findAll() {
        return locationRepository.findAll();
    }
}

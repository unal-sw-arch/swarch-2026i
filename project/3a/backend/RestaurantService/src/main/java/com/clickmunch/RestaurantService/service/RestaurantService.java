package com.clickmunch.RestaurantService.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;

import com.clickmunch.RestaurantService.client.AuthClient;
import com.clickmunch.RestaurantService.client.GeoClient;
import com.clickmunch.RestaurantService.client.MenuClient;
import com.clickmunch.RestaurantService.dto.AuthUserResponse;
import com.clickmunch.RestaurantService.dto.CreateRestaurantRequest;
import com.clickmunch.RestaurantService.dto.LocationDto;
import com.clickmunch.RestaurantService.dto.RestaurantDetailsResponse;
import com.clickmunch.RestaurantService.dto.RestaurantResponse;
import com.clickmunch.RestaurantService.entity.Restaurant;
import com.clickmunch.RestaurantService.repository.RestaurantRepository;

@Service
public class RestaurantService {

    private final RestaurantRepository restaurantRepository;
    private final GeoClient geoClient;
    private final AuthClient authClient;
    private final MenuClient menuClient;

    public RestaurantService(RestaurantRepository restaurantRepository, GeoClient geoClient, AuthClient authClient, MenuClient menuClient) {
        this.restaurantRepository = restaurantRepository;
        this.geoClient = geoClient;
        this.authClient = authClient;
        this.menuClient = menuClient;
    }

    public RestaurantResponse createRestaurant(CreateRestaurantRequest request) {

        AuthUserResponse restaurantOwner = authClient.getUserDetails(request.ownerId());
        if (restaurantOwner == null) {
            throw new RuntimeException("Owner not found");
        }

        if (!"RESTAURANT_MANAGER".equals(restaurantOwner.role())) {
            throw new HttpClientErrorException(org.springframework.http.HttpStatus.FORBIDDEN, "User is not a restaurant manager");
        }
        Long locationId = geoClient.createLocation(
                request.name(),
                request.latitude(),
                request.longitude()
        );

        var restaurant = new Restaurant();
        restaurant.setOwnerId(request.ownerId());
        restaurant.setName(request.name());
        restaurant.setDescription(request.description());
        restaurant.setPhone(request.phone());
        restaurant.setEmail(request.email());
        restaurant.setImageUrl(request.imageUrl());
        restaurant.setLocationId(locationId);

        var savedRestaurant = restaurantRepository.save(restaurant);

        return new RestaurantResponse(
                savedRestaurant.getId(),
                savedRestaurant.getName(),
                savedRestaurant.getDescription(),
                savedRestaurant.getPhone(),
                savedRestaurant.getEmail(),
                savedRestaurant.getImageUrl(),
                savedRestaurant.getLocationId()
        );
    }

    public RestaurantResponse getRestaurant(Long id) {
        var restaurant = restaurantRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Restaurant not found"));

        return new RestaurantResponse(
                restaurant.getId(),
                restaurant.getName(),
                restaurant.getDescription(),
                restaurant.getPhone(),
                restaurant.getEmail(),
                restaurant.getImageUrl(),
                restaurant.getLocationId()
        );
    }

    public List<RestaurantResponse> listByOwnerId(Long ownerId) {
        List<Restaurant> restaurants = restaurantRepository.findByOwnerId(ownerId);
        return restaurants.stream().map(restaurant -> new RestaurantResponse(
                restaurant.getId(),
                restaurant.getName(),
                restaurant.getDescription(),
                restaurant.getPhone(),
                restaurant.getEmail(),
                restaurant.getImageUrl(),
                restaurant.getLocationId()
        )).toList();
    }

    public List<RestaurantResponse> findNearby(Double latitude, Double longitude, Double radiusInKm) {
        List<LocationDto> locationIds = geoClient.findNearbyLocations(latitude, longitude, radiusInKm);
        if (locationIds.isEmpty()) {
            return List.of();
        } else {
            List<Long> locIds = locationIds.stream().map(LocationDto::id).toList();
            List<Restaurant> restaurants = restaurantRepository.findAllByLocationIdIn(locIds);
            return restaurants.stream().map(restaurant -> new RestaurantResponse(
                    restaurant.getId(),
                    restaurant.getName(),
                    restaurant.getDescription(),
                    restaurant.getPhone(),
                    restaurant.getEmail(),
                    restaurant.getImageUrl(),
                    restaurant.getLocationId()
            )).toList();
        }
    }


    public RestaurantDetailsResponse getRestaurantDetails(Long id) {
        var restaurant = restaurantRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Restaurant not found"));

        var menuCategories = menuClient.getMenuByRestaurant(id);

        return new RestaurantDetailsResponse(
                restaurant.getId(),
                restaurant.getName(),
                geoClient.getAddressById(restaurant.getId()),
                geoClient.getLocationById(restaurant.getId()).latitude(),
                geoClient.getLocationById(restaurant.getId()).longitude(),
                restaurant.getDescription(),
                restaurant.getImageUrl(),
                menuCategories
        );
    }
}

package com.clickmunch.RestaurantService.service;

import com.clickmunch.RestaurantService.client.AuthClient;
import com.clickmunch.RestaurantService.client.GeoClient;
import com.clickmunch.RestaurantService.client.MenuClient;
import com.clickmunch.RestaurantService.dto.*;
import com.clickmunch.RestaurantService.entity.Restaurant;
import com.clickmunch.RestaurantService.repository.RestaurantRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.client.HttpClientErrorException;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RestaurantServiceTest {

    @Mock
    private RestaurantRepository restaurantRepository;

    @Mock
    private GeoClient geoClient;

    @Mock
    private AuthClient authClient;

    @Mock
    private MenuClient menuClient;

    @InjectMocks
    private RestaurantService restaurantService;

    private Restaurant testRestaurant;
    private CreateRestaurantRequest createRequest;

    @BeforeEach
    void setUp() {
        testRestaurant = new Restaurant();
        testRestaurant.setId(1L);
        testRestaurant.setName("Test Restaurant");
        testRestaurant.setOwnerId(2L);
        testRestaurant.setDescription("Test Description");
        testRestaurant.setPhone("123-456-7890");
        testRestaurant.setEmail("test@restaurant.com");
        testRestaurant.setLocationId(10L);

        createRequest = new CreateRestaurantRequest(
                2L, "Test Restaurant", "Test Description",
                "123-456-7890", "test@restaurant.com", 40.7128, -74.0060
        );
    }

    @Test
    void createRestaurant_withValidOwner_returnsRestaurantResponse() {
        AuthUserResponse owner = new AuthUserResponse("owner@test.com", "RESTAURANT_MANAGER");
        when(authClient.getUserDetails(2L)).thenReturn(owner);
        when(geoClient.createLocation(anyString(), anyDouble(), anyDouble())).thenReturn(10L);
        when(restaurantRepository.save(any(Restaurant.class))).thenReturn(testRestaurant);

        RestaurantResponse response = restaurantService.createRestaurant(createRequest);

        assertNotNull(response);
        assertEquals(1L, response.id());
        assertEquals("Test Restaurant", response.name());
        verify(restaurantRepository).save(any(Restaurant.class));
    }

    @Test
    void createRestaurant_withNullOwner_throwsException() {
        when(authClient.getUserDetails(2L)).thenReturn(null);

        assertThrows(RuntimeException.class, () -> restaurantService.createRestaurant(createRequest));
        verify(restaurantRepository, never()).save(any());
    }

    @Test
    void createRestaurant_withNonManagerRole_throwsForbidden() {
        AuthUserResponse owner = new AuthUserResponse("user@test.com", "CUSTOMER");
        when(authClient.getUserDetails(2L)).thenReturn(owner);

        assertThrows(HttpClientErrorException.class, () -> restaurantService.createRestaurant(createRequest));
        verify(restaurantRepository, never()).save(any());
    }

    @Test
    void getRestaurant_withValidId_returnsRestaurant() {
        when(restaurantRepository.findById(1L)).thenReturn(Optional.of(testRestaurant));

        RestaurantResponse response = restaurantService.getRestaurant(1L);

        assertNotNull(response);
        assertEquals(1L, response.id());
        assertEquals("Test Restaurant", response.name());
    }

    @Test
    void getRestaurant_withInvalidId_throwsException() {
        when(restaurantRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> restaurantService.getRestaurant(999L));
    }

    @Test
    void listByOwnerId_returnsRestaurantList() {
        when(restaurantRepository.findByOwnerId(2L)).thenReturn(List.of(testRestaurant));

        List<RestaurantResponse> responses = restaurantService.listByOwnerId(2L);

        assertEquals(1, responses.size());
        assertEquals("Test Restaurant", responses.getFirst().name());
    }

    @Test
    void listByOwnerId_withNoRestaurants_returnsEmptyList() {
        when(restaurantRepository.findByOwnerId(999L)).thenReturn(List.of());

        List<RestaurantResponse> responses = restaurantService.listByOwnerId(999L);

        assertTrue(responses.isEmpty());
    }

    @Test
    void findNearby_withNearbyLocations_returnsRestaurants() {
        LocationDto location = new LocationDto(10L, "Test Restaurant", "building",40.7128, -74.0060, "123 Test St");
        when(geoClient.findNearbyLocations(40.7128, -74.0060, 5.0)).thenReturn(List.of(location));
        when(restaurantRepository.findAllByLocationIdIn(List.of(10L))).thenReturn(List.of(testRestaurant));

        List<RestaurantResponse> responses = restaurantService.findNearby(40.7128, -74.0060, 5.0);

        assertEquals(1, responses.size());
    }

    @Test
    void findNearby_withNoNearbyLocations_returnsEmptyList() {
        when(geoClient.findNearbyLocations(anyDouble(), anyDouble(), anyDouble())).thenReturn(List.of());

        List<RestaurantResponse> responses = restaurantService.findNearby(40.7128, -74.0060, 5.0);

        assertTrue(responses.isEmpty());
        verify(restaurantRepository, never()).findAllByLocationIdIn(any());
    }

    @Test
    void getRestaurantDetails_returnsCompleteDetails() {
        LocationDto location = new LocationDto(10L, "Test Restaurant", "building",40.7128, -74.0060, "123 Test St");
        when(restaurantRepository.findById(1L)).thenReturn(Optional.of(testRestaurant));
        when(menuClient.getMenuByRestaurant(1L)).thenReturn(List.of());
        when(geoClient.getAddressById(1L)).thenReturn("123 Test St");
        when(geoClient.getLocationById(1L)).thenReturn(location);

        RestaurantDetailsResponse response = restaurantService.getRestaurantDetails(1L);

        assertNotNull(response);
        assertEquals(1L, response.id());
        assertEquals("Test Restaurant", response.name());
    }

    @Test
    void getRestaurantDetails_withInvalidId_throwsException() {
        when(restaurantRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> restaurantService.getRestaurantDetails(999L));
    }
}

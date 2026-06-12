package com.clickmunch.RestaurantService.service;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.HttpClientErrorException;

import com.clickmunch.RestaurantService.client.AuthClient;
import com.clickmunch.RestaurantService.client.GeoClient;
import com.clickmunch.RestaurantService.client.MenuClient;
import com.clickmunch.RestaurantService.dto.*;
import com.clickmunch.RestaurantService.entity.OperatingHours;
import com.clickmunch.RestaurantService.entity.Restaurant;
import com.clickmunch.RestaurantService.entity.RestaurantAdmin;
import com.clickmunch.RestaurantService.entity.RestaurantProfile;
import com.clickmunch.RestaurantService.entity.RestaurantTable;
import com.clickmunch.RestaurantService.entity.StaffAssignment;
import com.clickmunch.RestaurantService.repository.OperatingHoursRepository;
import com.clickmunch.RestaurantService.repository.RestaurantAdminRepository;
import com.clickmunch.RestaurantService.repository.RestaurantProfileRepository;
import com.clickmunch.RestaurantService.repository.RestaurantRepository;
import com.clickmunch.RestaurantService.repository.RestaurantTableRepository;
import com.clickmunch.RestaurantService.repository.StaffAssignmentRepository;

@Service
public class RestaurantService {

    private final RestaurantRepository restaurantRepository;
    private final RestaurantProfileRepository restaurantProfileRepository;
    private final RestaurantTableRepository tableRepository;
    private final OperatingHoursRepository hoursRepository;
    private final StaffAssignmentRepository staffRepository;
    private final RestaurantAdminRepository adminRepository;
    private final GeoClient geoClient;
    private final AuthClient authClient;
    private final MenuClient menuClient;

    public RestaurantService(RestaurantRepository restaurantRepository,
                             RestaurantProfileRepository restaurantProfileRepository,
                             RestaurantTableRepository tableRepository,
                             OperatingHoursRepository hoursRepository,
                             StaffAssignmentRepository staffRepository,
                             RestaurantAdminRepository adminRepository,
                             GeoClient geoClient, AuthClient authClient, MenuClient menuClient) {
        this.restaurantRepository = restaurantRepository;
        this.restaurantProfileRepository = restaurantProfileRepository;
        this.tableRepository = tableRepository;
        this.hoursRepository = hoursRepository;
        this.staffRepository = staffRepository;
        this.adminRepository = adminRepository;
        this.geoClient = geoClient;
        this.authClient = authClient;
        this.menuClient = menuClient;
    }

    // ─── Restaurant CRUD ───

    public RestaurantResponse createRestaurant(CreateRestaurantRequest request) {
        AuthUserResponse restaurantOwner = authClient.getUserDetails(request.ownerId());
        if (restaurantOwner == null) {
            throw new RuntimeException("Owner not found");
        }
        if (!"RESTAURANT_MANAGER".equals(restaurantOwner.role())) {
            throw new HttpClientErrorException(org.springframework.http.HttpStatus.FORBIDDEN, "User is not a restaurant manager");
        }

        String placeType = request.placeType() != null ? request.placeType() : "RESTAURANT";
        Long locationId = geoClient.createLocation(request.name(), request.latitude(), request.longitude(), placeType);

        var restaurant = new Restaurant();
        restaurant.setOwnerId(request.ownerId());
        restaurant.setName(request.name());
        restaurant.setDescription(request.description());
        restaurant.setPhone(request.phone());
        restaurant.setEmail(request.email());
        restaurant.setImageUrl(request.imageUrl());
        restaurant.setLocationId(locationId);
        restaurant.setPlaceType(placeType);

        var savedRestaurant = restaurantRepository.save(restaurant);

        // Auto-add the creator as a restaurant admin
        RestaurantAdmin admin = RestaurantAdmin.builder()
                .restaurantId(savedRestaurant.getId())
                .userId(request.ownerId())
                .assignedAt(LocalDateTime.now())
                .build();
        adminRepository.save(admin);

        return toResponse(savedRestaurant);
    }

    public RestaurantResponse getRestaurant(Long id) {
        var restaurant = restaurantRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Restaurant not found"));
        return toResponse(restaurant);
    }

    public List<RestaurantResponse> listByOwnerId(Long ownerId) {
        return restaurantRepository.findByOwnerId(ownerId).stream()
                .map(this::toResponse).toList();
    }

    public List<RestaurantResponse> findNearby(Double latitude, Double longitude, Double radiusInKm) {
        List<LocationDto> locationIds = geoClient.findNearbyLocations(latitude, longitude, radiusInKm);
        if (locationIds.isEmpty()) return List.of();
        List<Long> locIds = locationIds.stream().map(LocationDto::id).toList();
        return restaurantRepository.findAllByLocationIdIn(locIds).stream()
                .map(this::toResponse).toList();
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

    public List<RestaurantCardResponse> listRestaurantCards(Double userLat, Double userLng) {
        List<Restaurant> restaurants = restaurantRepository.findAll();
        if (restaurants.isEmpty()) return List.of();

        List<Long> restaurantIds = restaurants.stream().map(Restaurant::getId).toList();
        Map<Long, RestaurantProfile> profilesByRestaurantId = restaurantProfileRepository
                .findByRestaurantIdIn(restaurantIds)
                .stream()
                .collect(Collectors.toMap(RestaurantProfile::getRestaurantId, p -> p));

        List<RestaurantCardResponse> cards = restaurants.stream().map(restaurant -> {
            RestaurantProfile profile = profilesByRestaurantId.get(restaurant.getId());

            String category = profile != null && profile.getCategory() != null ? profile.getCategory() : "General";
            String city = profile != null && profile.getCity() != null ? profile.getCity() : "Bogota";
            Double rating = profile != null && profile.getRating() != null ? profile.getRating() : 4.0;
            String deliveryTime = profile != null && profile.getDeliveryTime() != null ? profile.getDeliveryTime() : "30 min";
            String price = profile != null && profile.getAvgPrice() != null ? profile.getAvgPrice() : "$ 0";
            String badge = profile != null ? profile.getBadge() : null;
            Double latitude = profile != null && profile.getLatitude() != null ? profile.getLatitude() : 4.711;
            Double longitude = profile != null && profile.getLongitude() != null ? profile.getLongitude() : -74.0721;
            Boolean freeShipping = profile != null && Boolean.TRUE.equals(profile.getFreeShipping());
            Double distanceKm = (userLat != null && userLng != null)
                    ? haversine(userLat, userLng, latitude, longitude)
                    : null;

            return new RestaurantCardResponse(
                    restaurant.getId(), restaurant.getName(), restaurant.getImageUrl(),
                    rating, deliveryTime, price, badge, category, city,
                    latitude, longitude, freeShipping, distanceKm);
        }).collect(Collectors.toList());

        if (userLat != null && userLng != null) {
            cards.sort(Comparator.comparingDouble(RestaurantCardResponse::distanceKm));
        }

        return cards;
    }

    private static double haversine(double lat1, double lon1, double lat2, double lon2) {
        final double R = 6371.0;
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }

    // ─── Table Management ───

    @Transactional
    public TableResponse createTable(Long restaurantId, CreateTableRequest request) {
        restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new RuntimeException("Restaurant not found"));
        RestaurantTable table = RestaurantTable.builder()
                .restaurantId(restaurantId)
                .tableNumber(request.tableNumber())
                .seats(request.seats())
                .status("AVAILABLE")
                .build();
        RestaurantTable saved = tableRepository.save(table);
        return toTableResponse(saved);
    }

    public List<TableResponse> getTablesByRestaurant(Long restaurantId) {
        return tableRepository.findByRestaurantId(restaurantId).stream()
                .map(this::toTableResponse).toList();
    }

    public List<TableResponse> getAvailableTables(Long restaurantId, Integer partySize) {
        return tableRepository.findAvailableByRestaurantIdAndMinSeats(restaurantId, partySize).stream()
                .map(this::toTableResponse).toList();
    }

    @Transactional
    public TableResponse updateTableStatus(Long tableId, String status) {
        RestaurantTable table = tableRepository.findById(tableId)
                .orElseThrow(() -> new RuntimeException("Table not found"));
        table.setStatus(status);
        return toTableResponse(tableRepository.save(table));
    }

    @Transactional
    public void deleteTable(Long tableId) {
        tableRepository.deleteById(tableId);
    }

    // ─── Operating Hours ───

    @Transactional
    public OperatingHoursResponse createOperatingHours(Long restaurantId, OperatingHoursRequest request) {
        restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new RuntimeException("Restaurant not found"));
        OperatingHours hours = OperatingHours.builder()
                .restaurantId(restaurantId)
                .dayOfWeek(request.dayOfWeek())
                .openTime(request.openTime())
                .closeTime(request.closeTime())
                .build();
        OperatingHours saved = hoursRepository.save(hours);
        return toHoursResponse(saved);
    }

    public List<OperatingHoursResponse> getOperatingHours(Long restaurantId) {
        return hoursRepository.findByRestaurantId(restaurantId).stream()
                .map(this::toHoursResponse).toList();
    }

    @Transactional
    public OperatingHoursResponse updateOperatingHours(Long hoursId, OperatingHoursRequest request) {
        OperatingHours hours = hoursRepository.findById(hoursId)
                .orElseThrow(() -> new RuntimeException("Operating hours not found"));
        hours.setDayOfWeek(request.dayOfWeek());
        hours.setOpenTime(request.openTime());
        hours.setCloseTime(request.closeTime());
        return toHoursResponse(hoursRepository.save(hours));
    }

    @Transactional
    public void deleteOperatingHours(Long hoursId) {
        hoursRepository.deleteById(hoursId);
    }

    // ─── Staff Management ───

    @Transactional
    public StaffAssignmentResponse assignStaff(Long restaurantId, StaffAssignmentRequest request) {
        restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new RuntimeException("Restaurant not found"));
        StaffAssignment assignment = StaffAssignment.builder()
                .restaurantId(restaurantId)
                .userId(request.userId())
                .role(request.role())
                .active(true)
                .assignedAt(LocalDateTime.now())
                .build();
        StaffAssignment saved = staffRepository.save(assignment);
        return toStaffResponse(saved);
    }

    public List<StaffAssignmentResponse> getStaffByRestaurant(Long restaurantId) {
        return staffRepository.findByRestaurantId(restaurantId).stream()
                .map(this::toStaffResponse).toList();
    }

    public List<StaffAssignmentResponse> getActiveStaffByRole(Long restaurantId, String role) {
        return staffRepository.findActiveByRestaurantIdAndRole(restaurantId, role).stream()
                .map(this::toStaffResponse).toList();
    }

    @Transactional
    public StaffAssignmentResponse deactivateStaff(Long assignmentId) {
        StaffAssignment assignment = staffRepository.findById(assignmentId)
                .orElseThrow(() -> new RuntimeException("Staff assignment not found"));
        assignment.setActive(false);
        return toStaffResponse(staffRepository.save(assignment));
    }

    @Transactional
    public void removeStaff(Long assignmentId) {
        staffRepository.deleteById(assignmentId);
    }

    // ─── Restaurant Admin Management ───

    public List<RestaurantResponse> listByAdminUserId(Long userId) {
        return restaurantRepository.findByAdminUserId(userId).stream()
                .map(this::toResponse).toList();
    }

    @Transactional
    public RestaurantAdminResponse addAdmin(Long restaurantId, RestaurantAdminRequest request) {
        restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new RuntimeException("Restaurant not found"));
        RestaurantAdmin admin = RestaurantAdmin.builder()
                .restaurantId(restaurantId)
                .userId(request.userId())
                .assignedAt(LocalDateTime.now())
                .build();
        RestaurantAdmin saved = adminRepository.save(admin);
        return toAdminResponse(saved);
    }

    public List<RestaurantAdminResponse> getAdminsByRestaurant(Long restaurantId) {
        return adminRepository.findByRestaurantId(restaurantId).stream()
                .map(this::toAdminResponse).toList();
    }

    @Transactional
    public void removeAdmin(Long restaurantId, Long userId) {
        adminRepository.deleteByRestaurantIdAndUserId(restaurantId, userId);
    }

    // ─── Mappers ───

    private RestaurantResponse toResponse(Restaurant r) {
        return new RestaurantResponse(r.getId(), r.getName(), r.getDescription(),
                r.getPhone(), r.getEmail(), r.getImageUrl(), r.getPlaceType(), r.getLocationId());
    }

    private TableResponse toTableResponse(RestaurantTable t) {
        return new TableResponse(t.getId(), t.getRestaurantId(), t.getTableNumber(), t.getSeats(), t.getStatus());
    }

    private OperatingHoursResponse toHoursResponse(OperatingHours h) {
        return new OperatingHoursResponse(h.getId(), h.getRestaurantId(), h.getDayOfWeek(), h.getOpenTime(), h.getCloseTime());
    }

    private StaffAssignmentResponse toStaffResponse(StaffAssignment s) {
        return new StaffAssignmentResponse(s.getId(), s.getRestaurantId(), s.getUserId(), s.getRole(), s.getActive(), s.getAssignedAt());
    }

    private RestaurantAdminResponse toAdminResponse(RestaurantAdmin a) {
        return new RestaurantAdminResponse(a.getId(), a.getRestaurantId(), a.getUserId(), a.getAssignedAt());
    }
}


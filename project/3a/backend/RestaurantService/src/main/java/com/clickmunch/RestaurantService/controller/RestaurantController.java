package com.clickmunch.RestaurantService.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.clickmunch.RestaurantService.client.AuthClient;
import com.clickmunch.RestaurantService.dto.CreateRestaurantRequest;
import com.clickmunch.RestaurantService.dto.CreateTableRequest;
import com.clickmunch.RestaurantService.dto.NearbySearchRequest;
import com.clickmunch.RestaurantService.dto.OperatingHoursRequest;
import com.clickmunch.RestaurantService.dto.OperatingHoursResponse;
import com.clickmunch.RestaurantService.dto.RestaurantAdminRequest;
import com.clickmunch.RestaurantService.dto.RestaurantAdminResponse;
import com.clickmunch.RestaurantService.dto.RestaurantCardResponse;
import com.clickmunch.RestaurantService.dto.RestaurantDetailsResponse;
import com.clickmunch.RestaurantService.dto.RestaurantResponse;
import com.clickmunch.RestaurantService.dto.StaffAssignmentRequest;
import com.clickmunch.RestaurantService.dto.StaffAssignmentResponse;
import com.clickmunch.RestaurantService.dto.TableResponse;
import com.clickmunch.RestaurantService.service.RestaurantService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/restaurants")
public class RestaurantController {

    private final RestaurantService restaurantService;
    private final AuthClient authClient;

    public RestaurantController(RestaurantService restaurantService, AuthClient authClient) {
        this.restaurantService = restaurantService;
        this.authClient = authClient;
    }

    // ─── Restaurant CRUD ───

    @PostMapping
    public RestaurantResponse createRestaurant(@RequestBody CreateRestaurantRequest createRestaurantRequest) {
        return restaurantService.createRestaurant(createRestaurantRequest);
    }

    @GetMapping("/{id}")
    public RestaurantResponse getRestaurant(@PathVariable Long id) {
        return restaurantService.getRestaurant(id);
    }

    @GetMapping("/owner/{ownerId}")
    public ResponseEntity<List<RestaurantResponse>> getRestaurantsByOwnerId(@PathVariable Long ownerId) {
        var authUser = authClient.getUserDetails(ownerId);
        if (authUser == null) {
            return ResponseEntity.status(404).build();
        }
        var restaurants = restaurantService.listByOwnerId(ownerId);
        return ResponseEntity.ok(restaurants);
    }

    @GetMapping("/cards")
    public ResponseEntity<List<RestaurantCardResponse>> getRestaurantCards() {
        return ResponseEntity.ok(restaurantService.listRestaurantCards());
    }

    @GetMapping("/nearby")
    public ResponseEntity<List<RestaurantResponse>> getNearbyRestaurants(
            @RequestBody NearbySearchRequest nearbySearchRequest) {
        var restaurants = restaurantService.findNearby(
                nearbySearchRequest.latitude(),
                nearbySearchRequest.longitude(),
                nearbySearchRequest.radiusInKm());
        return ResponseEntity.ok(restaurants);
    }

    @GetMapping("/{id}/details")
    public ResponseEntity<RestaurantDetailsResponse> getRestaurantDetails(@PathVariable Long id) {
        return ResponseEntity.ok(restaurantService.getRestaurantDetails(id));
    }

    // ─── Restaurant Admin Management ───

    @GetMapping("/admin/{userId}")
    public ResponseEntity<List<RestaurantResponse>> getRestaurantsByAdmin(@PathVariable Long userId) {
        return ResponseEntity.ok(restaurantService.listByAdminUserId(userId));
    }

    @PostMapping("/{restaurantId}/admins")
    public ResponseEntity<RestaurantAdminResponse> addAdmin(
            @PathVariable Long restaurantId,
            @Valid @RequestBody RestaurantAdminRequest request) {
        return ResponseEntity.ok(restaurantService.addAdmin(restaurantId, request));
    }

    @GetMapping("/{restaurantId}/admins")
    public ResponseEntity<List<RestaurantAdminResponse>> getAdmins(@PathVariable Long restaurantId) {
        return ResponseEntity.ok(restaurantService.getAdminsByRestaurant(restaurantId));
    }

    @DeleteMapping("/{restaurantId}/admins/{userId}")
    public ResponseEntity<Void> removeAdmin(
            @PathVariable Long restaurantId,
            @PathVariable Long userId) {
        restaurantService.removeAdmin(restaurantId, userId);
        return ResponseEntity.noContent().build();
    }

    // ─── Table Management ───

    @PostMapping("/{restaurantId}/tables")
    public ResponseEntity<TableResponse> createTable(
            @PathVariable Long restaurantId,
            @Valid @RequestBody CreateTableRequest request) {
        return ResponseEntity.ok(restaurantService.createTable(restaurantId, request));
    }

    @GetMapping("/{restaurantId}/tables")
    public ResponseEntity<List<TableResponse>> getTables(@PathVariable Long restaurantId) {
        return ResponseEntity.ok(restaurantService.getTablesByRestaurant(restaurantId));
    }

    @GetMapping("/{restaurantId}/tables/available")
    public ResponseEntity<List<TableResponse>> getAvailableTables(
            @PathVariable Long restaurantId,
            @RequestParam(defaultValue = "1") Integer partySize) {
        return ResponseEntity.ok(restaurantService.getAvailableTables(restaurantId, partySize));
    }

    @PutMapping("/tables/{tableId}/status")
    public ResponseEntity<TableResponse> updateTableStatus(
            @PathVariable Long tableId,
            @RequestParam String status) {
        return ResponseEntity.ok(restaurantService.updateTableStatus(tableId, status));
    }

    @DeleteMapping("/tables/{tableId}")
    public ResponseEntity<Void> deleteTable(@PathVariable Long tableId) {
        restaurantService.deleteTable(tableId);
        return ResponseEntity.noContent().build();
    }

    // ─── Operating Hours ───

    @PostMapping("/{restaurantId}/hours")
    public ResponseEntity<OperatingHoursResponse> createOperatingHours(
            @PathVariable Long restaurantId,
            @Valid @RequestBody OperatingHoursRequest request) {
        return ResponseEntity.ok(restaurantService.createOperatingHours(restaurantId, request));
    }

    @GetMapping("/{restaurantId}/hours")
    public ResponseEntity<List<OperatingHoursResponse>> getOperatingHours(@PathVariable Long restaurantId) {
        return ResponseEntity.ok(restaurantService.getOperatingHours(restaurantId));
    }

    @PutMapping("/hours/{hoursId}")
    public ResponseEntity<OperatingHoursResponse> updateOperatingHours(
            @PathVariable Long hoursId,
            @Valid @RequestBody OperatingHoursRequest request) {
        return ResponseEntity.ok(restaurantService.updateOperatingHours(hoursId, request));
    }

    @DeleteMapping("/hours/{hoursId}")
    public ResponseEntity<Void> deleteOperatingHours(@PathVariable Long hoursId) {
        restaurantService.deleteOperatingHours(hoursId);
        return ResponseEntity.noContent().build();
    }

    // ─── Staff Management ───

    @PostMapping("/{restaurantId}/staff")
    public ResponseEntity<StaffAssignmentResponse> assignStaff(
            @PathVariable Long restaurantId,
            @Valid @RequestBody StaffAssignmentRequest request) {
        return ResponseEntity.ok(restaurantService.assignStaff(restaurantId, request));
    }

    @GetMapping("/{restaurantId}/staff")
    public ResponseEntity<List<StaffAssignmentResponse>> getStaff(@PathVariable Long restaurantId) {
        return ResponseEntity.ok(restaurantService.getStaffByRestaurant(restaurantId));
    }

    @GetMapping("/{restaurantId}/staff/{role}")
    public ResponseEntity<List<StaffAssignmentResponse>> getStaffByRole(
            @PathVariable Long restaurantId,
            @PathVariable String role) {
        return ResponseEntity.ok(restaurantService.getActiveStaffByRole(restaurantId, role));
    }

    @PutMapping("/staff/{assignmentId}/deactivate")
    public ResponseEntity<StaffAssignmentResponse> deactivateStaff(@PathVariable Long assignmentId) {
        return ResponseEntity.ok(restaurantService.deactivateStaff(assignmentId));
    }

    @DeleteMapping("/staff/{assignmentId}")
    public ResponseEntity<Void> removeStaff(@PathVariable Long assignmentId) {
        restaurantService.removeStaff(assignmentId);
        return ResponseEntity.noContent().build();
    }
    
}

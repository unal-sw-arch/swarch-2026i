package com.clickmunch.GeoService.controller;

import com.clickmunch.GeoService.entity.Location;
import com.clickmunch.GeoService.entity.LocationType;
import com.clickmunch.GeoService.service.LocationService;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(LocationController.class)
class LocationControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private LocationService locationService;

    @Test
    void addLocation_returnsOk() throws Exception {
        Location saved = new Location();
        saved.setId(1L);
        saved.setRestaurantId(1L);
        saved.setName("Loc");
        saved.setType(LocationType.RESTAURANT);
        saved.setLatitude(1.0);
        saved.setLongitude(2.0);
        Mockito.when(locationService.save(Mockito.any())).thenReturn(saved);

        mockMvc.perform(post("/api/geo/locations")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"restaurantId\":1,\"name\":\"Loc\",\"type\":\"RESTAURANT\",\"latitude\":1.0,\"longitude\":2.0}"))
                .andExpect(status().isOk());
    }

    @Test
    void nearby_returnsOk() throws Exception {
        mockMvc.perform(post("/api/geo/nearby")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"latitude\":1.0,\"longitude\":2.0,\"radiusInKm\":3.0}"))
                .andExpect(status().isOk());
    }

    @Test
    void listLocations_returnsOk() throws Exception {
        mockMvc.perform(get("/api/geo/locations"))
                .andExpect(status().isOk());
    }
}

package com.clickmunch.GeoService.controller;

import com.clickmunch.GeoService.service.LocationService;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(LocationController.class)
class LocationControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private LocationService locationService;

    @Test
    void addLocation_returnsOk() throws Exception {
        Mockito.when(locationService.save(Mockito.any())).thenReturn(null);
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

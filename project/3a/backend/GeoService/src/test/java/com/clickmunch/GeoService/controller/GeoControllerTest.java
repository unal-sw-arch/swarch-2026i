package com.clickmunch.GeoService.controller;

import com.clickmunch.GeoService.entity.Location;
import com.clickmunch.GeoService.entity.LocationType;
import com.clickmunch.GeoService.service.LocationService;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(LocationController.class)
public class GeoControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private LocationService locationService;

    @Test
    void testNearbyEndpoint() throws Exception {
        Location location = new Location();
        location.setId(1L);
        location.setName("Test Location");
        location.setLatitude(12.9716);
        location.setLongitude(77.5946);
        location.setType(LocationType.RESTAURANT);

        Mockito.when(locationService.findNearby(12.9716, 77.5946, 5.0))
               .thenReturn(java.util.List.of(location));
        mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post("/api/geo/nearby")
                .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
                .content("{\"latitude\":12.9716,\"longitude\":77.5946,\"radiusInKm\":5.0}"))
               .andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.status().isOk())
               .andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath("$[0].name").value("Test Location"));

    }
}

package com.clickmunch.RestaurantService.controller;

import com.clickmunch.RestaurantService.client.AuthClient;
import com.clickmunch.RestaurantService.dto.CreateRestaurantRequest;
import com.clickmunch.RestaurantService.dto.RestaurantResponse;
import com.clickmunch.RestaurantService.service.RestaurantService;
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

@WebMvcTest(RestaurantController.class)
class RestaurantControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private RestaurantService restaurantService;

    @MockBean
    private AuthClient authClient;

    @Test
    void createRestaurant_returnsOk() throws Exception {
        Mockito.when(restaurantService.createRestaurant(Mockito.any(CreateRestaurantRequest.class)))
                .thenReturn(new RestaurantResponse(1L, "Resto", 2L));

        mockMvc.perform(post("/api/restaurants")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"name\":\"Resto\",\"ownerId\":2}"))
                .andExpect(status().isOk());
    }

    @Test
    void getRestaurant_returnsOk() throws Exception {
        Mockito.when(restaurantService.getRestaurant(1L))
                .thenReturn(new RestaurantResponse(1L, "Resto", 2L));

        mockMvc.perform(get("/api/restaurants/1"))
                .andExpect(status().isOk());
    }
}

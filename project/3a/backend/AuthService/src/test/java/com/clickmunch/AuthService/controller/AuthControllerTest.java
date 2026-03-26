package com.clickmunch.AuthService.controller;

import com.clickmunch.AuthService.dto.LoginRequest;
import com.clickmunch.AuthService.dto.RegisterRequest;
import com.clickmunch.AuthService.dto.ApiResponse;
import com.clickmunch.AuthService.service.AuthService;
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

@WebMvcTest(AuthController.class)
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AuthService authService;

    @Test
    void register_returnsOk() throws Exception {
        RegisterRequest req = new RegisterRequest("Plinio Rodolfo","plinio@example.com","plinieichon","123987","CUSTOMER");
        Mockito.when(authService.register(Mockito.any())).thenReturn(new ApiResponse<>("User registered successfully", null));

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\n  \"name\": \"Plinio Rodolfo\",\n  \"email\": \"plinio@example.com\",\n  \"username\": \"plinieichon\",\n  \"password\": \"123987\",\n  \"role\": \"CUSTOMER\"\n}"))
                .andExpect(status().isOk());
    }

    @Test
    void login_returnsOk() throws Exception {
        Mockito.when(authService.login(Mockito.any(LoginRequest.class))).thenReturn(new ApiResponse<>("token", null));

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"username\":\"user\",\"password\":\"pass\"}"))
                .andExpect(status().isOk());
    }

}

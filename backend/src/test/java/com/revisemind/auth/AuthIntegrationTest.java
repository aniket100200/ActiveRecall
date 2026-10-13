package com.revisemind.auth;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.revisemind.auth.dto.LoginRequest;
import com.revisemind.auth.dto.RegisterRequest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AuthIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void completeAuthenticationFlow() throws Exception {
        RegisterRequest registerReq = new RegisterRequest(
            "Test User",
            "testuser@example.com",
            "secret123",
            "Asia/Kolkata"
        );

        // 1. Register User
        MvcResult regResult = mockMvc.perform(post("/api/v1/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(registerReq)))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.token").isNotEmpty())
            .andExpect(jsonPath("$.user.email").value("testuser@example.com"))
            .andExpect(jsonPath("$.user.name").value("Test User"))
            .andReturn();

        String token = objectMapper.readTree(regResult.getResponse().getContentAsString()).get("token").asText();

        // 2. Reject duplicate registration
        mockMvc.perform(post("/api/v1/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(registerReq)))
            .andExpect(status().isBadRequest());

        // 3. Login User
        LoginRequest loginReq = new LoginRequest("testuser@example.com", "secret123");
        mockMvc.perform(post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginReq)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.token").isNotEmpty())
            .andExpect(jsonPath("$.user.email").value("testuser@example.com"));

        // 4. Login with Wrong Password
        LoginRequest wrongLoginReq = new LoginRequest("testuser@example.com", "wrongpassword");
        mockMvc.perform(post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(wrongLoginReq)))
            .andExpect(status().isBadRequest());

        // 5. Get Current User (/me) with valid token
        mockMvc.perform(get("/api/v1/auth/me")
                .header("Authorization", "Bearer " + token))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.email").value("testuser@example.com"))
            .andExpect(jsonPath("$.name").value("Test User"));

        // 6. Access /me without token fails with 401
        mockMvc.perform(get("/api/v1/auth/me"))
            .andExpect(status().isUnauthorized());
    }
}

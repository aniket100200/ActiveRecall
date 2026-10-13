package com.revisemind.study;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.revisemind.auth.dto.AuthResponse;
import com.revisemind.auth.dto.RegisterRequest;
import com.revisemind.study.dto.CreateStudySessionRequest;
import com.revisemind.subject.dto.CreateSubjectRequest;
import com.revisemind.topic.dto.CreateTopicRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.time.Instant;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class StudySessionIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private String user1Token;
    private String user2Token;
    private String user1TopicId;

    @BeforeEach
    void setUp() throws Exception {
        // Register User 1
        RegisterRequest u1 = new RegisterRequest("User One", "session_user1@example.com", "pass123", "Asia/Kolkata");
        MvcResult res1 = mockMvc.perform(post("/api/v1/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(u1)))
            .andExpect(status().isCreated())
            .andReturn();
        user1Token = objectMapper.readValue(res1.getResponse().getContentAsString(), AuthResponse.class).token();

        // Register User 2
        RegisterRequest u2 = new RegisterRequest("User Two", "session_user2@example.com", "pass123", "Asia/Kolkata");
        MvcResult res2 = mockMvc.perform(post("/api/v1/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(u2)))
            .andExpect(status().isCreated())
            .andReturn();
        user2Token = objectMapper.readValue(res2.getResponse().getContentAsString(), AuthResponse.class).token();

        // User 1 creates subject & topic
        CreateSubjectRequest createSubj = new CreateSubjectRequest("Physics", "Mechanics and Waves");
        MvcResult subjRes = mockMvc.perform(post("/api/v1/subjects")
                .header("Authorization", "Bearer " + user1Token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(createSubj)))
            .andExpect(status().isCreated())
            .andReturn();
        String subjectId = objectMapper.readTree(subjRes.getResponse().getContentAsString()).get("id").asText();

        CreateTopicRequest createTop = new CreateTopicRequest("Kinematics", "Motion in one and two dimensions");
        MvcResult topicRes = mockMvc.perform(post("/api/v1/subjects/" + subjectId + "/topics")
                .header("Authorization", "Bearer " + user1Token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(createTop)))
            .andExpect(status().isCreated())
            .andReturn();
        user1TopicId = objectMapper.readTree(topicRes.getResponse().getContentAsString()).get("id").asText();
    }

    @Test
    void createSession_generatesRevisionTasks_andEnforcesUserIsolation() throws Exception {
        CreateStudySessionRequest req = new CreateStudySessionRequest(
            "Projectiles Practice",
            "Solved 10 problem sets on parabolic trajectory",
            Instant.parse("2026-10-13T10:00:00Z"),
            45
        );

        // 1. User 1 logs study session
        MvcResult sessionRes = mockMvc.perform(post("/api/v1/topics/" + user1TopicId + "/sessions")
                .header("Authorization", "Bearer " + user1Token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.title").value("Projectiles Practice"))
            .andExpect(jsonPath("$.durationMinutes").value(45))
            .andExpect(jsonPath("$.revisionTasks.length()").value(5))
            .andExpect(jsonPath("$.revisionTasks[0].scheduleOffsetDays").value(0))
            .andExpect(jsonPath("$.revisionTasks[1].scheduleOffsetDays").value(3))
            .andExpect(jsonPath("$.revisionTasks[2].scheduleOffsetDays").value(7))
            .andExpect(jsonPath("$.revisionTasks[3].scheduleOffsetDays").value(14))
            .andExpect(jsonPath("$.revisionTasks[4].scheduleOffsetDays").value(21))
            .andReturn();

        String sessionId = objectMapper.readTree(sessionRes.getResponse().getContentAsString()).get("id").asText();

        // 2. User 1 fetches session by ID
        mockMvc.perform(get("/api/v1/sessions/" + sessionId)
                .header("Authorization", "Bearer " + user1Token))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.title").value("Projectiles Practice"));

        // 3. USER ISOLATION CHECK: User 2 cannot access User 1's study session
        mockMvc.perform(get("/api/v1/sessions/" + sessionId)
                .header("Authorization", "Bearer " + user2Token))
            .andExpect(status().isNotFound());

        // 4. USER ISOLATION CHECK: User 2 cannot log study session for User 1's topic
        mockMvc.perform(post("/api/v1/topics/" + user1TopicId + "/sessions")
                .header("Authorization", "Bearer " + user2Token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
            .andExpect(status().isNotFound());
    }
}

package com.revisemind.dashboard;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.revisemind.auth.dto.AuthResponse;
import com.revisemind.auth.dto.RegisterRequest;
import com.revisemind.revision.RevisionOutcome;
import com.revisemind.revision.dto.CompleteRevisionRequest;
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
class DashboardHistoryIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private String userToken;

    @BeforeEach
    void setUp() throws Exception {
        RegisterRequest u = new RegisterRequest("Dashboard User", "dash_user@example.com", "pass123", "Asia/Kolkata");
        MvcResult res = mockMvc.perform(post("/api/v1/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(u)))
            .andExpect(status().isCreated())
            .andReturn();
        userToken = objectMapper.readValue(res.getResponse().getContentAsString(), AuthResponse.class).token();

        // Create Subject
        CreateSubjectRequest sub = new CreateSubjectRequest("Computer Science", "Data Structures");
        MvcResult subRes = mockMvc.perform(post("/api/v1/subjects")
                .header("Authorization", "Bearer " + userToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(sub)))
            .andExpect(status().isCreated())
            .andReturn();
        String subjectId = objectMapper.readTree(subRes.getResponse().getContentAsString()).get("id").asText();

        // Create Topic
        CreateTopicRequest top = new CreateTopicRequest("Binary Search Trees", "Tree balancing & traversals");
        MvcResult topRes = mockMvc.perform(post("/api/v1/subjects/" + subjectId + "/topics")
                .header("Authorization", "Bearer " + userToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(top)))
            .andExpect(status().isCreated())
            .andReturn();
        String topicId = objectMapper.readTree(topRes.getResponse().getContentAsString()).get("id").asText();

        // Create Study Session
        CreateStudySessionRequest sessionReq = new CreateStudySessionRequest(
            "BST Inorder Traversal",
            "Inorder traversal gives sorted order",
            Instant.now(),
            30
        );
        mockMvc.perform(post("/api/v1/topics/" + topicId + "/sessions")
                .header("Authorization", "Bearer " + userToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(sessionReq)))
            .andExpect(status().isCreated());
    }

    @Test
    void dashboardAndHistoryEndpoints() throws Exception {
        // 1. Get Dashboard Summary
        mockMvc.perform(get("/api/v1/dashboard/summary")
                .header("Authorization", "Bearer " + userToken))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.tasksDueToday").value(1))
            .andExpect(jsonPath("$.totalStudySessions").value(1))
            .andExpect(jsonPath("$.activeSubjects").value(1));

        // 2. Get Upcoming Revisions
        mockMvc.perform(get("/api/v1/dashboard/upcoming?limit=5")
                .header("Authorization", "Bearer " + userToken))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.length()").value(5));

        // 3. Complete Day 0 task
        MvcResult dueRes = mockMvc.perform(get("/api/v1/revisions?status=DUE_TODAY")
                .header("Authorization", "Bearer " + userToken))
            .andExpect(status().isOk())
            .andReturn();
        String taskId = objectMapper.readTree(dueRes.getResponse().getContentAsString()).get("content").get(0).get("id").asText();

        CompleteRevisionRequest completeReq = new CompleteRevisionRequest(RevisionOutcome.EASY, "Understood completely");
        mockMvc.perform(post("/api/v1/revisions/" + taskId + "/complete")
                .header("Authorization", "Bearer " + userToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(completeReq)))
            .andExpect(status().isOk());

        // 4. Verify History endpoints
        mockMvc.perform(get("/api/v1/history/revisions")
                .header("Authorization", "Bearer " + userToken))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.content.length()").value(1))
            .andExpect(jsonPath("$.content[0].outcome").value("EASY"));

        mockMvc.perform(get("/api/v1/history/study-sessions")
                .header("Authorization", "Bearer " + userToken))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.content.length()").value(1))
            .andExpect(jsonPath("$.content[0].title").value("BST Inorder Traversal"));
    }
}

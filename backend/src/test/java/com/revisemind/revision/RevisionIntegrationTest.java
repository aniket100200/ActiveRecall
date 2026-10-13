package com.revisemind.revision;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.revisemind.auth.dto.AuthResponse;
import com.revisemind.auth.dto.RegisterRequest;
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
class RevisionIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private String user1Token;
    private String user2Token;
    private String topicId;

    @BeforeEach
    void setUp() throws Exception {
        RegisterRequest u1 = new RegisterRequest("User One", "rev_user1@example.com", "pass123", "Asia/Kolkata");
        MvcResult res1 = mockMvc.perform(post("/api/v1/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(u1)))
            .andExpect(status().isCreated())
            .andReturn();
        user1Token = objectMapper.readValue(res1.getResponse().getContentAsString(), AuthResponse.class).token();

        RegisterRequest u2 = new RegisterRequest("User Two", "rev_user2@example.com", "pass123", "Asia/Kolkata");
        MvcResult res2 = mockMvc.perform(post("/api/v1/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(u2)))
            .andExpect(status().isCreated())
            .andReturn();
        user2Token = objectMapper.readValue(res2.getResponse().getContentAsString(), AuthResponse.class).token();

        // Create Subject & Topic
        CreateSubjectRequest sub = new CreateSubjectRequest("Biology", "Genetics & Cell Biology");
        MvcResult subRes = mockMvc.perform(post("/api/v1/subjects")
                .header("Authorization", "Bearer " + user1Token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(sub)))
            .andExpect(status().isCreated())
            .andReturn();
        String subjectId = objectMapper.readTree(subRes.getResponse().getContentAsString()).get("id").asText();

        CreateTopicRequest top = new CreateTopicRequest("DNA Replication", "Enzymes and steps");
        MvcResult topRes = mockMvc.perform(post("/api/v1/subjects/" + subjectId + "/topics")
                .header("Authorization", "Bearer " + user1Token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(top)))
            .andExpect(status().isCreated())
            .andReturn();
        topicId = objectMapper.readTree(topRes.getResponse().getContentAsString()).get("id").asText();
    }

    @Test
    void revisionWorkflowLifecycleAndCompletion() throws Exception {
        // 1. User 1 logs study session at current time
        Instant studiedAt = Instant.now();
        CreateStudySessionRequest sessionReq = new CreateStudySessionRequest(
            "Helicase and Polymerase",
            "Key enzymes: Helicase unwinds, Polymerase synthesizes 5' to 3'",
            studiedAt,
            25
        );

        mockMvc.perform(post("/api/v1/topics/" + topicId + "/sessions")
                .header("Authorization", "Bearer " + user1Token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(sessionReq)))
            .andExpect(status().isCreated());

        // 2. Fetch Due Today queue -> Day 0 task must be present
        MvcResult dueTodayRes = mockMvc.perform(get("/api/v1/revisions?status=DUE_TODAY")
                .header("Authorization", "Bearer " + user1Token))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.content.length()").value(1))
            .andExpect(jsonPath("$.content[0].scheduleOffsetDays").value(0))
            .andExpect(jsonPath("$.content[0].status").value("PENDING"))
            .andReturn();

        String day0TaskId = objectMapper.readTree(dueTodayRes.getResponse().getContentAsString())
            .get("content").get(0).get("id").asText();

        // 3. USER ISOLATION: User 2 cannot access User 1's revision task
        mockMvc.perform(get("/api/v1/revisions/" + day0TaskId)
                .header("Authorization", "Bearer " + user2Token))
            .andExpect(status().isNotFound());

        // 4. User 1 completes Day 0 revision task with GOOD outcome
        CompleteRevisionRequest completeReq = new CompleteRevisionRequest(RevisionOutcome.GOOD, "Recalled key enzymes easily");
        mockMvc.perform(post("/api/v1/revisions/" + day0TaskId + "/complete")
                .header("Authorization", "Bearer " + user1Token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(completeReq)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.status").value("COMPLETED"))
            .andExpect(jsonPath("$.outcome").value("GOOD"))
            .andExpect(jsonPath("$.reflection").value("Recalled key enzymes easily"));

        // 5. Due Today queue is now empty
        mockMvc.perform(get("/api/v1/revisions?status=DUE_TODAY")
                .header("Authorization", "Bearer " + user1Token))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.content.length()").value(0));

        // 6. Completed queue contains completed task
        mockMvc.perform(get("/api/v1/revisions?status=COMPLETED")
                .header("Authorization", "Bearer " + user1Token))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.content.length()").value(1))
            .andExpect(jsonPath("$.content[0].id").value(day0TaskId));

        // 7. Duplicate completion attempt throws 400 Bad Request
        mockMvc.perform(post("/api/v1/revisions/" + day0TaskId + "/complete")
                .header("Authorization", "Bearer " + user1Token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(completeReq)))
            .andExpect(status().isBadRequest());
    }
}

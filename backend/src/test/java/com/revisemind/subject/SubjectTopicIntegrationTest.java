package com.revisemind.subject;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.revisemind.auth.dto.AuthResponse;
import com.revisemind.auth.dto.RegisterRequest;
import com.revisemind.subject.dto.CreateSubjectRequest;
import com.revisemind.subject.dto.UpdateSubjectRequest;
import com.revisemind.topic.dto.CreateTopicRequest;
import com.revisemind.topic.dto.UpdateTopicRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class SubjectTopicIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private String user1Token;
    private String user2Token;

    @BeforeEach
    void setUp() throws Exception {
        RegisterRequest user1Req = new RegisterRequest("User One", "user1@example.com", "pass123", "Asia/Kolkata");
        MvcResult res1 = mockMvc.perform(post("/api/v1/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(user1Req)))
            .andExpect(status().isCreated())
            .andReturn();
        AuthResponse auth1 = objectMapper.readValue(res1.getResponse().getContentAsString(), AuthResponse.class);
        user1Token = auth1.token();

        RegisterRequest user2Req = new RegisterRequest("User Two", "user2@example.com", "pass123", "Asia/Kolkata");
        MvcResult res2 = mockMvc.perform(post("/api/v1/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(user2Req)))
            .andExpect(status().isCreated())
            .andReturn();
        AuthResponse auth2 = objectMapper.readValue(res2.getResponse().getContentAsString(), AuthResponse.class);
        user2Token = auth2.token();
    }

    @Test
    void subjectAndTopicCrudLifecycleWithUserIsolation() throws Exception {
        // 1. User 1 creates subject "Mathematics"
        CreateSubjectRequest createSubject = new CreateSubjectRequest("Mathematics", "Calculus and Algebra");
        MvcResult subjectRes = mockMvc.perform(post("/api/v1/subjects")
                .header("Authorization", "Bearer " + user1Token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(createSubject)))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.name").value("Mathematics"))
            .andReturn();

        String subjectId = objectMapper.readTree(subjectRes.getResponse().getContentAsString()).get("id").asText();

        // 2. User 1 creates topic "Integration" under Mathematics
        CreateTopicRequest createTopic = new CreateTopicRequest("Integration", "Definite and indefinite integrals");
        MvcResult topicRes = mockMvc.perform(post("/api/v1/subjects/" + subjectId + "/topics")
                .header("Authorization", "Bearer " + user1Token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(createTopic)))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.name").value("Integration"))
            .andReturn();

        String topicId = objectMapper.readTree(topicRes.getResponse().getContentAsString()).get("id").asText();

        // 3. User 1 lists topics for Mathematics
        mockMvc.perform(get("/api/v1/subjects/" + subjectId + "/topics")
                .header("Authorization", "Bearer " + user1Token))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.length()").value(1))
            .andExpect(jsonPath("$[0].name").value("Integration"));

        // 4. USER ISOLATION CHECK: User 2 cannot access User 1's subject
        mockMvc.perform(get("/api/v1/subjects/" + subjectId)
                .header("Authorization", "Bearer " + user2Token))
            .andExpect(status().isNotFound());

        // 5. USER ISOLATION CHECK: User 2 cannot list topics of User 1's subject
        mockMvc.perform(get("/api/v1/subjects/" + subjectId + "/topics")
                .header("Authorization", "Bearer " + user2Token))
            .andExpect(status().isNotFound());

        // 6. USER ISOLATION CHECK: User 2 cannot access User 1's topic
        mockMvc.perform(get("/api/v1/topics/" + topicId)
                .header("Authorization", "Bearer " + user2Token))
            .andExpect(status().isNotFound());

        // 7. User 1 updates topic
        UpdateTopicRequest updateTopic = new UpdateTopicRequest("Advanced Integration", "By parts and substitution", false);
        mockMvc.perform(put("/api/v1/topics/" + topicId)
                .header("Authorization", "Bearer " + user1Token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateTopic)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.name").value("Advanced Integration"));

        // 8. User 1 archives topic
        mockMvc.perform(delete("/api/v1/topics/" + topicId)
                .header("Authorization", "Bearer " + user1Token))
            .andExpect(status().isNoContent());

        // 9. Active topics list now excludes archived topic by default
        mockMvc.perform(get("/api/v1/subjects/" + subjectId + "/topics")
                .header("Authorization", "Bearer " + user1Token))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.length()").value(0));

        // 10. User 1 archives subject
        mockMvc.perform(delete("/api/v1/subjects/" + subjectId)
                .header("Authorization", "Bearer " + user1Token))
            .andExpect(status().isNoContent());

        // 11. Active subjects list excludes archived subject
        mockMvc.perform(get("/api/v1/subjects")
                .header("Authorization", "Bearer " + user1Token))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.content.length()").value(0));
    }
}

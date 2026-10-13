package com.revisemind.dashboard;

import com.revisemind.dashboard.dto.DashboardSummaryDto;
import com.revisemind.revision.dto.RevisionTaskDto;
import com.revisemind.user.User;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/summary")
    public ResponseEntity<DashboardSummaryDto> getSummary(@AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(dashboardService.getSummary(currentUser));
    }

    @GetMapping("/upcoming")
    public ResponseEntity<List<RevisionTaskDto>> getUpcoming(
        @AuthenticationPrincipal User currentUser,
        @RequestParam(defaultValue = "10") int limit
    ) {
        return ResponseEntity.ok(dashboardService.getUpcomingRevisions(currentUser, limit));
    }
}

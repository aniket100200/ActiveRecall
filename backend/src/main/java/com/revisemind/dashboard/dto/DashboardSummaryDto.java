package com.revisemind.dashboard.dto;

public record DashboardSummaryDto(
    long tasksDueToday,
    long overdueTasks,
    long tasksCompletedToday,
    long totalStudySessions,
    long activeSubjects,
    double completionRate
) {
}

package com.carbontrack.service;

import com.carbontrack.dto.BenchmarkDTO;
import com.carbontrack.dto.LeaderboardDTO;
import com.carbontrack.entity.User;

public interface BenchmarkService {
    BenchmarkDTO getBenchmark(User user);
    LeaderboardDTO getPercentile(User user);
}

package com.carbontrack.controller;

import com.carbontrack.dto.OrgSummaryDto;
import com.carbontrack.entity.User;
import com.carbontrack.service.OrgService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/org")
@RequiredArgsConstructor
public class OrgController {

    private final OrgService orgService;

    @GetMapping("/summary")
    public ResponseEntity<OrgSummaryDto> getOrgSummary(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(orgService.getOrgSummary(user));
    }
}

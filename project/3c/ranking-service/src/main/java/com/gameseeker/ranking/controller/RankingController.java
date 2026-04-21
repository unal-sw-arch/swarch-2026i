package com.gameseeker.ranking.controller;

import com.gameseeker.ranking.model.RankedGame;
import com.gameseeker.ranking.service.RankingService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/ranking")
@RequiredArgsConstructor
public class RankingController {

    private final RankingService rankingService;

    @Value("${ranking.default-limit:10}")
    private int defaultLimit;

    @Value("${ranking.max-limit:50}")
    private int maxLimit;

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of("status", "healthy", "service", "ranking-service"));
    }

    @GetMapping("/top")
    public ResponseEntity<Map<String, Object>> getTopGames(
            @RequestParam(required = false) String store,
            @RequestParam(required = false) Integer limit) {

        int actualLimit = (limit != null && limit > 0) ? limit : defaultLimit;
        actualLimit = Math.min(actualLimit, maxLimit);

        List<RankedGame> topGames = rankingService.getTopGames(store, actualLimit);

        Map<String, Object> response = Map.of(
                "generatedAt", Instant.now().toString(),
                "store", store == null || store.isBlank() ? "all" : store,
                "count", topGames.size(),
                "rankings", topGames
        );

        return ResponseEntity.ok(response);
    }
}

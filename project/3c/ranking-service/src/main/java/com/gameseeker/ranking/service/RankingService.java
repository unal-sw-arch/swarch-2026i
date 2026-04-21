package com.gameseeker.ranking.service;

import com.gameseeker.ranking.model.RankedGame;
import com.gameseeker.ranking.repository.GameRankingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class RankingService {

    private final GameRankingRepository repository;

    public List<RankedGame> getTopGames(String store, int limit) {
        String key = (store == null || store.isBlank()) 
                ? "ranking:games:all" 
                : "ranking:games:" + store.toLowerCase();

        if (!repository.hasData(key)) {
            return new ArrayList<>(); 
        }

        Set<Object> slugs = repository.getTopSlugs(key, limit);
        List<RankedGame> games = new ArrayList<>();
        int rank = 1;

        for (Object slugObj : slugs) {
            String slug = slugObj.toString();
            Map<Object, Object> detail = repository.getGameDetail(slug);
            if (detail != null && !detail.isEmpty()) {
                games.add(buildRankedGame(rank++, slug, detail));
            }
        }

        return games;
    }

    private RankedGame buildRankedGame(int rank, String slug, Map<Object, Object> detail) {
        long priceCents = getLong(detail.get("priceCents"));
        long originalPriceCents = getLong(detail.get("originalPriceCents"));

        int discountPct = 0;
        if (originalPriceCents > 0 && priceCents < originalPriceCents) {
            discountPct = (int) ((1.0 - ((double) priceCents / originalPriceCents)) * 100);
        }

        return RankedGame.builder()
                .rank(rank)
                .slug(slug)
                .name(getString(detail.get("name")))
                .store(getString(detail.get("store")))
                .priceCents(priceCents)
                .originalPriceCents(originalPriceCents)
                .currency(getString(detail.get("currency")))
                .url(getString(detail.get("url")))
                .imageUrl(getString(detail.get("imageUrl")))
                .discountPct(discountPct)
                .build();
    }

    private String getString(Object obj) {
        return obj == null ? "" : obj.toString();
    }

    private long getLong(Object obj) {
        if (obj instanceof Number) {
            return ((Number) obj).longValue();
        } else if (obj instanceof String) {
            try {
                return Long.parseLong((String) obj);
            } catch (NumberFormatException e) {
                return 0;
            }
        }
        return 0;
    }
}

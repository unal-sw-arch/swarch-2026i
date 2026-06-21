package com.gameseeker.ranking.repository;

import com.gameseeker.ranking.model.GamePriceMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Repository;

import java.util.Map;
import java.util.Set;
import java.util.concurrent.TimeUnit;

@Repository
@RequiredArgsConstructor
public class GameRankingRepository {

    private final RedisTemplate<String, Object> redisTemplate;

    @Value("${ranking.redis.ttl-hours:24}")
    private long ttlHours;

    public void addOrUpdateIfBetterDiscount(String slug, GamePriceMessage msg) {
        String detailKey = "game:detail:" + slug;
        String globalKey = "ranking:games:all";
        
        Double currentScore = redisTemplate.opsForZSet().score(globalKey, slug);
        Boolean hasDetail = redisTemplate.hasKey(detailKey);
        
        double newDiscountPct = 0;
        if (msg.getOriginalPriceCents() > 0 && msg.getPriceCents() < msg.getOriginalPriceCents()) {
            newDiscountPct = (1.0 - ((double) msg.getPriceCents() / msg.getOriginalPriceCents())) * 100;
        }
        
        boolean shouldUpdate = false;
        
        // 1. Si expiró o es nuevo
        if (Boolean.FALSE.equals(hasDetail) || currentScore == null) {
            shouldUpdate = true;
        } 
        // 2. Si el nuevo descuento es mayor al que tenemos registrado
        else if (newDiscountPct > currentScore) {
            shouldUpdate = true;
        } 
        // 3. Si es la misma tienda actualizando su precio
        else {
            Object savedStore = redisTemplate.opsForHash().get(detailKey, "store");
            if (msg.getStore() != null && msg.getStore().equalsIgnoreCase(String.valueOf(savedStore))) {
                shouldUpdate = true;
            }
        }
        
        if (shouldUpdate) {
            Map<String, Object> data = Map.of(
                "name", msg.getName() != null ? msg.getName() : "",
                "store", msg.getStore() != null ? msg.getStore() : "",
                "priceCents", msg.getPriceCents(),
                "originalPriceCents", msg.getOriginalPriceCents(),
                "currency", msg.getCurrency() != null ? msg.getCurrency() : "COP",
                "url", msg.getUrl() != null ? msg.getUrl() : "",
                "imageUrl", msg.getImageUrl() != null ? msg.getImageUrl() : ""
            );
            redisTemplate.opsForHash().putAll(detailKey, data);
            redisTemplate.expire(detailKey, ttlHours, TimeUnit.HOURS);
            
            // Usamos newDiscountPct como el score en el ranking
            redisTemplate.opsForZSet().add(globalKey, slug, newDiscountPct);
            redisTemplate.expire(globalKey, ttlHours, TimeUnit.HOURS);
            
            if (msg.getStore() != null) {
                String storeKey = "ranking:games:" + msg.getStore().toLowerCase();
                redisTemplate.opsForZSet().add(storeKey, slug, newDiscountPct);
                redisTemplate.expire(storeKey, ttlHours, TimeUnit.HOURS);
            }
        }
    }

    public Set<Object> getTopSlugs(String rankingKey, int limit) {
        // reverseRange para obtener los puntajes (descuentos) más altos primero
        return redisTemplate.opsForZSet().reverseRange(rankingKey, 0, limit - 1);
    }

    public Map<Object, Object> getGameDetail(String slug) {
        String key = "game:detail:" + slug;
        return redisTemplate.opsForHash().entries(key);
    }

    public boolean hasData(String rankingKey) {
        Long size = redisTemplate.opsForZSet().size(rankingKey);
        return size != null && size > 0;
    }
}

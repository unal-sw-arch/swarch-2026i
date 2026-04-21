package com.gameseeker.ranking.messaging;

import com.gameseeker.ranking.model.GamePriceMessage;
import com.gameseeker.ranking.repository.GameRankingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class GamePriceConsumer {

    private final GameRankingRepository repository;

    @RabbitListener(queues = "${ranking.queue.name}")
    public void onGamePriceMessage(GamePriceMessage msg) {
        try {
            if (msg.getPriceCents() <= 0) return;

            String slug = nameToSlug(msg.getName());

            repository.addOrUpdateIfBetterDiscount(slug, msg);

            log.info("Processed game: {} at {} {} from {}",
                    msg.getName(), msg.getPriceCents(), msg.getCurrency(), msg.getStore());
        } catch (Exception e) {
            log.error("Error processing message", e);
        }
    }

    private String nameToSlug(String name) {
        if (name == null) return "";
        return name.toLowerCase().replaceAll("\\s+", "-").replaceAll("[^a-z0-9-]", "");
    }
}

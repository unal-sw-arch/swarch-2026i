package com.clickmunch.AuthService.config;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.clickmunch.AuthService.entity.ApprovalStatus;
import com.clickmunch.AuthService.entity.Role;
import com.clickmunch.AuthService.entity.User;
import com.clickmunch.AuthService.repository.UserRepository;

/**
 * Seeds one ready-to-use, pre-approved account per {@link Role} for local and
 * QA environments so every dashboard/mobile view can be exercised immediately.
 *
 * <p>This replaces the old shell/curl seeding flow with an in-app, idempotent
 * seeder:
 * <ul>
 *   <li><b>Opt-in:</b> only runs when {@code app.seed.enabled=true}
 *       (env {@code APP_SEED_ENABLED=true}); never in tests or production.</li>
 *   <li><b>Idempotent:</b> skips any username that already exists, so repeated
 *       startups never duplicate or overwrite data.</li>
 *   <li><b>No bypass of business rules in prod:</b> seeded staff are created
 *       directly as {@code APPROVED} purely for test convenience; the normal
 *       invite/approval flow is unchanged for real registrations.</li>
 * </ul>
 *
 * The seed password is read from {@code app.seed.password}
 * (env {@code APP_SEED_PASSWORD}); it is a throwaway local credential, not a
 * production secret.
 */
@Component
@ConditionalOnProperty(name = "app.seed.enabled", havingValue = "true")
public class DevDataSeeder implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DevDataSeeder.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final String seedPassword;

    public DevDataSeeder(UserRepository userRepository,
                         PasswordEncoder passwordEncoder,
                         @Value("${app.seed.password:Password123!}") String seedPassword) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.seedPassword = seedPassword;
    }

    private record SeedUser(String username, String name, String email, Role role) {}

    @Override
    public void run(String... args) {
        List<SeedUser> seedUsers = List.of(
                new SeedUser("qa_customer", "QA Customer", "qa.customer@clickmunch.test", Role.CUSTOMER),
                new SeedUser("qa_manager", "QA Manager", "qa.manager@clickmunch.test", Role.RESTAURANT_MANAGER),
                new SeedUser("qa_waiter", "QA Waiter", "qa.waiter@clickmunch.test", Role.WAITER),
                new SeedUser("qa_chef", "QA Chef", "qa.chef@clickmunch.test", Role.CHEF),
                new SeedUser("qa_admin", "QA Admin", "qa.admin@clickmunch.test", Role.ADMIN)
        );

        int created = 0;
        for (SeedUser seed : seedUsers) {
            if (userRepository.existsByUsername(seed.username())) {
                continue;
            }
            userRepository.save(User.builder()
                    .name(seed.name())
                    .email(seed.email())
                    .username(seed.username())
                    .passwordHash(passwordEncoder.encode(seedPassword))
                    .role(seed.role())
                    .approvalStatus(ApprovalStatus.APPROVED)
                    .governmentId("QA-" + seed.role().name())
                    .build());
            created++;
        }

        if (created > 0) {
            logger.info("DevDataSeeder: created {} test user(s), one per role (all APPROVED).", created);
        } else {
            logger.info("DevDataSeeder: test users already present; nothing to seed.");
        }
    }
}

package service.publique;

import org.junit.jupiter.api.Test;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneId;
import java.time.ZoneOffset;

import static org.assertj.core.api.Assertions.assertThat;

class ContactRateLimiterTest {

    private static class HorlogeManuelle extends Clock {
        private Instant now = Instant.parse("2026-01-01T10:00:00Z");

        void avancer(Duration d) {
            now = now.plus(d);
        }

        @Override public ZoneId getZone() { return ZoneOffset.UTC; }
        @Override public Clock withZone(ZoneId zone) { return this; }
        @Override public Instant instant() { return now; }
    }

    @Test
    void refuse_apres_la_limite_puis_reautorise_apres_la_fenetre() {
        HorlogeManuelle horloge = new HorlogeManuelle();
        ContactRateLimiter limiter = new ContactRateLimiter(5, Duration.ofHours(1), horloge);

        for (int i = 0; i < 5; i++) {
            assertThat(limiter.tenter("1.1.1.1")).as("tentative %d", i + 1).isTrue();
        }
        assertThat(limiter.tenter("1.1.1.1")).isFalse();

        horloge.avancer(Duration.ofMinutes(61));
        assertThat(limiter.tenter("1.1.1.1")).isTrue();
    }

    @Test
    void la_limite_est_propre_a_chaque_adresse() {
        ContactRateLimiter limiter = new ContactRateLimiter(1, Duration.ofHours(1), new HorlogeManuelle());

        assertThat(limiter.tenter("1.1.1.1")).isTrue();
        assertThat(limiter.tenter("1.1.1.1")).isFalse();
        assertThat(limiter.tenter("2.2.2.2")).isTrue();
    }
}

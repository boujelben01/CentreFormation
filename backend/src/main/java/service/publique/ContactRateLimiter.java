package service.publique;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.time.Clock;
import java.time.Duration;
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/** Fenêtre glissante en mémoire par adresse IP (par défaut 5 messages par heure). */
@Component
public class ContactRateLimiter {

    private final int max;
    private final Duration fenetre;
    private final Clock clock;
    private final Map<String, Deque<Long>> envois = new ConcurrentHashMap<>();

    @Autowired
    public ContactRateLimiter(@Value("${contact.rate-limit.max:5}") int max,
                              @Value("${contact.rate-limit.window-minutes:60}") long fenetreMinutes) {
        this(max, Duration.ofMinutes(fenetreMinutes), Clock.systemUTC());
    }

    ContactRateLimiter(int max, Duration fenetre, Clock clock) {
        this.max = max;
        this.fenetre = fenetre;
        this.clock = clock;
    }

    /** Enregistre une tentative ; false si l'adresse a déjà atteint la limite dans la fenêtre. */
    public boolean tenter(String ip) {
        long now = clock.millis();
        long limite = now - fenetre.toMillis();
        if (envois.size() > 10_000) {
            envois.entrySet().removeIf(e -> {
                synchronized (e.getValue()) {
                    return e.getValue().isEmpty() || e.getValue().peekLast() < limite;
                }
            });
        }
        Deque<Long> deque = envois.computeIfAbsent(ip, k -> new ArrayDeque<>());
        synchronized (deque) {
            while (!deque.isEmpty() && deque.peekFirst() < limite) {
                deque.pollFirst();
            }
            if (deque.size() >= max) {
                return false;
            }
            deque.addLast(now);
            return true;
        }
    }
}

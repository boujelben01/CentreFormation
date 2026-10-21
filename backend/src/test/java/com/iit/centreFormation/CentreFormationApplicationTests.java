package com.iit.centreFormation;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.springframework.boot.test.context.SpringBootTest;

/** Contexte complet : exige une vraie base, donc exécuté seulement si DB_URL (avec DB_USER / DB_PASSWORD) est défini. */
@SpringBootTest
@EnabledIfEnvironmentVariable(named = "DB_URL", matches = ".+")
class CentreFormationApplicationTests {

    @Test
    void contextLoads() {
    }

}

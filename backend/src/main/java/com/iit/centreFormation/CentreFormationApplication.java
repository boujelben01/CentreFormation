package com.iit.centreFormation;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
//import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.context.annotation.ComponentScan;

@SpringBootApplication
@EnableJpaRepositories("repository")
@org.springframework.boot.persistence.autoconfigure.EntityScan("entity")
@ComponentScan({
    "com.iit.centreFormation",
    "controller.rest",
    "controller.api",
    "controller.web",
    "service.admin",
    "service.common",
    "service.formateur",
    "service.etudiant",
    "service.publique",
    "repository",
    "security",
    "entity",
    "config"
})
public class CentreFormationApplication {

    public static void main(String[] args) {
        SpringApplication.run(CentreFormationApplication.class, args);
    }
}

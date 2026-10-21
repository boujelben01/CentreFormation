# ---------- Étape 1 : construction ----------
# Temurin 25 LTS : version testée en local (le pom vise Java 17, compatible).
FROM maven:3.9-eclipse-temurin-25 AS build
WORKDIR /build

# Dépendances d'abord : cette couche reste en cache tant que pom.xml ne change pas.
COPY pom.xml ./
RUN mvn -B -q dependency:go-offline

COPY src ./src
# Le jar exécutable Spring Boot est renommé app.jar pour éviter tout joker ambigu (.jar.original).
RUN mvn -B -q -DskipTests package \
    && cp target/centre-formation-0.0.1-SNAPSHOT.jar app.jar

# ---------- Étape 2 : exécution ----------
FROM eclipse-temurin:25-jre
WORKDIR /app

RUN groupadd --system spring && useradd --system --gid spring spring
COPY --from=build --chown=spring:spring /build/app.jar app.jar
USER spring

ENV SPRING_PROFILES_ACTIVE=prod
EXPOSE 8080

# Mémoire (conteneur de 512 Mo) :
#  -Xmx300m                  tas plafonné pour laisser de la place au reste du processus
#  -Xss512k                  pile par thread réduite (beaucoup de threads Tomcat)
#  -XX:MaxMetaspaceSize=128m métaspace borné
#  -XX:+UseSerialGC          GC mono-thread : empreinte mémoire minimale sur 1 vCPU
#  -XX:TieredStopAtLevel=1   compilateur C1 seul : moins de mémoire et démarrage plus rapide
ENV JAVA_TOOL_OPTIONS="-Xmx256m -Xss512k -XX:MaxMetaspaceSize=128m -XX:+UseSerialGC -XX:TieredStopAtLevel=1"

ENTRYPOINT ["java", "-jar", "app.jar"]

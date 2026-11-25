# ==============================================================================
# Stage 1: Build & Extract Spring Boot Layered JAR
# ==============================================================================
FROM maven:3.9.9-eclipse-temurin-21-alpine AS builder
WORKDIR /app

COPY pom.xml .
RUN mvn -B -q dependency:go-offline

COPY src ./src
RUN mvn -B package -DskipTests \
    && java -Djarmode=tools -jar target/lagiism-be-*.jar extract --layers --launcher --destination extracted

# ==============================================================================
# Stage 2: Minimal Runtime (Eclipse Temurin 21 JRE + postgresql-client for pg_dump)
# ==============================================================================
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

RUN apk add --no-cache postgresql16-client wget \
    && addgroup -S spring \
    && adduser -S spring -G spring

COPY --from=builder /app/extracted/dependencies/ ./
COPY --from=builder /app/extracted/spring-boot-loader/ ./
COPY --from=builder /app/extracted/snapshot-dependencies/ ./
COPY --from=builder /app/extracted/application/ ./

RUN chown -R spring:spring /app
USER spring:spring

EXPOSE 8080

ENV JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=70.0"

ENTRYPOINT ["sh", "-c", "exec java $JAVA_OPTS org.springframework.boot.loader.launch.JarLauncher"]

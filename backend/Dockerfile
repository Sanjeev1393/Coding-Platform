# syntax=docker/dockerfile:1

# ------------------------------------------------------------------------------
# Stage 1: Build Stage
# ------------------------------------------------------------------------------
FROM eclipse-temurin:21-jdk-jammy AS builder

WORKDIR /app

# Copy Maven Wrapper and POM first to leverage Docker layer caching
COPY .mvn .mvn
COPY mvnw pom.xml ./

# Normalize CRLF line endings from Windows checkouts and grant execute permissions
RUN sed -i 's/\r$//' ./mvnw && chmod +x ./mvnw

# Download dependencies in an isolated layer
RUN ./mvnw dependency:go-offline -B

# Copy application source code
COPY src src

# Package the application JAR without re-running unit tests during image build
RUN ./mvnw clean package -DskipTests

# ------------------------------------------------------------------------------
# Stage 2: Runtime Stage
# ------------------------------------------------------------------------------
FROM eclipse-temurin:21-jre-jammy AS runner

# Install curl for container health checks and clean up apt cache
RUN apt-get update \
    && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*

# Create an unprivileged system user and group
RUN groupadd --system --gid 1001 spring \
    && useradd --system --uid 1001 --gid spring spring

WORKDIR /app

# Copy the built executable Spring Boot JAR from the builder stage
COPY --from=builder /app/target/coding-platform-backend-0.0.1-SNAPSHOT.jar app.jar

# Assign ownership to the unprivileged spring user
RUN chown -R spring:spring /app

USER spring

EXPOSE 8080

# Configure health check against Spring Boot Actuator health endpoint
HEALTHCHECK --interval=10s --timeout=3s --start-period=20s --retries=3 \
    CMD curl -f http://localhost:8080/actuator/health || exit 1

ENTRYPOINT ["java", "-jar", "app.jar"]

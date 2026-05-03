# Sports E-commerce Backend Foundation

## Run locally
1. Configure env vars from `.env.local`.
2. Run `mvn spring-boot:run`.

## Implemented in phase1-foundation
- Spring Boot baseline with clean architecture package layout.
- JWT auth endpoints (`register`, `login`, `refresh`, `logout`).
- BCrypt password handling and stateless Spring Security setup.
- Flyway migrations for initial schema and seed records.
- Structured error responses with global exception handling.

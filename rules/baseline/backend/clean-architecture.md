# Backend Clean Architecture Rules

Standard architectural patterns for backend services.

## Principles

1. **Layered Architecture**
   - Controller/Handler layer (API endpoints)
   - Service layer (business logic)
   - Repository layer (data access)
   - Model layer (domain entities)

2. **Dependency Injection**
   - Services receive dependencies via constructor
   - No direct instantiation in handlers
   - Use containers for DI configuration

3. **Error Handling**
   - Standardized error responses
   - Proper HTTP status codes
   - Structured logging with context

4. **Testing**
   - Unit tests for business logic
   - Integration tests for APIs
   - Mock external dependencies

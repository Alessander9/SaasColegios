# 1. El archivo más importante: `AGENTS.md`

Este será el contrato principal del agente.

Yo le pondría algo así:

```md
# School Platform - Agent Instructions

## Mission

Build a multi-tenant SaaS platform for managing schools.

The platform must support:

- Multiple schools/tenants
- Super Admin
- School administration
- Students
- Families
- Teachers
- Enrollment
- Academic management
- Grades
- Attendance
- Finance
- Payments
- Commerce
- Activities
- HR
- Payroll
- Notifications
- Documents
- Reporting
- Subscription plans
- Feature entitlements
- Usage limits
- Add-ons
- Role-based access control
- Audit logging

The system must be designed for long-term scalability.

---

# Core Principles

1. Multi-tenancy is mandatory.
2. Every tenant-owned resource must be tenant-scoped.
3. Never bypass authorization.
4. Never trust tenant_id from the client.
5. Tenant context must come from authenticated identity/session.
6. Domain ownership must be explicit.
7. Avoid unnecessary coupling between domains.
8. Prefer domain events for asynchronous communication.
9. Use idempotency for financial operations.
10. Financial operations must be auditable.
11. Never hard-delete critical financial or academic records.
12. All business-critical mutations must be auditable.
13. API contracts must be versioned.
14. Database migrations must be explicit.
15. Never silently change database schemas.
16. Never introduce breaking API changes without versioning.
17. Never expose secrets.
18. Never commit credentials.
19. All new features require tests.
20. Do not implement features outside the current phase without approval.

---

# Architecture

Use a modular architecture with clear bounded contexts.

Target domains:

- Identity
- Platform
- School
- Students
- Enrollment
- Academic
- Finance
- Commerce
- Activities
- HR
- Payroll
- Notifications
- Documents
- Audit
- Reporting

The initial implementation may run as a modular monolith.

The architecture must allow domains to become independent microservices later.

Do NOT create distributed infrastructure merely for the sake of using microservices.

---

# Multi-Tenancy

Every tenant-owned entity must contain tenant context.

Never accept tenant identity directly from user input.

Tenant context must be resolved from:

Authenticated user
→ membership
→ tenant

Super Admin operations may explicitly operate across tenants.

Cross-tenant data access must be denied by default.

---

# Authorization

Authorization follows:

User
→ Membership
→ Role
→ Permission
→ Resource
→ Scope
→ Business Rule

Examples:

students.view
students.create
students.update
students.delete

grades.view
grades.create
grades.update
grades.publish

finance.view
finance.collect
finance.refund

store.manage
activities.manage
payroll.process

Never implement authorization only in the frontend.

Backend authorization is mandatory.

---

# Entitlements

Feature access follows:

Tenant
→ Subscription
→ Plan
→ Features
→ Add-ons
→ Limits
→ Usage
→ Entitlement

A feature can be:

- enabled
- disabled
- limited
- quota-based
- temporarily unavailable

Examples:

students.limit = 500
teachers.limit = 50
storage.limit = 50GB

When a limit is reached, the system must return a deterministic domain error.

---

# Financial Rules

Financial data is highly sensitive.

Payments must support:

- idempotency
- audit
- refunds
- adjustments
- reconciliation
- status transitions

Never modify financial history destructively.

Prefer:

- reversal
- adjustment
- refund
- correction transaction

instead of deleting records.

---

# Events

Business events must be explicit.

Examples:

StudentCreated
EnrollmentCreated
EnrollmentConfirmed
ChargeCreated
PaymentCreated
PaymentCompleted
PaymentRefunded
OrderCreated
OrderPaid
ActivityCreated
RegistrationCreated
RegistrationPaid
GradePublished
AttendanceRecorded
PayrollProcessed

Events must be versioned.

Example:

PaymentCompleted.v1

---

# Database

Use PostgreSQL.

Use migrations.

Do not modify production schemas manually.

Every schema change requires a migration.

Use indexes based on real query patterns.

Tenant-scoped queries must be indexed appropriately.

---

# API

Use versioned APIs.

Example:

/api/v1/students

Use consistent:

- pagination
- filtering
- sorting
- validation
- error format
- authentication
- authorization

API contracts should be documented using OpenAPI.

---

# Testing

Every business feature must include:

- unit tests
- integration tests where appropriate
- authorization tests
- tenant isolation tests
- API tests

Critical flows require E2E tests.

Financial flows require idempotency tests.

---

# Observability

All services must support:

- structured logs
- metrics
- tracing
- correlation IDs
- health checks

Business-critical operations must be traceable.

---

# Implementation Rules

Before implementing a feature:

1. Read the relevant documentation.
2. Identify the bounded context.
3. Identify the owning domain.
4. Identify required permissions.
5. Identify entitlements.
6. Identify database changes.
7. Identify events.
8. Identify integrations.
9. Define tests.
10. Implement.
11. Run tests.
12. Update documentation.

Do not skip steps.

---

# Do Not

Do not:

- create arbitrary microservices
- duplicate business logic
- duplicate payment logic
- bypass tenant isolation
- put authorization only in frontend
- use database deletes for financial history
- hardcode plan limits
- hardcode feature availability
- put secrets in source code
- create undocumented APIs
- create undocumented events
- silently change contracts
- introduce dependencies without justification
```

---


# 📜 CONTRATO DE ARQUITECTURA Y NORMAS INNEGOCIABLES
## Plataforma Integral de Gestión Educativa SaaS Multi-Tenant

> **IMPORTANTE Y VINCULANTE:**
> Este contrato define los principios de ingeniería, restricciones técnicas, reglas de datos y patrones de diseño obligatorios para **todos los desarrolladores y agentes de IA** involucrados en la construcción, extensión o mantenimiento de la plataforma.
> **Ninguna regla de este contrato puede ser ignorada o flexibilizada sin una decisión formal documentada.**

---

## 📑 Índice del Contrato
1. [Principios de Arquitectura Innegociables](#1-principios-de-arquitectura-innegociables)
2. [Multi-Tenancy y Aislamiento de Datos](#2-multi-tenancy-y-aislamiento-de-datos)
3. [Motor de Capacidades y Entitlements](#3-motor-de-capacidades-y-entitlements)
4. [Reglas y Consistencia Financiera](#4-reglas-y-consistencia-financiera)
5. [Ownership de Dominio y Bounded Contexts](#5-ownership-de-dominio-y-bounded-contexts)
6. [Comunicación Asíncrona, Outbox Pattern e Idempotencia](#6-comunicación-asíncrona-outbox-pattern-e-idempotencia)
7. [Contratos de API y Validación](#7-contratos-de-api-y-validación)
8. [Estrategia de Pruebas](#8-estrategia-de-pruebas)
9. [Observabilidad, Trazabilidad y Auditoría](#9-observabilidad-trazabilidad-y-auditoría)
10. [Instrucciones Directas para Agentes (AGENTS.md)](#10-instrucciones-directas-para-agentes-agentsmd)

---

## 1. Principios de Arquitectura Innegociables

1. **Modular Monolith to Microservices:** Comenzar como un monolito modular con estricto desacoplamiento de dominios (código hexagonal/DDD). No construir 15 microservicios dispersos desde el día 1; extraer servicios independientes únicamente cuando la escala, carga o despliegue independiente lo justifique.
2. **Domain Isolation:** Cada módulo posee sus propias entidades, esquemas, servicios de aplicación y repositorios. Ningún módulo puede acceder directamente a tablas de otro módulo (`JOIN` entre dominios prohibido).
3. **Single Source of Truth:** Cada dato de negocio tiene un único *System of Record* responsable. La lectura entre dominios se hace por APIs internas o proyecciones asíncronas de eventos.
4. **Idempotencia Obligatoria:** Todas las operaciones transaccionales y mutaciones críticas deben soportar `Idempotency-Key` en headers para evitar doble cobro o doble creación.

---

## 2. Multi-Tenancy y Aislamiento de Datos

* **Tenant ID Obligatorio:** Toda tabla o colección perteneciente a un colegio debe incluir `tenant_id` no nulo.
* **Filtro Automático en Queries:** Todo acceso a la base de datos debe pasar por un contexto de tenant verificado (interceptores / middleware / RLS).
* **Prohibido Cross-Tenant Leak:** Bajo ninguna circunstancia una consulta puede devolver registros de más de un tenant a la vez, excepto en consultas específicas de la capa Super Admin.
* **Tenant Lifecycle:** Cuando un colegio se suspende o desactiva, su acceso se bloquea a nivel gateway/entitlements sin eliminar sus datos de auditoría e históricos.

---

## 3. Motor de Capacidades y Entitlements

* **Verificación Previa Obligatoria:** Antes de ejecutar cualquier caso de uso o consultar un módulo, el sistema debe consultar `EntitlementService.canAccess(tenantId, featureKey, quantity)`.
* **Diferencia entre Feature Flags y Entitlements:**
  * `Feature Flag`: Habilitación técnica / despliegue progresivo.
  * `Entitlement`: Derecho comercial adquirido según el plan contratado o add-on activo.
* **Límites de Cuota (Usage Metering):** Se debe validar la capacidad máxima (`max_students`, `max_teachers`, `max_storage`, etc.) antes de persistir nuevas entidades.
* **Caché en Redis:** Los entitlements activos se cachean (`tenant:{tenant_id}:entitlements`) y se invalidan ante cambios de plan.

---

## 4. Reglas y Consistencia Financiera

* **Núcleo Transaccional Centralizado:** Todo cobro por pensiones, matrícula, tienda virtual o actividades debe procesarse a través del núcleo transaccional financiero común (`Transaction -> Payment -> Receipt -> CashBox`).
* **Partida Doble e Inmutabilidad:** Los movimientos contables y transacciones financieras son **inmutables**. No se permite `DELETE` ni `UPDATE` de montos en registros pagados. Cualquier ajuste o corrección se realiza mediante notas de crédito, devoluciones o asientos de reversión.
* **Trazabilidad de Caja:** Todo ingreso en efectivo o método manual debe estar asociado a una apertura de caja activa de un cajero/usuario específico y registrar arqueo al cierre.

---

## 5. Ownership de Dominio y Bounded Contexts

* **Esquemas / Tablas Independientes:** Cada dominio es dueño exclusivo de sus tablas:
  * `platform.*` (Tenants, suscripciones, billing de plataforma)
  * `identity.*` (Usuarios, credenciales, sesiones, roles globales)
  * `school_core.*` (Institución, sedes, periodos, niveles, secciones)
  * `student.*` (Ficha del alumno, historial, estado)
  * `family.*` (Apoderados, tutores, relaciones familiares)
  * `enrollment.*` (Admisiones, matrículas, postulaciones)
  * `academic.*` (Currículo, cursos, evaluaciones, notas, asistencia)
  * `finance.*` (Conceptos, cuotas, pagos, caja, morosidad)
  * `hr.*` / `payroll.*` (Personal, contratos, asistencia, planillas)
  * `commerce.*` (Catálogo, inventario, pedidos)
  * `activity.*` (Eventos, inscripciones, autorizaciones)
  * `notification.*` / `document.*` (Envío de mensajes, almacenamiento S3/metadatos)
* **Comunicación Exclusiva por Interfaces:** Si `enrollment` requiere verificar pagos, invoca la API interna o emite un evento `EnrollmentInitiated`.

---

## 6. Comunicación Asíncrona, Outbox Pattern e Idempotencia

* **Outbox Pattern:** Toda emisión de eventos de dominio debe persistirse en la tabla `outbox` dentro de la misma transacción de base de datos que el cambio de estado, garantizando consistencia eventual confiable (*At-Least-Once Delivery*).
* **Consumo Idempotente:** Los consumidores de RabbitMQ / Message Broker deben verificar el `event_id` contra una tabla de mensajes procesados para garantizar que los eventos duplicados no generen efectos secundarios.
* **Sagas para Procesos Distribuidos:** Los flujos que cruzan múltiples dominios (ej. Matrícula -> Creación de usuario -> Apertura de cuenta financiera -> Asignación de cupo) se coordinan mediante patrones Saga o eventos encadenados con compensaciones.

---

## 7. Contratos de API y Validación

* **Validación en el Límite:** Todo endpoint debe validar estrictamente su DTO de entrada con schemas (Class-Validator / Zod).
* **Respuestas Estandarizadas:**
```json
{
  "success": true,
  "data": { ... },
  "error": null,
  "meta": { "timestamp": "2026-08-22T00:00:00Z", "traceId": "uuid" }
}
```
* **Versionado de APIs:** Prefijo de ruta obligatorio `/api/v1/...`. Cambios incompatibles requieren `/api/v2/...`.

---

## 8. Estrategia de Pruebas

* **Test-First en Lógica Central:** Las reglas de negocio, cálculo de moras, validación de notas, liquidación de sueldos y entitlements deben contar con pruebas unitarias exhaustivas antes de pasar a producción.
* **Contract Tests:** Los contratos de API entre módulos y consumidores frontend deben validarse mediante pruebas de integración y contratos tipados compartidos.
* **Test de Aislamiento de Tenant:** Pruebas automatizadas específicas deben verificar que un usuario del Tenant A jamás pueda acceder por endpoint a datos del Tenant B.

---

## 9. Observabilidad, Trazabilidad y Auditoría

* **OpenTelemetry y Tracing Distribuido:** Toda petición debe propagar un `trace_id` y `tenant_id` en headers y logs estructurados en JSON.
* **Registro de Auditoría Obligatorio:** Cualquier mutación en datos maestros o financieros debe generar un registro de auditoría inmutable (`actor_id`, `tenant_id`, `action`, `entity_type`, `entity_id`, `before_state`, `after_state`, `ip_address`, `timestamp`).

---

## 10. Instrucciones Directas para Agentes (AGENTS.md)

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



---
*Este documento es la referencia normativa suprema del proyecto.*

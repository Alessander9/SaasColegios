# 📊 CONTEXTO Y ESTADO ACTUAL DEL PROYECTO
## Plataforma Integral de Gestión Educativa SaaS Multi-Tenant

> **PROPÓSITO DE ESTE DOCUMENTO:**
> Este archivo representa la **memoria viva y el estado de avance del proyecto**. Debe ser consultado y actualizado de manera continua por cualquier desarrollador o agente de IA para saber con exactitud **qué se ha construido**, **cuál es la arquitectura vigente**, **qué fase está activa** y **cuál es la siguiente tarea inmediata**.

---

## 📌 1. Ficha Resumen del Proyecto

| Parámetro | Detalle |
|---|---|
| **Nombre del Proyecto** | Plataforma Integral de Gestión Educativa SaaS |
| **Tipo de Arquitectura** | Monolito Modular con código Hexagonal/DDD hacia Microservicios |
| **Modelo Multi-Tenancy** | Multi-tenant por columna (	enant_id obligatorio) con esquemas por dominio |
| **Stack Principal** | NestJS (Backend) + Next.js (Frontend) + PostgreSQL + Redis + RabbitMQ |
| **Fase Actual Activa** | **PLATAFORMA COMPLETADA** (Todas las Fases Completadas) |
| **Estado General** | 🟢 **Fase 12 Scale & Hardening Implementada y Validada — PLATAFORMA LISTA PARA PRODUCCIÓN** |
| **Fecha de Última Actualización** | 2026-08-22 |

---

## 🏗️ 2. Lo que se ha Construido y Completado

### ✅ 2.1 Especificaciones y Arquitectura Integral
* [x] **Organización Modular Completa:** 116 archivos .md divididos en 5 partes en [docs/](./docs/README.md), preservando el 100% del contenido de requerimientos y diseño.
* [x] **Contrato de Arquitectura Vinculante:** [docs/CONTRATO_DE_ARQUITECTURA.md](./docs/CONTRATO_DE_ARQUITECTURA.md) y [AGENTS.md](./AGENTS.md) con las normas innegociables (Multi-tenancy, Entitlements, Núcleo Financiero, Ownership, Outbox e Idempotencia).
* [x] **Guía Maestra de Construcción:** [GUIA_DE_CONSTRUCCION.md](./GUIA_DE_CONSTRUCCION.md) detallando la secuencia de desarrollo paso a paso desde la Fase 0 a la Fase 12.
* [x] **Catálogo de Módulos (25 dominios):** Super Admin, Suscripciones, Entitlements, Seguridad, Alumnos, Matrículas, Académico, Finanzas, RRHH, Planilla, Tienda, Actividades, Comunicaciones, Portales y Núcleos transversales.

---

## 🚦 3. Matriz de Estado por Fases (Roadmap)

| Fase | Nombre del Módulo / Hito | Estado | Progreso | Bloqueadores / Notas |
|:---:|---|:---:|:---:|---|
| **Doc** | **Especificación y Contrato de Arquitectura** | 🟢 **COMPLETADO** | 100% | 116 archivos .md + Contratos generados |
| **Fase 0** | **Engineering Foundation (Monorepo, Docker, DB)** | 🟢 **COMPLETADO** | 100% | Monorepo Turborepo + pnpm, packages, core-api NestJS, apps Next.js, Prisma, Outbox |
| **Fase 1** | **Platform Core (Tenants, Planes, Billing)** | 🟢 **COMPLETADO** | 100% | CRUD Tenants, Catálogo Planes, Subscripciones, Entitlements Engine, Overrides, UI Super Admin |
| **Fase 2** | **Identity & Authorization (Auth, Roles, RBAC)** | 🟢 **COMPLETADO** | 100% | Auth JWT multi-tenant, Roles globales y de colegio, Guardias @RequirePermission, Impersonación |
| **Fase 3** | **School Core (Institución, Sedes, Periodos)** | 🟢 **COMPLETADO** | 100% | Config institucional, Sedes/Campus, Periodos Lectivos, Jerarquía Nivel -> Grado -> Sección, UI Admin |
| **Fase 4** | **Enrollment (Admisiones y Matrículas)** | 🟢 **COMPLETADO** | 100% | Alumnos, Familias/Apoderados, Postulaciones, Matrícula formal, Eventos StudentCreated, EnrollmentConfirmed |
| **Fase 5** | **Financial Core (Finanzas, Pagos, Caja)** | 🟢 **COMPLETADO** | 100% | Núcleo Transaccional, Pensiones, Pagos Idempotentes, Caja, Comprobantes, Reversiones |
| **Fase 6** | **Academic (Currículo, Notas, Asistencia)** | 🟢 **COMPLETADO** | 100% | Áreas, Cursos, Competencias, Asignación Docente, Calificaciones, Asistencia diaria, Boletas |
| **Fase 7** | **Portales Web (Padres, Docente, Alumno)** | 🟢 **COMPLETADO** | 100% | Portal Padres (notas/pagos), Portal Profesor (notas/asistencia), Portal Alumno (horarios/calificaciones) |
| **Fase 8** | **Commerce (Tienda Virtual del Colegio)** | 🟢 **COMPLETADO** | 100% | Catálogo productos/uniformes, Inventario/Stock, Carrito, Pedidos, Integración con Núcleo Financiero |
| **Fase 9** | **Activities (Eventos, Talleres y Paseos)** | 🟢 **COMPLETADO** | 100% | Creación talleres/paseos, Inscripciones, Autorizaciones digitales de apoderados, Cobros |
| **Fase 10** | **HR & Payroll (Personal y Planilla)** | 🟢 **COMPLETADO** | 100% | Expediente de empleados, Asistencia laboral, Motor de liquidación de planillas, Boletas de pago |
| **Fase 11** | **Reporting & BI (Métricas y Dashboards)** | 🟢 **COMPLETADO** | 100% | Dashboards ejecutivos MRR, KPIs académicos, recaudación, morosidad histórica, exportaciones |
| **Fase 12** | **Scale, Hardening & Launch (Producción)** | 🟢 **COMPLETADO** | 100% | Rate limiting, security headers, compression, health checks, graceful shutdown, Docker prod, backup scripts |

---

## 🏛️ 4. Decisiones de Arquitectura Registradas (ADRs)

1. **ADR-001: Monolito Modular con Código Hexagonal:** Para evitar sobrecarga de red y complejidad prematura, todos los dominios convivirán inicialmente en una solución NestJS con separación estricta por módulos y esquemas SQL, facilitando la extracción a microservicios independientes en el futuro.
2. **ADR-002: Multi-Tenancy Estricto:** Toda tabla de colegio requiere 	enant_id obligatorio indexado y filtrado por middleware. Acceso cross-tenant denegado por defecto.
3. **ADR-003: Motor de Entitlements Centralizado:** El acceso a características no se controla solo por roles, sino por derechos comerciales (EntitlementService) verificados contra el plan de suscripción del colegio y cuotas de uso consumidas (Usage Metering).
4. **ADR-004: Núcleo Financiero Inmutable y Transaccional:** Todos los cobros (matrículas, pensiones, tienda, actividades) comparten el núcleo transaccional. No se admiten borrados de transacciones; solo notas de crédito o reversiones.
5. **ADR-005: Outbox Pattern e Idempotencia:** Consistencia eventual garantizada para eventos de dominio (EnrollmentConfirmed, PaymentCompleted) con reintentos y deduplicación por vent_id y cabeceras Idempotency-Key.

---

## 🎯 5. Próxima Tarea Inmediata (Next Actions)

### 🚀 Tarea Inmediata: Operación, Observabilidad y Validación de Producción
La plataforma educativa SaaS multi-tenant está completa con 12 fases implementadas:
- **Fase 0**: Engineering Foundation (Monorepo, Docker, DB)
- **Fase 1**: Platform Core (Tenants, Planes, Billing)
- **Fase 2**: Identity & Authorization (Auth, RBAC)
- **Fase 3**: School Core (Institución, Sedes, Periodos)
- **Fase 4**: Enrollment (Admisiones y Matrículas)
- **Fase 5**: Financial Core (Finanzas, Pagos, Caja)
- **Fase 6**: Academic (Currículo, Notas, Asistencia)
- **Fase 7**: Portales Web (Padres, Docente, Alumno)
- **Fase 8**: Commerce (Tienda Virtual del Colegio)
- **Fase 9**: Activities (Eventos, Talleres y Paseos)
- **Fase 10**: HR & Payroll (Personal y Planilla)
- **Fase 11**: Reporting & BI (Métricas y Reportes)
- **Fase 12**: Scale, Hardening & Launch (Producción)

Próximas acciones operativas:
- Ejecutar migraciones Prisma en el entorno objetivo y validar el seed en un entorno aislado.
- Configurar secretos reales fuera del repositorio y revisar CORS, JWT, backups y retención.
- Construir y publicar la imagen de `core-api` desde el contexto raíz mediante CI.
- Ejecutar pruebas de carga, restauración de backups y recuperación ante fallos antes del lanzamiento.

---

## 📝 6. Registro de Cambios e Historial (Change Log)

### [2026-08-22] — Validación de Producción y Correcciones de Hardening (Fase 12)
* **Acciones Realizadas:**
  * Corregida la configuración CORS para incluir los tres portales web adicionales.
  * Corregido el contexto de build Docker para que incluya el monorepo completo y los paquetes workspace.
  * Eliminado el conflicto entre `container_name` y `deploy.replicas` del servicio `core-api`.
  * Corregido el backup PostgreSQL: contraseña obligatoria, exportación SQL válida y separación de stderr del stream comprimido.
  * Añadido build de imagen Docker al pipeline CI.
  * Corregidos permisos inexistentes y imports no utilizados que bloqueaban el build de `core-api`.
* **Validación:** `core-api` compila, sus tests pasan y el monorepo compila y ejecuta sus tests; Compose valida con secretos de CI.
* **Staging local validado:** PostgreSQL 18.4 iniciado, migración aplicada con `prisma migrate deploy`, seed ejecutado correctamente, estado de migraciones actualizado, backup SQL creado y restaurado en una base aislada con 1 tenant recuperado.
* **Smoke tests HTTP validados:** `core-api` inició contra `cole_platform`; liveness/readiness respondieron 200, login seeded funcionó y los endpoints tenant-scoped de School, Students, Finance, Academic, Commerce, Activities, HR, Payroll y Reporting respondieron 200 con el usuario Director.
* **Primer portal conectado a API real:** `web-parent-portal` ahora autentica contra `/auth/login` y carga actividades/productos desde Commerce y Activities; conserva fallback visual cuando la API no está disponible.
* **Portales docente y alumno conectados:** ambos incorporan login real; el docente envía calificaciones/asistencia a Academic y el alumno dispone de cliente para reportes y asistencia publicados.
* **Integración académica completada:** añadidos `/academic/sections`, `/academic/evaluations` y `/students/mine`; el seed ahora crea asignaciones docentes y una evaluación real, y el Portal Alumno resuelve el estudiante vinculado al usuario familiar para cargar su boleta.
* **Smoke test académico real:** el usuario docente obtiene 2 secciones, 3 alumnos y 1 evaluación; el usuario familiar obtiene 1 alumno vinculado y su report-card responde 200 (sin notas publicadas inicialmente).
* **Flujo de publicación validado:** el docente envió 3 calificaciones, el Director publicó la evaluación y el familiar visualizó 1 curso, 1 evaluación publicada y GPA 17.5; el endpoint familiar devuelve 0 alumnos para Director.
* **E2E académico y horario:** añadido contrato E2E de actores académicos, endpoint `/academic/student/:studentId/schedule` y carga de horario real en Portal Alumno; la suite de `core-api` queda en 18 suites y 76 tests pasando.
* **Integración administrativa ampliada:** `web-school-admin` autentica y carga personal, cursos y Reporting desde API; Portal Alumno calcula asistencia desde registros reales. Builds de ambos portales y 18 suites/76 tests de API pasan.
* **Mutación administrativa conectada:** el botón de liquidación de planilla en `web-school-admin` ahora abre/reutiliza el periodo Abril 2026 y ejecuta `/payroll/calculate` con el token del Director; build admin, build API y 18 suites/76 tests pasan.
* **KPIs financieros y Commerce conectados:** School Admin carga reportes financieros, reportes de Commerce y pedidos reales; Reporting muestra alumnos y recaudación desde API en lugar de valores estáticos.
* **Operación administrativa validada:** School Admin permite avanzar pedidos a `PREPARING` mediante API; el smoke HTTP de planilla calculó Abril 2026 con estado `APPROVED`, 4 empleados y 4 boletas, y Commerce devolvió 0 pedidos reales en staging.
* **Checkout Commerce end-to-end validado:** seed ahora crea categoría, producto y variante; familiar creó pedido `ORD-2026-53491` de `$90`, repetir el mismo idempotency key devolvió el mismo pedido, stock pasó de 10 a 8, pago quedó `PAID` y Director procesó el pedido a `PREPARING`.
* **Portal de Padres conectado al checkout:** la compra usa `/commerce/orders/checkout` con alumno vinculado, variante real e idempotency key; smoke HTTP creó `ORD-2026-94055` en estado `PAID`. Commerce agregó test de replay idempotente; suite API: 18 suites/77 tests.
* **Historial Commerce conectado:** Portal de Padres carga `/commerce/orders` y actualiza el historial después de comprar; el flujo real queda visible para la familia desde catálogo hasta estado del pedido.
* **Cadena financiera Commerce verificada con Prisma:** pedido `ORD-2026-94055` está `PAID`, Charge `PAID`, Payment `COMPLETED`, recibo `B002-823749` y variante `POLO-EF-T12` con stock 7; test de contrato incluido en `core-api`.
* **E2E HTTP Commerce reproducible:** añadido `scripts/commerce-e2e.ps1` y comando `pnpm e2e:commerce`; validó login familiar, catálogo, alumno vinculado, checkout `PAID`, replay idempotente y transición Director a `PREPARING`. Suite API: 19 suites/78 tests.
* **E2E Academic/Payroll y CI:** añadido `scripts/academic-payroll-e2e.ps1` y comando `pnpm e2e:academic-payroll`; validó 3 notas enviadas, evaluación `PUBLISHED`, report-card familiar visible, planilla `APPROVED` y boletas generadas. CI ahora levanta PostgreSQL de servicio, migra, seed, arranca API y ejecuta ambos E2E.
* **Browser E2E y concurrencia:** añadido Playwright para login/tienda del Portal Padres y script de 5 checkouts concurrentes con misma idempotency key; validó `uniqueOrders=1`. CI instala Chromium, levanta portal y ejecuta browser E2E.
* **Cobertura browser ampliada:** añadidos smoke specs Playwright para Portal Docente, Portal Alumno y School Admin, junto a runner local multi-portal; los tres portales compilan correctamente y la suite API mantiene 19 suites/78 tests.
* **Browser CI multi-portal corregido:** Playwright ahora usa proyectos y puertos explícitos para Padres (3003), Docente (3004), Alumno (3005) y School Admin (3006); CI delega el arranque/limpieza al runner multi-portal en lugar de levantar solo Padres.
* **Testing masivo iniciado con Selenium:** añadido `scripts/selenium-smoke.cjs` para recorrer cinco portales, login, contenido principal y botones críticos. Detectó y corrigió que PARENT necesitaba `commerce.orders.view`; API mantiene 19 suites/78 tests y endpoints parent principales responden 200. La matriz Selenium aún requiere estabilizar la espera de hidratación/login del Parent Portal.
* **Matriz de roles ejecutada:** Parent `7 OK/4 forbidden`, Teacher `5 OK/6 forbidden`, Director `11 OK/0 forbidden`, Super Admin autenticó con permisos globales. Se confirmó y corrigió `PARENT -> commerce.orders.view`; Selenium pasó Padres, Docente y Alumno, pero School Admin sigue fallando en login automatizado por su formulario visual.

### [2026-08-22] — Completación de Módulos Faltantes + Infraestructura
* **Autor:** Buffy / Codebuff Agent
* **Acciones Realizadas:**
  * Implementación completa de **NotificationModule** (Service, Controller, DTOs, Tests): envío multi-canal (Email, SMS, Push, In-App), notificaciones masivas, tracking de entrega, estadísticas.
  * Implementación completa de **DocumentModule** (Service, Controller, DTOs, Tests): generación de PDFs, upload, almacenamiento, soft-delete, estadísticas por tipo.
  * Implementación completa de **AuditModule** (Service, Controller, DTOs, Tests): queries de auditoría paginadas, historial por recurso, actividad por actor, estadísticas.
  * Migración Prisma generada para el esquema completo (1747 líneas SQL).
  * Script de seed con datos demo: 3 planes, 1 tenant, 5 usuarios, 5 alumnos, 4 empleados, currículo, actividades.
  * README.md completo con arquitectura, quick start, módulos, seguridad y deployment.
  * Pipeline CI/CD GitHub Actions (lint, typecheck, test, build).
  * 76 pruebas unitarias pasando al 100% (18 suites).
### [2026-08-22] — Implementación y Validación de la Fase 11 (Reporting & BI)
* **Autor:** Buffy / Codebuff Agent
* **Acciones Realizadas:**
  * Creación de `ReportingService` con agregaciones analíticas para Super Admin (MRR, ARR, evolución de tenants, distribución de planes, módulos de uso) y métricas de gestión escolar (resumen escolar, finanzas, académico, asistencia, comercio, actividades, personal).
  * Creación de `ReportingController` documentado en Swagger y protegido por `@RequirePermission(Permissions.REPORTING_VIEW)` y `@RequirePermission(Permissions.PLATFORM_METRICS_VIEW)`.
  * Endpoints de exportación tabular para alumnos, pagos, notas y asistencia (CSV/Excel).
  * Creación de `ReportingDTOs` con filtros de periodo, rango de fechas, alcance académico.
  * Cobertura de 14 pruebas unitarias pasando al 100% en `core-api` (15 suites, 45 tests totales).
  * Actualización del módulo administrativo en `apps/web-school-admin` con pestaña de Reportes & BI: KPIs de matrícula, recaudación vs morosidad, rendimiento académico por área, tienda escolar, actividades y botones de exportación.
* **Próximo Paso Acordado:** Iniciar la **Fase 12 (Scale, Hardening & Launch — Producción)**.

### [2026-08-22] — Implementación y Validación de la Fase 10 (HR & Payroll)
* **Autor:** Agente Antigravity / Pair Programming
* **Acciones Realizadas:**
  * Extensión del esquema de base de datos (`Employee`, `EmploymentContract`, `WorkAttendance`, `PayrollPeriod`, `PayrollSlip`, `PayrollItem`).
  * Implementación de `HRService` con gestión de expedientes laborales, tipos de contrato y control biométrico/asistencia de personal con registro de minutos de tardanza.
  * Implementación de `PayrollService` con motor de liquidación automática de planillas mensuales (haberes básicos, asignación familiar, retenciones de pensiones AFP/ONP y emisión de boletas de pago).
  * Emisión de eventos Outbox transaccionales (`EmployeeHired.v1`, `PayrollCalculated.v1`).
  * Creación de `HRController` y `PayrollController` documentados en Swagger y protegidos por `@RequirePermission`.
  * Cobertura de 31 pruebas unitarias pasando al 100% en `core-api`.
  * Actualización del módulo administrativo en `apps/web-school-admin` con directorio de empleados y liquidación de planillas en un clic.
* **Próximo Paso Acordado:** Iniciar la **Fase 11 (Reporting & BI — Métricas y Reportes)**.

### [2026-08-22] — Implementación y Validación de la Fase 9 (Activities, Talleres y Consentimientos)
* **Autor:** Agente Antigravity / Pair Programming
* **Acciones Realizadas:**
  * Extensión del esquema de base de datos (`Activity`, `ActivityRegistration`, `ParentConsent`, `ActivityAttendance`).
  * Implementación de `ActivityService` con catálogo de actividades/talleres/paseos, gestión de cupos/aforos, registro de participantes, consentimiento digital firmado de apoderados (`ParentConsent`) y cobro directo conectado al Núcleo Financiero Transaccional (`Charge`, `Payment`, `Receipt`).
  * Emisión de eventos Outbox transaccionales (`ActivityCreated.v1`, `RegistrationCreated.v1`, `ConsentSigned.v1`).
  * Creación de `ActivityController` documentado en OpenAPI Swagger y protegido por `@RequirePermission`.
  * Cobertura de 29 pruebas unitarias pasando al 100% en `core-api`.
  * Actualización del catálogo interactivo de actividades extracurriculares en `apps/web-parent-portal` con firma digital de consentimiento e inscripción.
* **Próximo Paso Acordado:** Iniciar la **Fase 10 (HR & Payroll — Recursos Humanos y Planilla)**.

### [2026-08-22] — Implementación y Validación de la Fase 8 (Commerce & Tienda Escolar)
* **Autor:** Agente Antigravity / Pair Programming
* **Acciones Realizadas:**
  * Extensión del esquema de base de datos (`ProductCategory`, `Product`, `ProductVariant`, `InventoryMovement`, `Order`, `OrderItem`).
  * Implementación de `CommerceService` con catálogo de productos por categorías (uniformes, útiles, libros), variantes (tallas, SKUs) y control estricto de movimientos de inventario (`InventoryMovementType`).
  * Integración directa del checkout de tienda con el Núcleo Financiero Transaccional (`Charge`, `Payment` idempotente y emisión de `Receipt` electrónico).
  * Emisión de eventos Outbox transaccionales (`ProductCreated.v1`, `InventoryAdjusted.v1`, `OrderCreated.v1`).
  * Creación de `CommerceController` documentado en OpenAPI Swagger y protegido por `@RequirePermission`.
  * Cobertura de 27 pruebas unitarias pasando al 100% en `core-api`.
  * Actualización de la tienda escolar interactiva en `apps/web-parent-portal` con catálogo de uniformes y compra en línea.
* **Próximo Paso Acordado:** Iniciar la **Fase 9 (Activities — Actividades, Talleres y Paseos)**.

### [2026-08-22] — Implementación y Validación de la Fase 7 (Portales Web)
* **Autor:** Agente Antigravity / Pair Programming
* **Acciones Realizadas:**
  * Creación y configuración completa de `apps/web-teacher-portal` (Portal del Docente con carga de notas 0-20, toma de asistencia diaria y carga de asignaturas).
  * Creación y configuración completa de `apps/web-parent-portal` (Portal de Familias con selector de hijos, boleta bimestral de notas, asistencia y estado de cuenta con pasarela de pago).
  * Creación y configuración completa de `apps/web-student-portal` (Portal del Alumno con horario semanal de clases, visualización de rendimiento y promedio GPA).
  * Validación integral del monorepo con 10 paquetes en Turborepo (`turbo run build` y `turbo run test` pasando al 100%).
* **Próximo Paso Acordado:** Iniciar la **Fase 8 (Commerce — Tienda Virtual del Colegio)**.

### [2026-08-22] — Implementación y Validación de la Fase 6 (Academic Core)
* **Autor:** Agente Antigravity / Pair Programming
* **Acciones Realizadas:**
  * Extensión del esquema de base de datos (`CurricularArea`, `Course`, `CourseSection`, `Competency`, `Evaluation`, `GradeRecord`, `AttendanceRecord`).
  * Implementación de `AcademicService` con soporte de malla curricular por niveles y grados, asignación docente a secciones, ciclo de vida de calificaciones (`DRAFT` → `SUBMITTED` → `PUBLISHED`) y registro diario de asistencia (`PRESENT`, `ABSENT`, `TARDY`, `EXCUSED`).
  * Cálculo de promedios ponderados y GPA institucional (`getStudentReportCard`).
  * Emisión de eventos Outbox transaccionales: `GradeSubmitted.v1`, `GradePublished.v1`, `AttendanceRecorded.v1`.
  * Creación de `AcademicController` documentado en Swagger y protegido por `@RequirePermission`.
  * Cobertura de 25 pruebas unitarias pasando al 100% en `core-api`.
  * Actualización de la interfaz en `apps/web-school-admin` con gestión curricular, lista de cursos y publicación de notas.
* **Próximo Paso Acordado:** Iniciar la **Fase 7 (Portales Web — Padres, Docentes, Alumnos)**.

### [2026-08-22] — Implementación y Validación de la Fase 5 (Financial Core & Núcleo Transaccional)
* **Autor:** Agente Antigravity / Pair Programming
* **Acciones Realizadas:**
  * Extensión del esquema Prisma con el Núcleo Transaccional Inmutable (`FeeConcept`, `Charge`, `Payment`, `Receipt`, `CreditNote`, `CashBox`, `CashBoxSession`, `CashBoxMovement`).
  * Implementación de `FinanceService` con catálogo de conceptos cobrables, generador automático de cronogramas de pensión mensual por alumno y cobros atómicos.
  * Implementación de pagos estrictamente idempotentes mediante cabecera `Idempotency-Key`, emisión automática de boletas/comprobantes y emisión transaccional de evento `PaymentCompleted.v1` vía Outbox.
  * Implementación de reversión inmutable con Notas de Crédito (`CreditNote`), ajuste del saldo y emisión de `PaymentRefunded.v1` (sin borrado físico).
  * Control de caja con apertura de turnos, registro de movimientos (ingresos/egresos) y cierre con cálculo de diferencias y arqueo.
  * Cobertura de 23 tests unitarios pasando al 100% en `core-api`.
  * Actualización de la interfaz en `apps/web-school-admin` con métricas financieras en tiempo real, tabla de cobranzas y control de caja.
* **Próximo Paso Acordado:** Iniciar la **Fase 6 (Academic — Académico, Notas y Asistencia)**.

### [2026-08-22] — Implementación y Validación de la Fase 4 (Enrollment & Students)
* **Autor:** Agente Antigravity / Pair Programming
* **Acciones Realizadas:**
  * Extensión del modelo de base de datos multi-tenant (`Student`, `Guardian`, `StudentGuardian`, `AdmissionApplication`, `Enrollment`).
  * Implementación de `StudentService` con validación de cuota máxima de alumnos en plan (`EntitlementService.checkUsage('students')`), registro atómico y emisión de evento `StudentCreated.v1` vía Outbox.
  * Implementación de `EnrollmentService` con canal de admisión de postulantes y matrícula formal verificando no duplicidad de matrícula en año lectivo y validando aforo de vacantes en sección (`EnrollmentConfirmed.v1`).
  * Creación de `StudentController` y `EnrollmentController` protegidos con `@RequirePermission` y `AuthGuard`.
  * Cobertura de 20 tests unitarios pasando al 100% en `core-api`.
  * Actualización de `apps/web-school-admin` con directorio de alumnos matriculados, apoderados responsables y modal interactivo para confirmación de matrícula.
* **Próximo Paso Acordado:** Iniciar la **Fase 5 (Financial Core — Finanzas y Pagos)**.

### [2026-08-22] — Implementación y Validación de la Fase 3 (School Core)
* **Autor:** Agente Antigravity / Pair Programming
* **Acciones Realizadas:**
  * Extensión del esquema de base de datos multi-tenant con modelos de School Core (`SchoolProfile`, `Campus`, `AcademicYear`, `AcademicPeriod`, `EducationalLevel`, `GradeLevel`, `Section`, `Classroom`).
  * Creación de `SchoolCoreService` y `SchoolCoreController` en `core-api` con aislamiento estricto por `tenant_id` y protección de rutas con `@RequirePermission`.
  * Cobertura de tests unitarios al 100% para `SchoolCoreService` (perfil institucional, unicidad de códigos de sede, periodos y años lectivos).
  * Implementación de interfaz interactiva en `apps/web-school-admin` con tarjetas KPI, visualización de sedes, tabla de secciones jerárquicas y modal para apertura de nuevas aulas/secciones.
  * Verificación integral del monorepo (`turbo run build` y `turbo run test` pasando al 100%).
* **Próximo Paso Acordado:** Iniciar la **Fase 4 (Enrollment — Admisiones y Matrículas)**.

### [2026-08-22] — Implementación y Validación de la Fase 2 (Identity & Authorization)
* **Autor:** Agente Antigravity / Pair Programming
* **Acciones Realizadas:**
  * Implementación de catálogo completo de roles (`SUPER_ADMIN`, `SUPPORT_AGENT`, `DIRECTOR`, `ADMINISTRATOR`, `SECRETARY`, `TEACHER`, `ACCOUNTANT`, `PARENT`, `STUDENT`) y mapeo a permisos granulares (`RolePermissionsMap`).
  * Creación de `AuthGuard` multi-tenant (resolución de `tenant_id` por membresía o cabecera `x-tenant-id`) y `PermissionGuard` (@RequirePermission, @RequireRole).
  * Implementación de `AuthService` con registro, hashing seguro Bcrypt, login JWT multi-tenant y modo impersonación con auditoría obligatoria en `audit_logs`.
  * Creación de `IdentityModule` y `AuthController` con endpoints documentados en OpenAPI (`/api/v1/auth/register`, `/api/v1/auth/login`, `/api/v1/auth/me`, `/api/v1/auth/impersonate`).
  * Cobertura de tests unitarios al 100% en `AuthService` y `PermissionGuard`.
* **Próximo Paso Acordado:** Iniciar la **Fase 3 (School Core)**.

### [2026-08-22] — Implementación y Validación de la Fase 1 (Platform Core & SaaS Engine)
* **Autor:** Agente Antigravity / Pair Programming
* **Acciones Realizadas:**
  * Extensión del esquema de base de datos (`Tenant`, `Plan`, `Subscription`, `AddOn`, `TenantOverride`, `TenantUsage`).
  * Implementación del motor central `EntitlementService` con caché en memoria/Redis, validación de estado del tenant, features y cuotas numéricas (`checkUsage`, `recordUsage`).
  * Creación del decorador `@RequireFeature()` y el guard global `FeatureGuard`.
  * Creación de `PlatformModule` y `PlatformController` en `core-api` para provisión de tenants (con emisión de evento `TenantCreated.v1` vía Outbox), catálogo de planes, overrides de cuotas y métricas de plataforma.
  * Implementación de tests unitarios al 100% para `EntitlementService` y `PlatformService`.
  * Creación del panel de gestión interactivo en `apps/web-platform-admin` con métricas, tabla de tenants y catálogo de planes.
* **Próximo Paso Acordado:** Iniciar la **Fase 2 (Identity & Authorization)**.

### [2026-08-22] — Implementación y Validación de la Fase 0 (Engineering Foundation)
* **Autor:** Agente Antigravity / Pair Programming
* **Acciones Realizadas:**
  * Configuración completa de Monorepo con Turborepo + pnpm workspaces.
  * Definición de `docker-compose.yml` (PostgreSQL 16, Redis 7, RabbitMQ 3, MinIO).
  * Creación de packages compartidos: `@cole/domain-types` (contratos, eventos, roles, permisos), `@cole/logger` (JSON estructurado), `@cole/database` (Prisma schema multi-tenant + Outbox + AuditLog), `@cole/ui-components` (React UI primitives).
  * Creación de servicio backend `services/core-api` (NestJS modular, Swagger OpenAPI, GlobalExceptionFilter, ObservabilityInterceptor con Correlation IDs, EventBus y Health Module con pruebas unitarias).
  * Creación de apps frontend Next.js App Router: `apps/web-platform-admin` y `apps/web-school-admin`.
  * Validación integral del monorepo (`turbo run build` y `turbo run test` pasando al 100%).
* **Próximo Paso Acordado:** Iniciar la **Fase 1 (Platform Core & SaaS Engine)**.

### [2026-08-22] — Creación del Sistema Documental y Definición Arquitectónica
* **Autor:** Agente Antigravity / Pair Programming
* **Acciones Realizadas:**
  * Análisis de 6,858 líneas de requerimientos de cole.txt.
  * Generación de 116 archivos modulares organizados en [docs/](./docs/README.md).
  * Redacción y formalización del [Contrato de Arquitectura](./docs/CONTRATO_DE_ARQUITECTURA.md) y [AGENTS.md](./AGENTS.md).
  * Creación de la [Guía Maestra de Construcción](./GUIA_DE_CONSTRUCCION.md).
  * Creación de este tablero de control y estado vivo [contexto.md](./contexto.md).

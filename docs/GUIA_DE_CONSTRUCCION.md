# 🚀 GUÍA MAESTRA DE CONSTRUCCIÓN PASO A PASO
## Plataforma Integral de Gestión Educativa SaaS Multi-Tenant

> **OBJETIVO DE ESTA GUÍA:**
> Proporcionar la hoja de ruta operativa, ordenada y secuencial para construir la plataforma educativa completa, basada rigurosamente en los 116 documentos modulares de la carpeta [docs/](./docs/README.md) y cumpliendo sin excepciones el [Contrato de Arquitectura](./docs/CONTRATO_DE_ARQUITECTURA.md).

---

## 📑 ÍNDICE DE LA GUÍA
1. [Reglas y Leyes Innegociables](#1-reglas-y-leyes-innegociables)
2. [Checklist Previo al Código](#2-checklist-previo-al-código)
3. [Stack Tecnológico y Estructura Monorepo](#3-stack-tecnológico-y-estructura-monorepo)
4. [Hoja de Ruta: Fases de Construcción (0 a 12)](#4-hoja-de-ruta-fases-de-construcción-0-a-12)
   - [Fase 0: Engineering Foundation](#fase-0-engineering-foundation)
   - [Fase 1: Platform Core & SaaS Engine](#fase-1-platform-core--saas-engine)
   - [Fase 2: Identity & Authorization](#fase-2-identity--authorization)
   - [Fase 3: School Core](#fase-3-school-core)
   - [Fase 4: Enrollment (Admisiones y Matrículas)](#fase-4-enrollment-admisiones-y-matrículas)
   - [Fase 5: Financial Core (Finanzas y Pagos)](#fase-5-financial-core-finanzas-y-pagos)
   - [Fase 6: Academic (Académico, Notas y Asistencia)](#fase-6-academic-académico-notas-y-asistencia)
   - [Fase 7: Portales Web (Padres, Docentes, Alumnos)](#fase-7-portales-web-padres-docentes-alumnos)
   - [Fase 8: Commerce (Tienda Virtual del Colegio)](#fase-8-commerce-tienda-virtual-del-colegio)
   - [Fase 9: Activities (Actividades y Eventos)](#fase-9-activities-actividades-y-eventos)
   - [Fase 10: HR & Payroll (Recursos Humanos y Planilla)](#fase-10-hr--payroll-recursos-humanos-y-planilla)
   - [Fase 11: Reporting & BI (Métricas y Reportes)](#fase-11-reporting--bi-métricas-y-reportes)
   - [Fase 12: Scale, Hardening & Launch](#fase-12-scale-hardening--launch)
5. [Definition of Done (DoD) Institucional](#5-definition-of-done-dod-institucional)
6. [Protocolo de Ejecución para Agentes y Desarrolladores](#6-protocolo-de-ejecución-para-agentes-y-desarrolladores)

---

## 1. Reglas y Leyes Innegociables

Antes de crear cualquier módulo o tabla, se deben aplicar las siguientes 7 leyes del [CONTRATO_DE_ARQUITECTURA.md](./docs/CONTRATO_DE_ARQUITECTURA.md):

1. **Multi-Tenancy Obligatorio:** Ninguna tabla o query de colegio puede existir sin 	enant_id. La separación es estricta. Ver [02-plan-de-planificacion/04-multi-tenancy.md](./docs/02-plan-de-planificacion/04-multi-tenancy.md).
2. **Entitlements First:** Ninguna pantalla o endpoint puede ejecutarse sin validar si el plan del colegio tiene activa la feature y no ha superado su cuota (Usage Metering). Ver [05-reglas-y-protocolos-del-agente/10-feature-y-entitlement-engine.md](./docs/05-reglas-y-protocolos-del-agente/10-feature-y-entitlement-engine.md).
3. **Núcleo Financiero Inmutable:** Todo cobro (matrícula, pensión, tienda, taller) pasa por el núcleo transaccional común (Transaction -> Payment -> Receipt -> CashBox). Se prohíben DELETE o UPDATE de transacciones pagadas (solo asientos de reversión/notas de crédito). Ver [01-mapa-maestro/18-nucleo-transaccional.md](./docs/01-mapa-maestro/18-nucleo-transaccional.md).
4. **Ownership Estricto de Dominio:** Ningún módulo puede hacer JOIN directo contra tablas de otro dominio. La comunicación se realiza vía interfaces de aplicación o eventos. Ver [05-reglas-y-protocolos-del-agente/04-regla-de-ownership.md](./docs/05-reglas-y-protocolos-del-agente/04-regla-de-ownership.md).
5. **Outbox Pattern e Idempotencia:** Las mutaciones que disparen eventos deben guardar el evento en la tabla outbox en la misma transacción SQL. Todo endpoint de pago o mutación crítica debe aceptar Idempotency-Key. Ver [05-reglas-y-protocolos-del-agente/12-eventos-de-dominio.md](./docs/05-reglas-y-protocolos-del-agente/12-eventos-de-dominio.md).
6. **Monolito Modular Inicial:** No desplegar 15 microservicios desde el inicio. Construir un monorepo modular con arquitectura hexagonal / DDD bien encapsulado, listo para ser desacoplado en microservicios cuando la carga lo requiera. Ver [04-plan-de-implementacion-optimizado/02-arquitectura-evolutiva-monolito-a-microservicios.md](./docs/04-plan-de-implementacion-optimizado/02-arquitectura-evolutiva-monolito-a-microservicios.md).
7. **Test-First y Observabilidad:** Todo flujo crítico debe contar con pruebas unitarias/integración y propagar 	race_id con OpenTelemetry y structured logging. Ver [05-reglas-y-protocolos-del-agente/16-observabilidad.md](./docs/05-reglas-y-protocolos-del-agente/16-observabilidad.md).

---

## 2. Checklist Previo al Código

Consulte la carpeta [03-checklist-pre-codigo-y-diseno/](./docs/03-checklist-pre-codigo-y-diseno/) para verificar que los siguientes artefactos estén definidos antes de codificar cada módulo:

* [x] **Diccionario de Negocio:** Glosario unificado de términos ([03-checklist-pre-codigo-y-diseno/04-diccionario-de-negocio-glossary.md](./docs/03-checklist-pre-codigo-y-diseno/04-diccionario-de-negocio-glossary.md)).
* [x] **Bounded Contexts:** Límites claros de cada contexto ([03-checklist-pre-codigo-y-diseno/05-bounded-contexts.md](./docs/03-checklist-pre-codigo-y-diseno/05-bounded-contexts.md)).
* [x] **System of Record:** Asignación única de verdad por entidad ([03-checklist-pre-codigo-y-diseno/06-definir-system-of-record.md](./docs/03-checklist-pre-codigo-y-diseno/06-definir-system-of-record.md)).
* [x] **Workflows Críticos:** Flujos de matrícula, cobros, calificaciones y compras ([03-checklist-pre-codigo-y-diseno/07-disenar-workflows-criticos.md](./docs/03-checklist-pre-codigo-y-diseno/07-disenar-workflows-criticos.md)).
* [x] **Catálogo de Eventos y Contratos API:** ([03-checklist-pre-codigo-y-diseno/13-catalogo-de-eventos.md](./docs/03-checklist-pre-codigo-y-diseno/13-catalogo-de-eventos.md) y [12-contratos-de-api-entre-servicios.md](./docs/03-checklist-pre-codigo-y-diseno/12-contratos-de-api-entre-servicios.md)).

---

## 3. Stack Tecnológico y Estructura Monorepo

### Stack Recomendado:
* **Backend:** Node.js / TypeScript con **NestJS** (Arquitectura Modular, Hexagonal/Clean Architecture).
* **Frontend:** **Next.js** (App Router, React, TypeScript).
* **Estilos y UI:** **Tailwind CSS** + Componentes de diseño propios / Radix UI.
* **Base de Datos:** **PostgreSQL** (Esquemas por dominio: platform, identity, school_core, inance, etc.).
* **Caché y Sesiones:** **Redis** (para tokens, rate limiting y caché de entitlements).
* **Mensajería Asíncrona:** **RabbitMQ** (gestión de colas y eventos de dominio).
* **Almacenamiento:** MinIO / AWS S3 (Documentos, fotos, boletas).
* **Monorepo:** Turborepo / pnpm workspaces.

### Estructura Monorepo:
`	ext
cole-platform/
├── apps/
│   ├── web-platform-admin/          # Portal Super Admin
│   ├── web-school-admin/            # Panel Administrador del Colegio
│   ├── web-teacher-portal/          # Portal del Profesor
│   ├── web-parent-portal/           # Portal de Padres y Familias
│   └── web-student-portal/          # Portal del Alumno
│
├── services/
│   └── core-api/                    # Monolito Modular NestJS
│       └── src/
│           ├── modules/
│           │   ├── platform/        # Tenants, Suscripciones, Planes
│           │   ├── identity/        # Auth, MFA, Roles, Permisos
│           │   ├── entitlement/     # Motor de Features y Límites
│           │   ├── school-core/     # Institución, Sedes, Niveles, Secciones
│           │   ├── student/         # Alumnos y Fichas
│           │   ├── family/          # Apoderados y Relaciones
│           │   ├── enrollment/      # Admisiones y Matrículas
│           │   ├── academic/        # Cursos, Horarios, Notas, Asistencia
│           │   ├── finance/         # Transacciones, Pensiones, Pagos, Caja
│           │   ├── commerce/        # Tienda, Catálogo, Stock, Pedidos
│           │   ├── activity/        # Talleres, Eventos, Paseos
│           │   ├── hr/              # Personal, Contratos
│           │   ├── payroll/         # Planilla, Sueldos, Boletas
│           │   ├── notification/    # Emails, SMS, Push
│           │   ├── document/        # S3, Generación de PDFs
│           │   └── audit/           # Logs inmutables y trazabilidad
│           └── shared/              # Outbox, EventBus, Interceptors, DB
│
├── packages/
│   ├── database/                    # Prisma / TypeORM / Drizzle Migrations
│   ├── domain-types/                # Tipos y Contratos de Dominio compartidos
│   ├── ui-components/               # Design System y componentes React
│   └── logger/                      # OpenTelemetry y Logger estructurado
│
├── docker-compose.yml               # PostgreSQL, Redis, RabbitMQ, MinIO
└── turbo.json
`
*(Ver detalle en [05-reglas-y-protocolos-del-agente/07-estructura-del-monorepo.md](./docs/05-reglas-y-protocolos-del-agente/07-estructura-del-monorepo.md))*

---

## 4. Hoja de Ruta: Fases de Construcción (0 a 12)

### Fase 0: Engineering Foundation
* **Objetivo:** Infraestructura base, monorepo, tooling, base de datos y tipado compartido.
* **Documentación de Referencia:** [04-plan-de-implementacion-optimizado/04-fase-0-engineering-foundation.md](./docs/04-plan-de-implementacion-optimizado/04-fase-0-engineering-foundation.md).
* **Entregables:**
  1. Configuración de Monorepo con Turborepo + pnpm.
  2. docker-compose.yml con PostgreSQL 16, Redis 7, RabbitMQ 3.
  3. Paquete @cole/database con sistema de migraciones automáticas.
  4. Implementación del Outbox Pattern y EventBus asíncrono.
  5. Logger estructurado JSON con middleware de 	race_id (OpenTelemetry).
  6. Pipeline de CI con linting, typechecking y test runner.

---

### Fase 1: Platform Core & SaaS Engine
* **Objetivo:** Gestión de tenants, planes comerciales, suscripciones y billing de plataforma.
* **Documentación de Referencia:** [04-plan-de-implementacion-optimizado/05-fase-1-platform-core.md](./docs/04-plan-de-implementacion-optimizado/05-fase-1-platform-core.md) y [01-mapa-maestro/01-super-admin-platform.md](./docs/01-mapa-maestro/01-super-admin-platform.md).
* **Entregables:**
  1. CRUD de Tenants (Crear colegio, suspender, activar, configurar dominio/subdominio).
  2. Catálogo de Planes (Básico, Profesional, Enterprise) con definición de features y cuotas.
  3. Motor de Entitlements (EntitlementService.canAccess(tenantId, feature)).
  4. Caché de entitlements en Redis y mecanismo de invalidación.
  5. Portal Web Super Admin inicial.

---

### Fase 2: Identity & Authorization
* **Objetivo:** Autenticación centralizada, RBAC granular, sesiones seguras y soporte de impersonación.
* **Documentación de Referencia:** [04-plan-de-implementacion-optimizado/06-fase-2-identity-authorization.md](./docs/04-plan-de-implementacion-optimizado/06-fase-2-identity-authorization.md) y [01-mapa-maestro/04-identidad-roles-y-seguridad.md](./docs/01-mapa-maestro/04-identidad-roles-y-seguridad.md).
* **Entregables:**
  1. Autenticación JWT / Sesiones con soporte multi-tenant (resolución de 	enant_id por membresía).
  2. Sistema de Roles globales (Super Admin, Support) y de colegio (Director, Admin, Secretaría, Profesor, Padre, Alumno).
  3. Guardias de autorización por permisos (@RequirePermission('students.create')).
  4. Modo Impersonación de soporte con log obligatorio de auditoría.
  5. Flujos de Login, Recuperación de contraseña y MFA (opcional).

---

### Fase 3: School Core
* **Objetivo:** Configuración institucional del colegio, sedes, periodos académicos y estructura física/lógica.
* **Documentación de Referencia:** [04-plan-de-implementacion-optimizado/07-fase-3-school-core.md](./docs/04-plan-de-implementacion-optimizado/07-fase-3-school-core.md) y [01-mapa-maestro/05-gestion-institucional.md](./docs/01-mapa-maestro/05-gestion-institucional.md).
* **Entregables:**
  1. Configuración institucional (datos, logo, moneda, zona horaria).
  2. Gestión de Sedes y Campus.
  3. Periodos escolares (Años lectivos, Bimestres, Trimestres, Semestres).
  4. Jerarquía académica: Nivel -> Grado -> Sección -> Aula.
  5. API y vistas de administración escolar.

---

### Fase 4: Enrollment (Admisiones y Matrículas)
* **Objetivo:** Ficha de alumnos, familias, proceso de postulación, admisión y matrícula formal.
* **Documentación de Referencia:** [04-plan-de-implementacion-optimizado/08-fase-4-enrollment.md](./docs/04-plan-de-implementacion-optimizado/08-fase-4-enrollment.md), [01-mapa-maestro/06-alumnos.md](./docs/01-mapa-maestro/06-alumnos.md), [07-familias-y-apoderados.md](./docs/01-mapa-maestro/07-familias-y-apoderados.md) y [08-admisiones-y-matriculas.md](./docs/01-mapa-maestro/08-admisiones-y-matriculas.md).
* **Entregables:**
  1. Módulo de Alumnos (datos personales, historial, estados: Preinscrito, Activo, Retirado, Egresado).
  2. Módulo de Familias y Apoderados (relación padre-alumno, contactos de emergencia).
  3. Flujo de Admisiones (postulación, evaluación, entrevistas, aceptación).
  4. Proceso de Matrícula y asignación de sección.
  5. Emisión de eventos: StudentCreated.v1, EnrollmentConfirmed.v1.

---

### Fase 5: Financial Core (Finanzas y Pagos)
* **Objetivo:** Núcleo transaccional financiero, cronograma de pensiones, caja, pagos, comprobantes y morosidad.
* **Documentación de Referencia:** [04-plan-de-implementacion-optimizado/09-fase-5-financial-core.md](./docs/04-plan-de-implementacion-optimizado/09-fase-5-financial-core.md), [01-mapa-maestro/10-finanzas.md](./docs/01-mapa-maestro/10-finanzas.md) y [18-nucleo-transaccional.md](./docs/01-mapa-maestro/18-nucleo-transaccional.md).
* **Entregables:**
  1. Catálogo de conceptos cobrables (matrícula, pensiones, cuotas, talleres).
  2. Generación automática de cronogramas de pensiones por alumno/familia con mora y descuentos/becas.
  3. Motor de Pagos con soporte de múltiples métodos e idempotencia obligatoria.
  4. Control de Caja (Apertura, Movimientos, Ingresos, Egresos, Cierre y Arqueo).
  5. Control de Morosidad y Estados de Cuenta familiares.
  6. Emisión de eventos: ChargeCreated.v1, PaymentCompleted.v1.

---

### Fase 6: Academic (Académico, Notas y Asistencia)
* **Objetivo:** Currículo escolar, asignaturas, malla, evaluaciones, registro de notas y control de asistencia.
* **Documentación de Referencia:** [04-plan-de-implementacion-optimizado/10-fase-6-academic.md](./docs/04-plan-de-implementacion-optimizado/10-fase-6-academic.md) y [01-mapa-maestro/09-gestion-academica.md](./docs/01-mapa-maestro/09-gestion-academica.md).
* **Entregables:**
  1. Definición curricular (Áreas, Cursos, Competencias, Capacidades, Criterios).
  2. Asignación de Cursos por Sección, Profesor, Horarios y Aulas.
  3. Registro y Cierre de Notas con cálculo automático de promedios según escala de notas.
  4. Registro de Asistencia diaria/por curso (Presente, Ausente, Tardanza, Justificado).
  5. Generación de Boletas de Notas y Actas académicas oficiales.

---

### Fase 7: Portales Web (Padres, Docentes, Alumnos)
* **Objetivo:** Experiencia de usuario segmentada y portales web dedicados.
* **Documentación de Referencia:** [04-plan-de-implementacion-optimizado/11-fase-7-portales.md](./docs/04-plan-de-implementacion-optimizado/11-fase-7-portales.md) y [01-mapa-maestro/17-portales.md](./docs/01-mapa-maestro/17-portales.md).
* **Entregables:**
  1. **Portal Padres:** Ver notas, asistencia, estado de cuenta, pagos en línea de pensiones, compras y comunicados.
  2. **Portal Profesor:** Registro de notas, asistencia, horarios, lista de alumnos y mensajería.
  3. **Portal Alumno:** Horarios, tareas, calificaciones y eventos.
  4. Responsive design y accesibilidad mobile-first.

---

### Fase 8: Commerce (Tienda Virtual del Colegio)
* **Objetivo:** Catálogo de uniformes, libros, útiles, inventario y venta en línea vinculada al núcleo transaccional.
* **Documentación de Referencia:** [04-plan-de-implementacion-optimizado/12-fase-8-commerce.md](./docs/04-plan-de-implementacion-optimizado/12-fase-8-commerce.md) y [01-mapa-maestro/13-tienda-virtual.md](./docs/01-mapa-maestro/13-tienda-virtual.md).
* **Entregables:**
  1. Catálogo de productos con variantes (tallas, colores, SKU) y fotos.
  2. Control de Inventario (stock, entradas, salidas, reservas, stock mínimo).
  3. Carrito de compras, checkout e integración directa con el núcleo financiero.
  4. Gestión de Pedidos (Pendiente, Pagado, En preparación, Entregado).

---

### Fase 9: Activities (Actividades y Eventos)
* **Objetivo:** Paseos, talleres extracurriculares, campamentos, inscripciones y autorizaciones digitales.
* **Documentación de Referencia:** [04-plan-de-implementacion-optimizado/13-fase-9-activities.md](./docs/04-plan-de-implementacion-optimizado/13-fase-9-activities.md) y [01-mapa-maestro/14-actividades-y-eventos.md](./docs/01-mapa-maestro/14-actividades-y-eventos.md).
* **Entregables:**
  1. Creación de actividades (fechas, cupos, precio, transporte, profesores a cargo).
  2. Formulario de inscripción y cobro automático vía núcleo financiero.
  3. Autorización digital obligatoria firmada/confirmada por el apoderado.
  4. Lista de asistencia y control del evento.

---

### Fase 10: HR & Payroll (Recursos Humanos y Planilla)
* **Objetivo:** Expediente de empleados, control de asistencia laboral, liquidación de planillas y boletas de pago.
* **Documentación de Referencia:** [04-plan-de-implementacion-optimizado/14-fase-10-hr-payroll.md](./docs/04-plan-de-implementacion-optimizado/14-fase-10-hr-payroll.md), [01-mapa-maestro/11-recursos-humanos.md](./docs/01-mapa-maestro/11-recursos-humanos.md) y [12-planilla.md](./docs/01-mapa-maestro/12-planilla.md).
* **Entregables:**
  1. Ficha del personal (docentes, administrativos), contratos y documentos.
  2. Registro de asistencia laboral, tardanzas, faltas, vacaciones y permisos.
  3. Motor de Planilla (conceptos remunerativos, bonos, descuentos de ley, adelantos, préstamos).
  4. Generación y distribución de boletas de pago para el personal.

---

### Fase 11: Reporting & BI (Métricas y Reportes)
* **Objetivo:** Dashboards ejecutivos para el Super Admin y paneles analíticos para la dirección del colegio.
* **Documentación de Referencia:** [04-plan-de-implementacion-optimizado/15-fase-11-reporting-bi.md](./docs/04-plan-de-implementacion-optimizado/15-fase-11-reporting-bi.md) y [01-mapa-maestro/16-reportes.md](./docs/01-mapa-maestro/16-reportes.md).
* **Entregables:**
  1. Dashboards de Plataforma: MRR, colegios activos, tasa de retención, consumo de recursos.
  2. Dashboards de Colegio: Rendimiento académico, ausentismo, recaudación, morosidad histórica, ventas de tienda.
  3. Exportación masiva de datos en Excel, PDF y CSV.

---

### Fase 12: Scale, Hardening & Launch
* **Objetivo:** Pruebas de estrés, auditoría de seguridad, resiliencia y puesta en producción.
* **Documentación de Referencia:** [04-plan-de-implementacion-optimizado/16-fase-12-scale-hardening.md](./docs/04-plan-de-implementacion-optimizado/16-fase-12-scale-hardening.md) y [03-checklist-pre-codigo-y-diseno/23-pruebas-de-carga.md](./docs/03-checklist-pre-codigo-y-diseno/23-pruebas-de-carga.md).
* **Entregables:**
  1. Pruebas de carga para picos de matrícula y reporte de notas.
  2. Simulacro de recuperación ante desastres (RPO < 1h, RTO < 4h).
  3. Hardening de seguridad, rate limiting y escaneo de vulnerabilidades.
  4. Despliegue de producción con monitoreo en tiempo real.

---

## 5. Definition of Done (DoD) Institucional

Ninguna tarea o fase se considera terminada si no cumple con:
1. **Código y Tipos:** 100% TypeScript estricto, sin ny injustificados, respetando linting.
2. **Aislamiento Multi-Tenant:** Verificado en pruebas que no existen fugas de datos entre tenants.
3. **Entitlements y Permisos:** Decoradores @RequirePermission y validación de cuotas activos.
4. **Pruebas Automatizadas:** Tests unitarios de lógica de negocio y tests de integración de API pasando con éxito.
5. **Idempotencia y Outbox:** Transacciones financieras protegidas y eventos emitidos por outbox.
6. **Auditoría:** Registro de auditoría generado en toda mutación.
7. **Documentación:** Swagger/OpenAPI actualizado y registro de progreso en contexto.md.

---

## 6. Protocolo de Ejecución para Agentes y Desarrolladores

Para cada nueva tarea o fase:
`	ext
1. Leer documentación del módulo en docs/
2. Identificar el Bounded Context y verificar Ownership
3. Validar permisos y Entitlements requeridos
4. Diseñar migración de base de datos (con tenant_id)
5. Implementar casos de uso con arquitectura hexagonal
6. Escribir pruebas unitarias e integración
7. Emitir eventos de dominio vía Outbox
8. Ejecutar suite de pruebas y validar DoD
9. Actualizar contexto.md con el nuevo estado del proyecto
`

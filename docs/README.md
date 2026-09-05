# 🏫 Plataforma Integral de Gestión Educativa SaaS
## Guía Maestra de Construcción, Arquitectura y Especificaciones Técnicas

Bienvenido al repositorio documental central de la **Plataforma Integral de Gestión Educativa SaaS**. Esta documentación ha sido organizada de forma modular, exhaustiva y estructurada a partir del mapa maestro y las especificaciones técnicas completas, **sin omitir ningún requerimiento, diagrama o regla de negocio**.

---

### 🛡️ Documento de Referencia Innegociable
> Antes de escribir cualquier línea de código o diseñar cualquier módulo, es **obligatorio** leer y cumplir el:
> ### 📜 [CONTRATO DE ARQUITECTURA Y NORMAS INNEGOCIABLES](./CONTRATO_DE_ARQUITECTURA.md)
> *(También disponible en la raíz del proyecto como [AGENTS.md](../AGENTS.md) y [contrato de arquitectura.txt](../contrato%20de%20arquitectura.txt))*

---

## 🗺️ Estructura General de la Documentación

```text
docs/
├── 📜 CONTRATO_DE_ARQUITECTURA.md              # Normas innegociables y reglas para agentes
├── 🏛️ 01-mapa-maestro/                         # 27 documentos: Módulos 00 al 25 y decisiones técnicas
├── 🧭 02-plan-de-planificacion/                # 21 documentos: Plan maestro de planificación integral
├── 📋 03-checklist-pre-codigo-y-diseno/        # 27 documentos: 25 especificaciones técnicas pre-código
├── 🏗️ 04-plan-de-implementacion-optimizado/    # 20 documentos: 4 niveles, arquitectura evolutiva y fases 0-12
└── 🤖 05-reglas-y-protocolos-del-agente/       # 21 documentos: AGENTS.md, monorepo, contratos y protocolos
```

---

## 📚 Índice Detallado de Documentos

### 🏛️ Parte 1: Mapa Maestro de la Plataforma Educativa SaaS

> Definición del alcance funcional completo de la plataforma, arquitectura general de 25 módulos, gestión institucional, alumnos, familias, admisiones, académico, finanzas, RRHH, planilla, tienda, actividades, comunicaciones, reportes, portales y stack técnico inicial.

| # | Documento | Enlace Directo |
|---|---|---|
| 00 | 00. Arquitectura General del SaaS | [Ver documento](./01-mapa-maestro/00-arquitectura-general.md) |
| 01 | 01. Super Admin / Platform | [Ver documento](./01-mapa-maestro/01-super-admin-platform.md) |
| 02 | 02. Suscripciones y Billing | [Ver documento](./01-mapa-maestro/02-suscripciones-y-billing.md) |
| 03 | 03. Módulos / Entitlements | [Ver documento](./01-mapa-maestro/03-modulos-y-entitlements.md) |
| 04 | 04. Identidad, Roles y Seguridad | [Ver documento](./01-mapa-maestro/04-identidad-roles-y-seguridad.md) |
| 05 | 05. Gestión Institucional | [Ver documento](./01-mapa-maestro/05-gestion-institucional.md) |
| 06 | 06. Alumnos | [Ver documento](./01-mapa-maestro/06-alumnos.md) |
| 07 | 07. Familias y Apoderados | [Ver documento](./01-mapa-maestro/07-familias-y-apoderados.md) |
| 08 | 08. Admisiones y Matrículas | [Ver documento](./01-mapa-maestro/08-admisiones-y-matriculas.md) |
| 09 | 09. Gestión Académica | [Ver documento](./01-mapa-maestro/09-gestion-academica.md) |
| 10 | 10. Finanzas | [Ver documento](./01-mapa-maestro/10-finanzas.md) |
| 11 | 11. Recursos Humanos | [Ver documento](./01-mapa-maestro/11-recursos-humanos.md) |
| 12 | 12. Planilla | [Ver documento](./01-mapa-maestro/12-planilla.md) |
| 13 | 13. Tienda Virtual | [Ver documento](./01-mapa-maestro/13-tienda-virtual.md) |
| 14 | 14. Actividades y Eventos | [Ver documento](./01-mapa-maestro/14-actividades-y-eventos.md) |
| 15 | 15. Comunicaciones | [Ver documento](./01-mapa-maestro/15-comunicaciones.md) |
| 16 | 16. Reportes | [Ver documento](./01-mapa-maestro/16-reportes.md) |
| 17 | 17. Portales (Padres, Profesor, Alumno) | [Ver documento](./01-mapa-maestro/17-portales.md) |
| 18 | 18. Núcleo Transaccional | [Ver documento](./01-mapa-maestro/18-nucleo-transaccional.md) |
| 19 | 19. Núcleo de Documentos | [Ver documento](./01-mapa-maestro/19-nucleo-de-documentos.md) |
| 20 | 20. Motor de Notificaciones | [Ver documento](./01-mapa-maestro/20-motor-de-notificaciones.md) |
| 21 | 21. API e Integraciones | [Ver documento](./01-mapa-maestro/21-api-e-integraciones.md) |
| 22 | 22. Auditoría y Monitoreo | [Ver documento](./01-mapa-maestro/22-auditoria-y-monitoreo.md) |
| 23 | 23. Relaciones Principales | [Ver documento](./01-mapa-maestro/23-relaciones-principales.md) |
| 24 | 24. Dependencias entre Módulos | [Ver documento](./01-mapa-maestro/24-dependencias-entre-modulos.md) |
| 25 | 25. Clasificación de Módulos (Core, Educación, Finanzas, etc.) | [Ver documento](./01-mapa-maestro/25-clasificacion-de-modulos.md) |
| 26 | 26. Mapa Maestro Completo y Decisiones Técnicas (Stack, Arquitectura, Bounded Contexts, Eventos, Idempotencia) | [Ver documento](./01-mapa-maestro/26-mapa-integral-y-decisiones-tecnicas.md) |

---

### 🧭 Parte 2: Plan Maestro de Planificación Integral

> Planificación estratégica de ingeniería previa al código: requerimientos funcionales y no funcionales, workflows, modelo de dominio, multi-tenancy, modelo comercial, roles/permisos, modelo de datos, arquitectura financiera, UX/UI, reportes, eventos, integraciones, seguridad, testing, DevOps y roadmap.

| # | Documento | Enlace Directo |
|---|---|---|
| 01 | 01. Requerimientos Funcionales | [Ver documento](./02-plan-de-planificacion/01-requerimientos-funcionales.md) |
| 02 | 02. Procesos y Workflows | [Ver documento](./02-plan-de-planificacion/02-procesos-y-workflows.md) |
| 03 | 03. Modelo de Dominio | [Ver documento](./02-plan-de-planificacion/03-modelo-de-dominio.md) |
| 04 | 04. Multi-tenancy | [Ver documento](./02-plan-de-planificacion/04-multi-tenancy.md) |
| 05 | 05. Modelo Comercial y Add-ons | [Ver documento](./02-plan-de-planificacion/05-modelo-comercial-y-addons.md) |
| 06 | 06. Modelo de Roles y Permisos | [Ver documento](./02-plan-de-planificacion/06-modelo-de-roles-y-permisos.md) |
| 07 | 07. Modelo de Datos (Maestros, Transaccionales, Históricos) | [Ver documento](./02-plan-de-planificacion/07-modelo-de-datos.md) |
| 08 | 08. Arquitectura Financiera | [Ver documento](./02-plan-de-planificacion/08-arquitectura-financiera.md) |
| 09 | 09. Comercio y Actividades | [Ver documento](./02-plan-de-planificacion/09-comercio-y-actividades.md) |
| 10 | 10. UX/UI y Diseño de Producto | [Ver documento](./02-plan-de-planificacion/10-ux-ui-y-diseno-de-producto.md) |
| 11 | 11. Reportes y BI | [Ver documento](./02-plan-de-planificacion/11-reportes-y-bi.md) |
| 12 | 12. Eventos del Sistema | [Ver documento](./02-plan-de-planificacion/12-eventos-del-sistema.md) |
| 13 | 13. Integraciones Externas | [Ver documento](./02-plan-de-planificacion/13-integraciones-externas.md) |
| 14 | 14. Seguridad y Compliance | [Ver documento](./02-plan-de-planificacion/14-seguridad-y-compliance.md) |
| 15 | 15. Escalabilidad (V1, V2, V3) | [Ver documento](./02-plan-de-planificacion/15-escalabilidad.md) |
| 16 | 16. Disponibilidad y Recuperación (RTO / RPO) | [Ver documento](./02-plan-de-planificacion/16-disponibilidad-y-recuperacion.md) |
| 17 | 17. Estrategia de Testing | [Ver documento](./02-plan-de-planificacion/17-estrategia-de-testing.md) |
| 18 | 18. DevOps | [Ver documento](./02-plan-de-planificacion/18-devops.md) |
| 19 | 19. Estrategia de Versionado (API, Eventos, DB) | [Ver documento](./02-plan-de-planificacion/19-estrategia-de-versionado.md) |
| 20 | 20. Roadmap (Fases 0 a 9) | [Ver documento](./02-plan-de-planificacion/20-roadmap-fases.md) |
| 21 | 21. Visión y Orden Recomendado | [Ver documento](./02-plan-de-planificacion/21-vision-y-orden-recomendado.md) |

---

### 📋 Parte 3: Checklist Pre-Código y Especificaciones Clave

> Checklist riguroso de 25 especificaciones técnicas que deben estar resueltas antes de escribir código: problemas por producto, RF detallados, RNF, glosario de negocio, bounded contexts, system of record, workflows críticos, diseño financiero, autorización, entitlements, ERD, contratos API, eventos, design system, costos, walking skeleton y Definition of Done.

| # | Documento | Enlace Directo |
|---|---|---|
| 00 | 00. Introducción al Checklist | [Ver documento](./03-checklist-pre-codigo-y-diseno/00-introduccion-checklist.md) |
| 01 | 01. Definir Qué Problema Resolvemos por Producto (A a F) | [Ver documento](./03-checklist-pre-codigo-y-diseno/01-definir-problema-por-producto.md) |
| 02 | 02. Requerimientos Funcionales Detallados (RF-MAT-001 a 005) | [Ver documento](./03-checklist-pre-codigo-y-diseno/02-requerimientos-funcionales-detallados.md) |
| 03 | 03. Requisitos No Funcionales (Rendimiento, Disponibilidad, Seguridad) | [Ver documento](./03-checklist-pre-codigo-y-diseno/03-requisitos-no-funcionales.md) |
| 04 | 04. Diccionario de Negocio (Business Glossary) | [Ver documento](./03-checklist-pre-codigo-y-diseno/04-diccionario-de-negocio-glossary.md) |
| 05 | 05. Bounded Contexts | [Ver documento](./03-checklist-pre-codigo-y-diseno/05-bounded-contexts.md) |
| 06 | 06. Definir el System of Record | [Ver documento](./03-checklist-pre-codigo-y-diseno/06-definir-system-of-record.md) |
| 07 | 07. Diseñar Workflows Críticos | [Ver documento](./03-checklist-pre-codigo-y-diseno/07-disenar-workflows-criticos.md) |
| 08 | 08. Diseñar Primero el Núcleo Financiero | [Ver documento](./03-checklist-pre-codigo-y-diseno/08-disenar-nucleo-financiero.md) |
| 09 | 09. Diseñar el Modelo de Autorización | [Ver documento](./03-checklist-pre-codigo-y-diseno/09-disenar-modelo-de-autorizacion.md) |
| 10 | 10. Diseñar el Entitlement Engine | [Ver documento](./03-checklist-pre-codigo-y-diseno/10-disenar-entitlement-engine.md) |
| 11 | 11. Modelo de Datos antes de Programar (ERD) | [Ver documento](./03-checklist-pre-codigo-y-diseno/11-modelo-de-datos-erd.md) |
| 12 | 12. Diseñar Contratos de API entre Servicios | [Ver documento](./03-checklist-pre-codigo-y-diseno/12-contratos-de-api-entre-servicios.md) |
| 13 | 13. Catálogo de Eventos (Event Catalog) | [Ver documento](./03-checklist-pre-codigo-y-diseno/13-catalogo-de-eventos.md) |
| 14 | 14. Estrategia de Testing Integral | [Ver documento](./03-checklist-pre-codigo-y-diseno/14-estrategia-de-testing.md) |
| 15 | 15. Design System | [Ver documento](./03-checklist-pre-codigo-y-diseno/15-design-system.md) |
| 16 | 16. Localización y Configuración Regional | [Ver documento](./03-checklist-pre-codigo-y-diseno/16-localizacion-y-configuracion-regional.md) |
| 17 | 17. Legal y Compliance | [Ver documento](./03-checklist-pre-codigo-y-diseno/17-legal-y-compliance.md) |
| 18 | 18. Modelo de Costos | [Ver documento](./03-checklist-pre-codigo-y-diseno/18-modelo-de-costos.md) |
| 19 | 19. Métricas de Negocio | [Ver documento](./03-checklist-pre-codigo-y-diseno/19-metricas-de-negocio.md) |
| 20 | 20. Walking Skeleton: Caso Crear Alumno | [Ver documento](./03-checklist-pre-codigo-y-diseno/20-walking-skeleton-caso-alumno.md) |
| 21 | 21. Estrategia de Migraciones | [Ver documento](./03-checklist-pre-codigo-y-diseno/21-estrategia-de-migraciones.md) |
| 22 | 22. Crear un Demo School | [Ver documento](./03-checklist-pre-codigo-y-diseno/22-demo-school.md) |
| 23 | 23. Pruebas de Carga | [Ver documento](./03-checklist-pre-codigo-y-diseno/23-pruebas-de-carga.md) |
| 24 | 24. Failure Scenarios | [Ver documento](./03-checklist-pre-codigo-y-diseno/24-failure-scenarios.md) |
| 25 | 25. Definition of Done | [Ver documento](./03-checklist-pre-codigo-y-diseno/25-definition-of-done.md) |
| 26 | 26. Lo que Haría Ahora y 5 Entregables Imprescindibles | [Ver documento](./03-checklist-pre-codigo-y-diseno/26-entregables-imprescindibles-antes-del-codigo.md) |

---

### 🏗️ Parte 4: Plan de Implementación Optimizado y Fases de Desarrollo

> Estrategia modular monolítica a microservicios dividida en 4 niveles y 13 fases ordenadas (Fase 0 a Fase 12), con entregables exactos, criterios de éxito, Feature Lifecycle, Usage Metering y el Plan de Implementación Maestro v1.0.

| # | Documento | Enlace Directo |
|---|---|---|
| 01 | 01. Separación en 4 Niveles (Platform, School Core, Domain Modules, Shared Infra) | [Ver documento](./04-plan-de-implementacion-optimizado/01-separacion-en-4-niveles.md) |
| 02 | 02. Arquitectura Evolutiva: No 15 Microservicios de Golpe | [Ver documento](./04-plan-de-implementacion-optimizado/02-arquitectura-evolutiva-monolito-a-microservicios.md) |
| 03 | 03. Orden de Desarrollo y Secuencia de Fases | [Ver documento](./04-plan-de-implementacion-optimizado/03-orden-de-desarrollo-y-fases.md) |
| 04 | 04. Fase 0 — Engineering Foundation | [Ver documento](./04-plan-de-implementacion-optimizado/04-fase-0-engineering-foundation.md) |
| 05 | 05. Fase 1 — Platform Core | [Ver documento](./04-plan-de-implementacion-optimizado/05-fase-1-platform-core.md) |
| 06 | 06. Fase 2 — Identity + Authorization | [Ver documento](./04-plan-de-implementacion-optimizado/06-fase-2-identity-authorization.md) |
| 07 | 07. Fase 3 — School Core | [Ver documento](./04-plan-de-implementacion-optimizado/07-fase-3-school-core.md) |
| 08 | 08. Fase 4 — Enrollment | [Ver documento](./04-plan-de-implementacion-optimizado/08-fase-4-enrollment.md) |
| 09 | 09. Fase 5 — Financial Core | [Ver documento](./04-plan-de-implementacion-optimizado/09-fase-5-financial-core.md) |
| 10 | 10. Fase 6 — Academic | [Ver documento](./04-plan-de-implementacion-optimizado/10-fase-6-academic.md) |
| 11 | 11. Fase 7 — Portales (Admin, Profesor, Padre, Alumno) | [Ver documento](./04-plan-de-implementacion-optimizado/11-fase-7-portales.md) |
| 12 | 12. Fase 8 — Commerce | [Ver documento](./04-plan-de-implementacion-optimizado/12-fase-8-commerce.md) |
| 13 | 13. Fase 9 — Activities | [Ver documento](./04-plan-de-implementacion-optimizado/13-fase-9-activities.md) |
| 14 | 14. Fase 10 — HR + Payroll | [Ver documento](./04-plan-de-implementacion-optimizado/14-fase-10-hr-payroll.md) |
| 15 | 15. Fase 11 — Reporting / BI | [Ver documento](./04-plan-de-implementacion-optimizado/15-fase-11-reporting-bi.md) |
| 16 | 16. Fase 12 — Scale & Hardening | [Ver documento](./04-plan-de-implementacion-optimizado/16-fase-12-scale-hardening.md) |
| 17 | 17. Feature Lifecycle | [Ver documento](./04-plan-de-implementacion-optimizado/17-feature-lifecycle.md) |
| 18 | 18. Usage Metering | [Ver documento](./04-plan-de-implementacion-optimizado/18-usage-metering.md) |
| 19 | 19. Arquitectura Final Recomendada y Principio Rector | [Ver documento](./04-plan-de-implementacion-optimizado/19-arquitectura-final-y-principios.md) |
| 20 | 20. Plan de Implementación Maestro v1.0 | [Ver documento](./04-plan-de-implementacion-optimizado/20-plan-de-implementacion-maestro.md) |

---

### 🤖 Parte 5: Instrucciones para Agentes, Monorepo y Protocolos Técnicos

> El manual operativo definitivo para agentes de IA y desarrolladores: AGENTS.md, reglas de oro, arquitectura de dominios, ownership de datos, estructura monorepo, contratos API, estados de dominio, entitlement engine, eventos de dominio, sagas, seguridad, auditoría, observabilidad y protocolos de ejecución.

| # | Documento | Enlace Directo |
|---|---|---|
| 01 | 01. AGENTS.md — Instrucciones del Agente | [Ver documento](./05-reglas-y-protocolos-del-agente/01-instrucciones-del-agente-agents-md.md) |
| 02 | 02. La Regla Más Importante para el Agente | [Ver documento](./05-reglas-y-protocolos-del-agente/02-reglas-fundamentales-para-el-agente.md) |
| 03 | 03. Arquitectura de Dominios | [Ver documento](./05-reglas-y-protocolos-del-agente/03-arquitectura-de-dominios.md) |
| 04 | 04. Regla de Ownership | [Ver documento](./05-reglas-y-protocolos-del-agente/04-regla-de-ownership.md) |
| 05 | 05. Arquitectura de Datos | [Ver documento](./05-reglas-y-protocolos-del-agente/05-arquitectura-de-datos.md) |
| 06 | 06. Stack Inicial | [Ver documento](./05-reglas-y-protocolos-del-agente/06-stack-inicial.md) |
| 07 | 07. Estructura del Monorepo | [Ver documento](./05-reglas-y-protocolos-del-agente/07-estructura-del-monorepo.md) |
| 08 | 08. API Contract | [Ver documento](./05-reglas-y-protocolos-del-agente/08-api-contracts.md) |
| 09 | 09. Estados de Dominio | [Ver documento](./05-reglas-y-protocolos-del-agente/09-estados-de-dominio.md) |
| 10 | 10. Feature / Entitlement Engine | [Ver documento](./05-reglas-y-protocolos-del-agente/10-feature-y-entitlement-engine.md) |
| 11 | 11. Usage Metering | [Ver documento](./05-reglas-y-protocolos-del-agente/11-usage-metering.md) |
| 12 | 12. Eventos de Dominio | [Ver documento](./05-reglas-y-protocolos-del-agente/12-eventos-de-dominio.md) |
| 13 | 13. Saga / Procesos Distribuidos | [Ver documento](./05-reglas-y-protocolos-del-agente/13-saga-y-procesos-distribuidos.md) |
| 14 | 14. Seguridad | [Ver documento](./05-reglas-y-protocolos-del-agente/14-seguridad.md) |
| 15 | 15. Auditoría | [Ver documento](./05-reglas-y-protocolos-del-agente/15-auditoria.md) |
| 16 | 16. Observabilidad | [Ver documento](./05-reglas-y-protocolos-del-agente/16-observabilidad.md) |
| 17 | 17. Definition of Done | [Ver documento](./05-reglas-y-protocolos-del-agente/17-definition-of-done.md) |
| 18 | 18. Orden Exacto para el Agente | [Ver documento](./05-reglas-y-protocolos-del-agente/18-orden-exacto-de-ejecucion.md) |
| 19 | 19. Instrucción Final y Execution Protocol | [Ver documento](./05-reglas-y-protocolos-del-agente/19-instruccion-final-y-protocolo.md) |
| 20 | 20. Implementation State Tracker | [Ver documento](./05-reglas-y-protocolos-del-agente/20-implementation-state.md) |
| 21 | 21. Resumen y Siguiente Paso | [Ver documento](./05-reglas-y-protocolos-del-agente/21-resumen-y-siguiente-paso.md) |

---


## 📊 Resumen Estadístico
* **Total de Documentos Modulares:** 116 archivos `.md`
* **Contratos Centrales:** 1 documento normativo vinculante (`CONTRATO_DE_ARQUITECTURA.md` / `AGENTS.md`)
* **Cobertura de Contenido:** 100% de las 6,858 líneas originales de especificación preservadas de manera íntegra.

---

## 🚀 Guía de Inicio Rápido para Desarrolladores y Agentes de IA

1. **Paso 1: Leer el Contrato de Arquitectura:** [CONTRATO_DE_ARQUITECTURA.md](./CONTRATO_DE_ARQUITECTURA.md)
2. **Paso 2: Comprender el Mapa de Dominios:** [01-mapa-maestro/00-arquitectura-general.md](./01-mapa-maestro/00-arquitectura-general.md)
3. **Paso 3: Revisar el Checklist Pre-Código:** [03-checklist-pre-codigo-y-diseno/00-introduccion-checklist.md](./03-checklist-pre-codigo-y-diseno/00-introduccion-checklist.md)
4. **Paso 4: Seguir el Orden de Fases de Desarrollo:** [04-plan-de-implementacion-optimizado/03-orden-de-desarrollo-y-fases.md](./04-plan-de-implementacion-optimizado/03-orden-de-desarrollo-y-fases.md)
5. **Paso 5: Respetar los Protocolos y Estados del Agente:** [05-reglas-y-protocolos-del-agente/19-instruccion-final-y-protocolo.md](./05-reglas-y-protocolos-del-agente/19-instruccion-final-y-protocolo.md)

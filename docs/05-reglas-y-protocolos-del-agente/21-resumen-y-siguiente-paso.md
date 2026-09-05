<!-- Documento perteneciente a la Guía Maestra de la Plataforma Educativa SaaS -->
<!-- Fuente original: cole.txt (Líneas 6810 a 6858) -->

# 🏁 En resumen

Tu agente CLI necesita recibir **tres cosas**, no solamente código:

```text
┌────────────────────────────────────┐
│         1. CONTEXTO                │
│                                    │
│ Qué estamos construyendo           │
│ Para quién                         │
│ Qué problemas resuelve             │
└────────────────┬───────────────────┘
                 │
                 ▼
┌────────────────────────────────────┐
│         2. CONTRATO                │
│                                    │
│ Arquitectura                       │
│ Dominios                           │
│ Seguridad                          │
│ Datos                              │
│ APIs                               │
│ Eventos                            │
│ Reglas                             │
└────────────────┬───────────────────┘
                 │
                 ▼
┌────────────────────────────────────┐
│         3. PLAN                    │
│                                    │
│ Fases                              │
│ Dependencias                       │
│ Tareas                             │
│ Tests                              │
│ Acceptance Criteria                │
│ Definition of Done                 │
└────────────────┬───────────────────┘
                 │
                 ▼
              🤖 AGENT
                 │
                 ▼
          IMPLEMENTACIÓN
```

Y **yo no le entregaría todavía un único prompt gigantesco**. Lo ideal es generar ahora el **`MASTER_IMPLEMENTATION_PLAN.md` completo**, junto con los archivos `AGENTS.md`, `architecture.md`, `domain-model.md`, `security.md`, `event-catalog.md`, `api-guidelines.md` y las especificaciones de cada fase.

Eso convertiría todo lo que hemos diseñado en un **paquete ejecutable por el agente CLI**, donde el agente sabe qué construir, en qué orden, bajo qué reglas y cómo determinar si cada parte realmente está terminada.

---

[⬅️ Anterior: 20. Implementation State Tracker](./20-implementation-state.md) | [🏠 Índice Principal](../README.md)

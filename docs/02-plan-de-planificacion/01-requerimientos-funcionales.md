<!-- Documento perteneciente a la Guía Maestra de la Plataforma Educativa SaaS -->
<!-- Fuente original: cole.txt (Líneas 2196 a 2259) -->

# 🧭 Plan maestro de planificación

```text
                    PLATAFORMA EDUCATIVA
                           │
       ┌───────────────────┼───────────────────┐
       │                   │                   │
   NEGOCIO              PRODUCTO          TECNOLOGÍA
       │                   │                   │
       ▼                   ▼                   ▼
 Reglas de negocio    UX / módulos       Arquitectura
 Suscripciones        Roles              Infraestructura
 Billing              Flujos             Seguridad
 Operaciones          MVP                DevOps
       │                   │                   │
       └───────────────────┼───────────────────┘
                           │
                           ▼
                    IMPLEMENTACIÓN
```

---

# 1. 📋 Requerimientos funcionales

Ya tenemos el mapa de módulos, pero ahora debemos bajar cada módulo a **funcionalidades concretas**.

Por ejemplo, no basta con decir:

> Módulo de matrículas.

Tenemos que definir:

```text
MATRÍCULAS
│
├── Preinscripción
├── Postulación
├── Evaluación
├── Admisión
├── Documentos
├── Matrícula
├── Renovación
├── Traslado
├── Retiro
├── Cambio de sección
└── Anulación
```

Y para cada funcionalidad:

* Quién la ejecuta.
* Qué datos necesita.
* Qué reglas aplica.
* Qué estados tiene.
* Qué otros módulos afecta.
* Qué permisos requiere.
* Qué notificaciones genera.
* Qué auditoría genera.

Esto debemos hacerlo para **cada módulo**.

---

---

[⬅️ Anterior: 26. El Mapa Maestro Completo y Decisiones Técnicas](../01-mapa-maestro/26-mapa-integral-y-decisiones-tecnicas.md) | [🏠 Índice Principal](../README.md) | [Siguiente: 02. Procesos y Workflows ➡️](./02-procesos-y-workflows.md)

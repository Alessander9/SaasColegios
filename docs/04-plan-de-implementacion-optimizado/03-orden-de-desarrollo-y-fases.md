<!-- Documento perteneciente a la Guía Maestra de la Plataforma Educativa SaaS -->
<!-- Fuente original: cole.txt (Líneas 4645 a 4688) -->

# 3. Cambiaría también el orden de desarrollo

No haría:

```text
Alumnos → profesores → notas → finanzas...
```

Haría:

```text
FOUNDATION
    ↓
PLATFORM
    ↓
IDENTITY + SECURITY
    ↓
SCHOOL CORE
    ↓
ENROLLMENT
    ↓
FINANCIAL CORE
    ↓
ACADEMIC
    ↓
PORTALS
    ↓
COMMERCE
    ↓
ACTIVITIES
    ↓
HR
    ↓
PAYROLL
    ↓
BI
```

¿Por qué?

Porque **matrícula + finanzas + identidad + tenancy** son las piezas que conectan gran parte del sistema.

---

---

[⬅️ Anterior: 02. Arquitectura Evolutiva: No 15 Microservicios de Inicio](./02-arquitectura-evolutiva-monolito-a-microservicios.md) | [🏠 Índice Principal](../README.md) | [Siguiente: 04. Fase 0 — Engineering Foundation ➡️](./04-fase-0-engineering-foundation.md)

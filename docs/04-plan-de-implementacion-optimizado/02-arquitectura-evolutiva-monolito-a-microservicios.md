<!-- Documento perteneciente a la Guía Maestra de la Plataforma Educativa SaaS -->
<!-- Fuente original: cole.txt (Líneas 4593 a 4644) -->

# 2. No empezaría creando 15 microservicios

Esta es probablemente la mayor optimización.

Inicialmente:

```text
                    API
                     │
      ┌──────────────┼──────────────┐
      ▼              ▼              ▼
 Platform        School Core      Domains
      │              │              │
      └──────────────┼──────────────┘
                     │
                PostgreSQL
```

Internamente cada dominio está aislado.

Posteriormente:

```text
                    API Gateway
                         │
       ┌─────────────────┼─────────────────┐
       ▼                 ▼                 ▼
   Platform          School Core        Finance
       │                 │                 │
       │                 │                 ├── DB
       │                 │                 └── Events
       │                 │
       │                 └── DB
       │
       └── DB
```

Y luego podemos extraer:

```text
Finance
Commerce
Notifications
Payroll
Academic
Activities
```

según necesidad.

---

---

[⬅️ Anterior: 01. Plan Optimizado: Separar 4 Niveles](./01-separacion-en-4-niveles.md) | [🏠 Índice Principal](../README.md) | [Siguiente: 03. Orden de Desarrollo y Secuencia de Fases ➡️](./03-orden-de-desarrollo-y-fases.md)

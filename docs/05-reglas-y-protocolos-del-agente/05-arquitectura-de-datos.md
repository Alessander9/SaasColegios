<!-- Documento perteneciente a la Guía Maestra de la Plataforma Educativa SaaS -->
<!-- Fuente original: cole.txt (Líneas 6087 a 6120) -->

# 5. Arquitectura de datos

Para comenzar recomiendo:

```text
PostgreSQL
   │
   ├── platform
   ├── identity
   ├── school
   ├── students
   ├── enrollment
   ├── academic
   ├── finance
   ├── commerce
   ├── activities
   ├── hr
   └── payroll
```

Pero inicialmente podemos tener una misma instancia PostgreSQL y separación lógica por módulos/schemas.

Más adelante:

```text
Finance → finance-db
Commerce → commerce-db
Academic → academic-db
```

cuando la escala lo justifique.

---

---

[⬅️ Anterior: 04. Regla de Ownership](./04-regla-de-ownership.md) | [🏠 Índice Principal](../README.md) | [Siguiente: 06. Stack Inicial ➡️](./06-stack-inicial.md)

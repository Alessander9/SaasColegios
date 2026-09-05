<!-- Documento perteneciente a la Guía Maestra de la Plataforma Educativa SaaS -->
<!-- Fuente original: cole.txt (Líneas 6173 a 6233) -->

# 7. Monorepo

Utilizaría algo como:

```text
apps/
services/
packages/
infra/
docs/
tests/
```

Con un workspace gestionado por:

```text
pnpm
+
Turborepo
```

Esto permite compartir:

```text
packages/
├── ui
├── types
├── events
├── validation
├── auth
├── database
└── observability
```

Pero hay una regla:

> **Compartir infraestructura y contratos, no lógica de dominio.**

Por ejemplo:

✅ Compartir:

```text
UUID utilities
Date utilities
Event types
UI components
Validation primitives
Logging
```

❌ No compartir:

```text
Finance business rules
Enrollment business rules
Academic business rules
```

---

---

[⬅️ Anterior: 06. Stack Inicial](./06-stack-inicial.md) | [🏠 Índice Principal](../README.md) | [Siguiente: 08. API Contract ➡️](./08-api-contracts.md)

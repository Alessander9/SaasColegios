<!-- Documento perteneciente a la Guía Maestra de la Plataforma Educativa SaaS -->
<!-- Fuente original: cole.txt (Líneas 4775 a 4818) -->

# 6. Fase 2 — Identity + Authorization

Aquí implementamos:

```text
Authentication
Authorization
RBAC
Permissions
Scopes
Tenant Context
Audit
```

Modelo:

```text
User
 ↓
Membership
 ↓
Role
 ↓
Permissions
 ↓
Scope
 ↓
Tenant
```

Ejemplo:

```text
Profesor
   ↓
grades.update
   ↓
Cursos asignados
   ↓
Colegio ABC
```

---

---

[⬅️ Anterior: 05. Fase 1 — Platform Core](./05-fase-1-platform-core.md) | [🏠 Índice Principal](../README.md) | [Siguiente: 07. Fase 3 — School Core ➡️](./07-fase-3-school-core.md)

<!-- Documento perteneciente a la Guía Maestra de la Plataforma Educativa SaaS -->
<!-- Fuente original: cole.txt (Líneas 3770 a 3825) -->

# 10. 🧩 Diseñar el Entitlement Engine

Este es otro componente que debemos especificar profundamente.

Ejemplo:

```text
Tenant: Colegio ABC

Plan:
Professional

Features:
✓ Students
✓ Enrollment
✓ Academic
✓ Finance
✓ Activities
✗ Payroll

Limits:
Students = 500
Teachers = 50
Storage = 50GB
```

Y luego:

```text
User
 ↓
Permission
 ↓
Feature
 ↓
Entitlement
 ↓
Limit
 ↓
Business Rule
 ↓
ALLOW / DENY
```

Además debemos definir qué ocurre cuando el colegio:

* cambia de plan;
* baja de plan;
* vence;
* supera un límite;
* agrega un add-on;
* cancela;
* entra en período de gracia.

---

---

[⬅️ Anterior: 09. Diseñar el Modelo de Autorización](./09-disenar-modelo-de-autorizacion.md) | [🏠 Índice Principal](../README.md) | [Siguiente: 11. Modelo de Datos antes de Programar ➡️](./11-modelo-de-datos-erd.md)

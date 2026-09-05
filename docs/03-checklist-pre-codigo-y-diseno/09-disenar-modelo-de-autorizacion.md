<!-- Documento perteneciente a la Guía Maestra de la Plataforma Educativa SaaS -->
<!-- Fuente original: cole.txt (Líneas 3728 a 3769) -->

# 9. 🔐 Diseñar el modelo de autorización

No solamente autenticación.

Tenemos que definir:

```text
WHO
  ↓
CAN DO WHAT
  ↓
TO WHICH RESOURCE
  ↓
IN WHICH TENANT
  ↓
IN WHICH SCOPE
```

Ejemplo:

> Profesor Juan puede modificar notas únicamente de sus cursos y durante el periodo abierto.

Eso implica:

```text
Role
 +
Permission
 +
Resource
 +
Tenant
 +
Scope
 +
Business Rule
```

Esto debe quedar diseñado antes del frontend.

---

---

[⬅️ Anterior: 08. Diseñar Primero el Núcleo Financiero](./08-disenar-nucleo-financiero.md) | [🏠 Índice Principal](../README.md) | [Siguiente: 10. Diseñar el Entitlement Engine ➡️](./10-disenar-entitlement-engine.md)

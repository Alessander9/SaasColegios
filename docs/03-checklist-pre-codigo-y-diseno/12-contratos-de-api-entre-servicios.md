<!-- Documento perteneciente a la Guía Maestra de la Plataforma Educativa SaaS -->
<!-- Fuente original: cole.txt (Líneas 3879 a 3915) -->

# 12. 🔌 Diseñar contratos de API

Antes de implementar los servicios, definiría los contratos.

Por ejemplo:

```text
POST /api/v1/students
GET  /api/v1/students
GET  /api/v1/students/:id
PATCH /api/v1/students/:id
```

Pero más importante:

### Contratos entre servicios

```text
Enrollment
     │
     │ EnrollmentCompleted
     ▼
Finance
```

```text
Commerce
     │
     │ OrderPaid
     ▼
Finance
```

Esto nos permite desarrollar equipos independientemente.

---

---

[⬅️ Anterior: 11. Modelo de Datos antes de Programar](./11-modelo-de-datos-erd.md) | [🏠 Índice Principal](../README.md) | [Siguiente: 13. Catálogo de Eventos (Event Catalog) ➡️](./13-catalogo-de-eventos.md)

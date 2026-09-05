<!-- Documento perteneciente a la Guía Maestra de la Plataforma Educativa SaaS -->
<!-- Fuente original: cole.txt (Líneas 6545 a 6586) -->

# 15. Auditoría

El agente debe registrar acciones sensibles:

```text
Who
Tenant
Action
Resource
Resource ID
Timestamp
IP
User Agent
Before
After
Correlation ID
```

Ejemplo:

```json
{
  "actor": "user-123",
  "tenantId": "tenant-abc",
  "action": "GRADE_PUBLISHED",
  "resource": "grade",
  "resourceId": "grade-123"
}
```

Especialmente:

* Notas.
* Pagos.
* Matrículas.
* Planilla.
* Permisos.
* Usuarios.
* Suscripciones.

---

---

[⬅️ Anterior: 14. Seguridad](./14-seguridad.md) | [🏠 Índice Principal](../README.md) | [Siguiente: 16. Observabilidad ➡️](./16-observabilidad.md)

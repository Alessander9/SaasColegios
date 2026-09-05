<!-- Documento perteneciente a la Guía Maestra de la Plataforma Educativa SaaS -->
<!-- Fuente original: cole.txt (Líneas 6587 a 6618) -->

# 16. Observabilidad

Cada request:

```text
Request
 ↓
Correlation ID
 ↓
Trace
 ↓
Logs
 ↓
Metrics
```

Y cada evento:

```text
Event ID
Tenant ID
Correlation ID
```

Esto será fundamental cuando un colegio reporte:

> "El pago se realizó, pero no aparece en la matrícula."

Podremos seguir la transacción completa.

---

---

[⬅️ Anterior: 15. Auditoría](./15-auditoria.md) | [🏠 Índice Principal](../README.md) | [Siguiente: 17. Definition of Done ➡️](./17-definition-of-done.md)

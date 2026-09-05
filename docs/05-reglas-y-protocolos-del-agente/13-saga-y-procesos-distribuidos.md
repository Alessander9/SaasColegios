<!-- Documento perteneciente a la Guía Maestra de la Plataforma Educativa SaaS -->
<!-- Fuente original: cole.txt (Líneas 6480 a 6509) -->

# 13. Saga / procesos distribuidos

El agente debe saber que procesos como:

```text
Enrollment
 ↓
Charge
 ↓
Payment
 ↓
Confirmation
```

no necesariamente son una única transacción de DB.

Cuando los servicios sean independientes, utilizaremos:

```text
Saga
+
Events
+
Outbox
+
Idempotency
```

---

---

[⬅️ Anterior: 12. Eventos](./12-eventos-de-dominio.md) | [🏠 Índice Principal](../README.md) | [Siguiente: 14. Seguridad ➡️](./14-seguridad.md)

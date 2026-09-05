<!-- Documento perteneciente a la Guía Maestra de la Plataforma Educativa SaaS -->
<!-- Fuente original: cole.txt (Líneas 4281 a 4329) -->

# 24. 🧯 Failure Scenarios

También debemos diseñar qué pasa cuando algo falla.

Ejemplo:

```text
Payment
   ↓
Finance ✓
   ↓
RabbitMQ ✗
```

¿Qué hacemos?

Otro:

```text
Order
   ↓
Inventory ✓
   ↓
Payment ✗
```

Otro:

```text
Enrollment
   ↓
Finance
   ↓
Notification ✗
```

La respuesta debe estar diseñada.

Aquí entran:

* Retry.
* Dead Letter Queue.
* Idempotency.
* Outbox.
* Circuit breaker.
* Compensating actions.

---

---

[⬅️ Anterior: 23. Pruebas de Carga](./23-pruebas-de-carga.md) | [🏠 Índice Principal](../README.md) | [Siguiente: 25. Definition of Done ➡️](./25-definition-of-done.md)

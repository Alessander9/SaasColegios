<!-- Documento perteneciente a la Guía Maestra de la Plataforma Educativa SaaS -->
<!-- Fuente original: cole.txt (Líneas 6273 a 6331) -->

# 9. Estados de dominio

Otra cosa que el agente debe respetar.

No hacer:

```text
status = "whatever"
```

Definir enums/estados.

Ejemplo:

```text
EnrollmentStatus

DRAFT
APPLICATION
UNDER_REVIEW
ADMITTED
PENDING_PAYMENT
CONFIRMED
CANCELLED
WITHDRAWN
TRANSFERRED
```

Finance:

```text
PaymentStatus

PENDING
PROCESSING
COMPLETED
FAILED
CANCELLED
REFUNDED
PARTIALLY_REFUNDED
```

Activities:

```text
RegistrationStatus

PENDING
CONFIRMED
WAITLISTED
CANCELLED
ATTENDED
NO_SHOW
```

Esto debe documentarse antes de implementar cada dominio.

---

---

[⬅️ Anterior: 08. API Contract](./08-api-contracts.md) | [🏠 Índice Principal](../README.md) | [Siguiente: 10. Feature / Entitlement Engine ➡️](./10-feature-y-entitlement-engine.md)

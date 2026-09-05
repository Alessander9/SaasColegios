<!-- Documento perteneciente a la Guía Maestra de la Plataforma Educativa SaaS -->
<!-- Fuente original: cole.txt (Líneas 6417 a 6479) -->

# 12. Eventos

El catálogo inicial:

```text
TenantCreated
SubscriptionCreated
SubscriptionChanged

UserCreated
MembershipCreated

StudentCreated
StudentUpdated

EnrollmentCreated
EnrollmentConfirmed
EnrollmentCancelled

ChargeCreated
PaymentCreated
PaymentCompleted
PaymentFailed
PaymentRefunded

GradeSubmitted
GradePublished

AttendanceRecorded

ProductCreated
InventoryAdjusted

OrderCreated
OrderPaid
OrderCancelled
OrderDelivered

ActivityCreated
RegistrationCreated
RegistrationPaid
RegistrationCancelled

EmployeeCreated
PayrollProcessed
PayrollApproved
```

Cada uno debe tener:

```json
{
  "eventId": "...",
  "eventType": "PaymentCompleted.v1",
  "occurredAt": "...",
  "tenantId": "...",
  "aggregateId": "...",
  "payload": {}
}
```

---

---

[⬅️ Anterior: 11. Usage Metering](./11-usage-metering.md) | [🏠 Índice Principal](../README.md) | [Siguiente: 13. Saga / Procesos Distribuidos ➡️](./13-saga-y-procesos-distribuidos.md)

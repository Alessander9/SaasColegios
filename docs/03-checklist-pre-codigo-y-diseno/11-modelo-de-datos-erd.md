<!-- Documento perteneciente a la Guía Maestra de la Plataforma Educativa SaaS -->
<!-- Fuente original: cole.txt (Líneas 3826 a 3878) -->

# 11. 🗄️ Diseñar el modelo de datos antes de programar

Después de los dominios y workflows:

### ERD

Tenemos que diseñar:

```text
Tenant
School
Campus
User
Student
Family
Enrollment
AcademicYear
Grade
Section
Course
Teacher
Evaluation
Grade
Attendance
Charge
Payment
Refund
Product
Inventory
Order
Activity
Registration
Employee
Contract
Payroll
...
```

Y establecer:

* PK.
* FK.
* índices.
* constraints.
* unique constraints.
* estados.
* soft delete.
* auditoría.
* timestamps.
* tenant isolation.

---

---

[⬅️ Anterior: 10. Diseñar el Entitlement Engine](./10-disenar-entitlement-engine.md) | [🏠 Índice Principal](../README.md) | [Siguiente: 12. Diseñar Contratos de API ➡️](./12-contratos-de-api-entre-servicios.md)

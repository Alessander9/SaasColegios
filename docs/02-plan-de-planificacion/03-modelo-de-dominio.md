<!-- Documento perteneciente a la Guía Maestra de la Plataforma Educativa SaaS -->
<!-- Fuente original: cole.txt (Líneas 2338 a 2398) -->

# 3. 🧩 Modelo de dominio

Antes de diseñar las tablas, debemos definir las **entidades y relaciones del negocio**.

Por ejemplo:

```text
Tenant
School
Campus
User
Role
Permission

Student
Family
Guardian

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
Invoice
Payment
Refund
CashRegister

Product
Inventory
Order
OrderItem

Activity
Registration
Participant

Employee
Contract
Payroll
PayrollItem
```

Pero también tenemos que definir:

> ¿Qué entidad es dueña de cuál?

> ¿Qué entidad puede cambiar?

> ¿Cuál es la fuente de verdad?

Esto es fundamental para evitar inconsistencias.

---

---

[⬅️ Anterior: 02. Procesos y Workflows](./02-procesos-y-workflows.md) | [🏠 Índice Principal](../README.md) | [Siguiente: 04. Multi-tenancy ➡️](./04-multi-tenancy.md)

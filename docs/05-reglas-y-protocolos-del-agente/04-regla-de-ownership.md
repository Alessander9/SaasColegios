<!-- Documento perteneciente a la Guía Maestra de la Plataforma Educativa SaaS -->
<!-- Fuente original: cole.txt (Líneas 6049 a 6086) -->

# 4. Regla de ownership

Esto también debe estar explícito:

| Dato         | Owner      |
| ------------ | ---------- |
| Tenant       | Platform   |
| Subscription | Platform   |
| Plan         | Platform   |
| Entitlement  | Platform   |
| User         | Identity   |
| Membership   | Identity   |
| Student      | Students   |
| Family       | Students   |
| Enrollment   | Enrollment |
| Course       | Academic   |
| Grade        | Academic   |
| Attendance   | Academic   |
| Charge       | Finance    |
| Payment      | Finance    |
| Refund       | Finance    |
| Product      | Commerce   |
| Inventory    | Commerce   |
| Order        | Commerce   |
| Activity     | Activities |
| Registration | Activities |
| Employee     | HR         |
| Contract     | HR         |
| Payroll      | Payroll    |

La regla:

> **Un dato tiene un único propietario.**

Otros dominios pueden referenciarlo o reaccionar a eventos, pero no deben convertirse en propietarios alternativos.

---

---

[⬅️ Anterior: 03. Arquitectura de Dominios](./03-arquitectura-de-dominios.md) | [🏠 Índice Principal](../README.md) | [Siguiente: 05. Arquitectura de Datos ➡️](./05-arquitectura-de-datos.md)

<!-- Documento perteneciente a la Guía Maestra de la Plataforma Educativa SaaS -->
<!-- Fuente original: cole.txt (Líneas 164 a 245) -->

# 03. 🧩 Módulos / Entitlements

Este será el **motor de capacidades**.

## 03.1 Features

Ejemplo:

```text
students
enrollment
academic
grades
attendance
finance
payroll
store
activities
parent_portal
api
accounting
```

## 03.2 Límites

Ejemplo:

```text
max_students
max_teachers
max_admin_users
max_sections
max_products
max_activities
max_orders
max_storage
```

## 03.3 Submódulos

Por ejemplo:

```text
FINANZAS
├── Pensiones
├── Pagos
├── Caja
├── Morosidad
├── Becas
└── Descuentos
```

## 03.4 Activación temporal

* Fecha de inicio.
* Fecha de finalización.
* Prueba.
* Promoción.

## 03.5 Overrides

Permitir excepciones.

Ejemplo:

> Plan permite 500 alumnos, pero Colegio San José tiene 800.

## 03.6 Consumo

```text
Alumnos
800 / 800

Profesores
72 / 100

Storage
43 / 50 GB
```

---

---

[⬅️ Anterior: 02. Suscripciones y Billing](./02-suscripciones-y-billing.md) | [🏠 Índice Principal](../README.md) | [Siguiente: 04. Identidad, Roles y Seguridad ➡️](./04-identidad-roles-y-seguridad.md)

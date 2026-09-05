<!-- Documento perteneciente a la Guía Maestra de la Plataforma Educativa SaaS -->
<!-- Fuente original: cole.txt (Líneas 5917 a 6048) -->

# 3. Arquitectura de dominios

El agente debe recibir este mapa:

```text
PLATFORM
│
├── Tenant Management
├── Subscription
├── Plans
├── Features
├── Entitlements
├── Usage
└── Platform Billing


IDENTITY
│
├── Users
├── Authentication
├── Sessions
├── Roles
├── Permissions
└── Memberships


SCHOOL
│
├── Institution
├── Campus
├── Academic Year
├── Levels
├── Grades
└── Sections


STUDENTS
│
├── Students
├── Families
├── Guardians
└── Student Documents


ENROLLMENT
│
├── Applications
├── Admissions
├── Enrollment
├── Renewal
├── Transfer
└── Withdrawal


ACADEMIC
│
├── Courses
├── Curriculum
├── Teachers
├── Schedules
├── Evaluations
├── Grades
├── Attendance
└── Report Cards


FINANCE
│
├── Accounts
├── Charges
├── Invoices
├── Payments
├── Refunds
├── Adjustments
├── Collections
└── Reconciliation


COMMERCE
│
├── Catalog
├── Products
├── Variants
├── Inventory
├── Cart
├── Orders
├── Fulfillment
└── Returns


ACTIVITIES
│
├── Events
├── Activities
├── Capacity
├── Registration
├── Participants
├── Authorizations
└── Attendance


HR
│
├── Employees
├── Contracts
├── Attendance
├── Leave
└── Documents


PAYROLL
│
├── Payroll Period
├── Earnings
├── Deductions
├── Bonuses
├── Taxes
├── Settlement
└── Payslips


SHARED
│
├── Notifications
├── Documents
├── Audit
├── Search
└── Reporting
```

---

---

[⬅️ Anterior: 02. La Regla Más Importante para el Agente](./02-reglas-fundamentales-para-el-agente.md) | [🏠 Índice Principal](../README.md) | [Siguiente: 04. Regla de Ownership ➡️](./04-regla-de-ownership.md)

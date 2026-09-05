<!-- Documento perteneciente a la Guía Maestra de la Plataforma Educativa SaaS -->
<!-- Fuente original: cole.txt (Líneas 4459 a 4592) -->

# 🏗️ Plan de implementación optimizado

![Image](https://images.openai.com/static-rsc-4/7D0_b8FSxUegISmHeh1dzV2qleflY8Ic4bGOq3uLlIFAYw-Aqt53U1qJr1B5wJ1uqTuH36CG5s0nTj-YRdOSEJev616i6WLzdMDI23zqkLyIk9USwaZuI1ch0G4CWyeZ0mJDN3PDtAJqa6JFK5EHr748-EkHmQVPdzFwvLCK2mGav6sc78dChGWw4FDiUDwP?purpose=fullsize)

![Image](https://images.openai.com/static-rsc-4/bIrt7-Aamx0i6BjnFLavdIHtifLzJz7a5ci-7RZFdG2QsFW2Y8jZG8QRixl8gtfyLVKuxj5bC2KSqYTYEizE0-fkcjqEL0SEPAFN3cKIjNMFUM-9z5D11KFBNDr8gef89N3fN95iQb4cawIzhM99MQo4TYGAKmEPQUn2Vb6kFvwkfJEdeg0C2cTbMUhad1qp?purpose=fullsize)

![Image](https://images.openai.com/static-rsc-4/YPRn1tnYWRBj9CPNIqvXwmj-7SJtJ7-f595MRqDlsBsJPAbApWfeWXOaCGekUhhHNuHO04NIl__Zbe7xGqW95JvsU6N_LdHs74Xp8DxICt878z-y6qs4FcsGsHBgZqdtlWqDxndvE9mv7w77q0da59_Ncyxkhb7A1J_lY7X-r_nHB6Jcre82VaPQEdLu2BZk?purpose=fullsize)

![Image](https://images.openai.com/static-rsc-4/U9jL6M8taeJFSHgXsOCe0HLeIqL-_zMATIwW0e4WqorrsQ92GO0EAhPo7TkrjuVpAasbOhxl8HglX5FmOrhaBf6NtBioDuFecUuUjwuA8HnG2VpdqdXWALZwyonQCzlPi9iXiu1KYF_La5gjm68V2umVzR2_ygpsKndXa9u1tIEB29E1hB5nHC-38ScZl2xc?purpose=fullsize)

![Image](https://images.openai.com/static-rsc-4/85BTyH7IRb0SIIK3lYSr7M81uLF7ooVkwhDHdjRF1mai4o8bdfbQls50oVgMuHw3jd0lhD98nLL6TAcWcOjP__aUTvwCfDBGqmvANb_xfROByz76mHyrP8RKY_EGkU_-jTBPcScRdcF48q7ls82UADMCo9vOrZdHs1JyuQshOIkx3h_vaxh1KitqnN2cBkOP?purpose=fullsize)

![Image](https://images.openai.com/static-rsc-4/RyUiJcAwcGYmXWN0cDAAF_SEv_T2gB0eiDjEO5kXwVCy4GO0CP5hPuAT5Yu2vjtFFGCY0WA14p5jT8CsVqifq01MLgB1nMx6kgHVJnxWphOA1hF9Ad5KDVZHNsNxhGBJ656kW4q7m8b87G6u2nhR6ZdKrZlUY_kotnJU8rFOeBepwixNoKAe4ISy7jEjmCw4?purpose=fullsize)

La arquitectura objetivo sería:

```text
                         ┌─────────────────────┐
                         │     SUPER ADMIN     │
                         └──────────┬──────────┘
                                    │
                         ┌──────────▼──────────┐
                         │    PLATFORM CORE    │
                         │                     │
                         │ Tenants             │
                         │ Plans               │
                         │ Subscriptions       │
                         │ Entitlements        │
                         │ Billing             │
                         │ Platform Users      │
                         └──────────┬──────────┘
                                    │
                   ┌────────────────┴────────────────┐
                   │                                 │
          ┌────────▼────────┐              ┌─────────▼─────────┐
          │  SCHOOL CORE    │              │ SHARED SERVICES   │
          │                 │              │                   │
          │ Institution     │              │ Identity          │
          │ Students        │              │ Notifications     │
          │ Families        │              │ Documents         │
          │ Enrollment      │              │ Audit             │
          └────────┬────────┘              │ Search            │
                   │                       └─────────┬─────────┘
                   │                                 │
        ┌──────────┼──────────┬──────────┬──────────┐│
        ▼          ▼          ▼          ▼          ▼│
    Academic     Finance    Commerce  Activities  HR/Payroll
        │          │          │          │          │
        └──────────┴──────────┴──────────┴──────────┘
                              │
                       EVENT BUS / API
                              │
                     ┌────────▼────────┐
                     │ Reporting / BI  │
                     └─────────────────┘
```

---

# 1. Primero: separar 4 niveles

Esta es la principal optimización.

## Nivel 1 — Platform

Es **tu negocio SaaS**.

```text
Platform
├── Tenants
├── Plans
├── Subscriptions
├── Entitlements
├── Usage
├── Billing
├── Platform Admin
└── Platform Analytics
```

No pertenece a un colegio específico.

---

## Nivel 2 — School Core

Es el núcleo común de todos los colegios.

```text
School Core
├── Institution
├── Students
├── Families
├── Users
├── Academic Structure
└── Enrollment
```

---

## Nivel 3 — Domain Modules

Aquí están los módulos especializados:

```text
Domains
├── Academic
├── Finance
├── Commerce
├── Activities
├── HR
├── Payroll
└── Communication
```

---

## Nivel 4 — Shared Infrastructure

```text
Infrastructure
├── Identity
├── Notifications
├── Documents
├── Audit
├── Search
├── Event Bus
├── Storage
└── Observability
```

Esta separación nos ayudará muchísimo cuando la plataforma crezca.

---

---

[⬅️ Anterior: 26. Lo que Haría Ahora y 5 Entregables Imprescindibles](../03-checklist-pre-codigo-y-diseno/26-entregables-imprescindibles-antes-del-codigo.md) | [🏠 Índice Principal](../README.md) | [Siguiente: 02. Arquitectura Evolutiva: No 15 Microservicios de Inicio ➡️](./02-arquitectura-evolutiva-monolito-a-microservicios.md)

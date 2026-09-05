<!-- Documento perteneciente a la Guía Maestra de la Plataforma Educativa SaaS -->
<!-- Fuente original: cole.txt (Líneas 3583 a 3622) -->

# 6. 🏠 Definir el "System of Record"

Esta es una decisión importantísima.

Tenemos que determinar quién es dueño de cada dato.

Ejemplo:

```text
Student Service
      │
      └── Student = fuente oficial
```

Finance:

```text
Finance Service
      │
      ├── Charges
      ├── Payments
      └── Refunds
```

Commerce:

```text
Commerce Service
      │
      ├── Products
      ├── Orders
      └── Inventory
```

Pero Commerce **no debe convertirse en dueño del Payment**.

Eso pertenece a Finance/Payment.

---

---

[⬅️ Anterior: 05. Bounded Contexts](./05-bounded-contexts.md) | [🏠 Índice Principal](../README.md) | [Siguiente: 07. Diseñar Workflows Críticos ➡️](./07-disenar-workflows-criticos.md)

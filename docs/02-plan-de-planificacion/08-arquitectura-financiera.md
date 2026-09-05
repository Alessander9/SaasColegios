<!-- Documento perteneciente a la Guía Maestra de la Plataforma Educativa SaaS -->
<!-- Fuente original: cole.txt (Líneas 2636 a 2682) -->

# 8. 💰 Arquitectura financiera

Esta merece su propio diseño.

Tenemos que definir un **ledger financiero** suficientemente sólido para que tienda, pensiones y actividades no terminen creando sistemas de pagos diferentes.

Conceptualmente:

```text
ACCOUNT / CUSTOMER
        │
        ▼
TRANSACTION
        │
        ├── Charge
        ├── Payment
        ├── Refund
        └── Adjustment
```

Y:

```text
Payment
   ↓
Payment Method
   ↓
Gateway
   ↓
Transaction
   ↓
Reconciliation
```

Además:

* Estados.
* Conciliación.
* Reembolsos.
* Anulaciones.
* Idempotencia.
* Cierres.
* Caja.
* Auditoría.

---

---

[⬅️ Anterior: 07. Modelo de Datos](./07-modelo-de-datos.md) | [🏠 Índice Principal](../README.md) | [Siguiente: 09. Comercio y Actividades ➡️](./09-comercio-y-actividades.md)

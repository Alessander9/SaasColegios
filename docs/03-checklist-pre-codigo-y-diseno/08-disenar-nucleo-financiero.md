<!-- Documento perteneciente a la Guía Maestra de la Plataforma Educativa SaaS -->
<!-- Fuente original: cole.txt (Líneas 3688 a 3727) -->

# 8. 💰 Diseñar primero el núcleo financiero

Este punto yo lo elevaría de prioridad.

Porque tenemos:

```text
Matrículas
Pensiones
Tienda
Actividades
Talleres
Excursiones
Servicios
```

Todos pueden generar dinero.

Por eso debemos diseñar un **Financial Core** antes de implementar cada módulo.

```text
             FINANCIAL CORE
                   │
       ┌───────────┼───────────┐
       ▼           ▼           ▼
   Enrollment   Commerce   Activities
       │           │           │
       └───────────┼───────────┘
                   ▼
                Charges
                   │
                 Payment
                   │
              Reconciliation
```

Esto será uno de los pilares de la plataforma.

---

---

[⬅️ Anterior: 07. Diseñar Workflows Críticos](./07-disenar-workflows-criticos.md) | [🏠 Índice Principal](../README.md) | [Siguiente: 09. Diseñar el Modelo de Autorización ➡️](./09-disenar-modelo-de-autorizacion.md)

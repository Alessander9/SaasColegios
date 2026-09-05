<!-- Documento perteneciente a la Guía Maestra de la Plataforma Educativa SaaS -->
<!-- Fuente original: cole.txt (Líneas 2683 a 2722) -->

# 9. 🛒 Comercio y actividades

Debemos definir cómo se integran con Finanzas.

No quiero:

```text
Tienda → su propio sistema de pagos

Actividades → otro sistema

Pensiones → otro sistema
```

Sino:

```text
             FINANCIAL CORE
                   │
       ┌───────────┼───────────┐
       ▼           ▼           ▼
   Pensiones     Tienda     Actividades
       │           │           │
       └───────────┼───────────┘
                   ▼
                 Pagos
```

Esto nos permitirá posteriormente agregar:

* Transporte.
* Comedor.
* Biblioteca.
* Certificados.
* Servicios adicionales.

sin inventar otro sistema financiero.

---

---

[⬅️ Anterior: 08. Arquitectura Financiera](./08-arquitectura-financiera.md) | [🏠 Índice Principal](../README.md) | [Siguiente: 10. UX/UI y Diseño de Producto ➡️](./10-ux-ui-y-diseno-de-producto.md)

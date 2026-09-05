<!-- Documento perteneciente a la Guía Maestra de la Plataforma Educativa SaaS -->
<!-- Fuente original: cole.txt (Líneas 4208 a 4235) -->

# 21. 🏗️ Definir la estrategia de migraciones

Importantísimo con microservicios.

Tenemos que establecer:

```text
Schema Version
     ↓
Migration
     ↓
Deploy
     ↓
Rollback strategy
```

Nunca queremos que un deploy destruya datos de un colegio.

También necesitamos:

* Seed data.
* Demo tenant.
* Test tenants.
* Datos ficticios.
* Migraciones reversibles cuando sea posible.

---

---

[⬅️ Anterior: 20. Walking Skeleton: Caso Crear Alumno](./20-walking-skeleton-caso-alumno.md) | [🏠 Índice Principal](../README.md) | [Siguiente: 22. Crear un Demo School ➡️](./22-demo-school.md)

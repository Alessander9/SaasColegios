<!-- Documento perteneciente a la Guía Maestra de la Plataforma Educativa SaaS -->
<!-- Fuente original: cole.txt (Líneas 2399 a 2451) -->

# 4. 🏢 Multi-tenancy

Este punto merece una planificación específica.

Tenemos que decidir exactamente cómo funciona:

```text
PLATFORM
   │
   ├── Tenant A
   │      ├── Users
   │      ├── Students
   │      └── Finance
   │
   ├── Tenant B
   │      ├── Users
   │      ├── Students
   │      └── Finance
   │
   └── Tenant C
```

Debemos definir:

* Tenant isolation.
* `tenant_id`.
* Acceso entre tenants.
* Usuarios multi-tenant.
* Super Admin.
* Soporte.
* Datos compartidos.
* Datos privados.
* Backups.
* Restauración.
* Exportación.
* Eliminación de tenant.

Y una pregunta importante:

### ¿Qué ocurre cuando un colegio se da de baja?

¿Se eliminan sus datos?

¿Se congelan?

¿Se conservan durante X años?

¿Puede reactivarse?

Eso debe estar definido desde el principio.

---

---

[⬅️ Anterior: 03. Modelo de Dominio](./03-modelo-de-dominio.md) | [🏠 Índice Principal](../README.md) | [Siguiente: 05. Modelo Comercial ➡️](./05-modelo-comercial-y-addons.md)

<!-- Documento perteneciente a la Guía Maestra de la Plataforma Educativa SaaS -->
<!-- Fuente original: cole.txt (Líneas 4160 a 4207) -->

# 20. 🧪 Hacer un "Walking Skeleton"

Esta es una técnica que recomiendo mucho para este proyecto.

Antes de construir todos los módulos, hacemos **una funcionalidad completa atravesando toda la arquitectura**.

Por ejemplo:

# Caso: Crear un alumno

```text
Frontend
   ↓
API Gateway
   ↓
Auth
   ↓
Student Service
   ↓
PostgreSQL
   ↓
Event Bus
   ↓
Notification
   ↓
Audit
   ↓
Reporting
```

Aunque sea una funcionalidad pequeña.

Esto demuestra que:

* multi-tenancy funciona;
* autenticación funciona;
* autorización funciona;
* API funciona;
* DB funciona;
* eventos funcionan;
* auditoría funciona;
* observabilidad funciona;
* CI/CD funciona.

**Después de esto empezamos a construir módulos masivamente.**

---

---

[⬅️ Anterior: 19. Definir Métricas de Negocio](./19-metricas-de-negocio.md) | [🏠 Índice Principal](../README.md) | [Siguiente: 21. Estrategia de Migraciones ➡️](./21-estrategia-de-migraciones.md)

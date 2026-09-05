<!-- Documento perteneciente a la Guía Maestra de la Plataforma Educativa SaaS -->
<!-- Fuente original: cole.txt (Líneas 3441 a 3495) -->

# 3. 🚦 Requisitos no funcionales

Esto suele olvidarse y en una plataforma SaaS es crítico.

Tenemos que definir:

### Rendimiento

Por ejemplo:

```text
API normal:
< 300 ms

Operaciones pesadas:
procesamiento asíncrono
```

### Disponibilidad

Por ejemplo:

```text
Objetivo:
99.9%
```

### Escalabilidad

Definir objetivos:

```text
100 colegios
500 colegios
1,000 colegios
5,000 colegios
```

### Seguridad

* MFA.
* RBAC.
* Tenant isolation.
* Encryption.
* Audit logs.

### Recuperación

* RPO.
* RTO.
* Backups.
* Disaster Recovery.

---

---

[⬅️ Anterior: 02. Requerimientos Funcionales Detallados](./02-requerimientos-funcionales-detallados.md) | [🏠 Índice Principal](../README.md) | [Siguiente: 04. Diccionario de Negocio (Glossary) ➡️](./04-diccionario-de-negocio-glossary.md)

<!-- Documento perteneciente a la Guía Maestra de la Plataforma Educativa SaaS -->
<!-- Fuente original: cole.txt (Líneas 6332 a 6379) -->

# 10. Feature / Entitlement Engine

Este será uno de los componentes diferenciales de tu plataforma.

El agente debe poder hacer:

```text
canAccess(
    tenant,
    feature,
    user,
    resource
)
```

Por ejemplo:

```text
canAccess(
    ColegioABC,
    "payroll",
    user123
)
```

Resultado:

```json
{
  "allowed": false,
  "reason": "FEATURE_NOT_INCLUDED"
}
```

O:

```json
{
  "allowed": false,
  "reason": "LIMIT_REACHED",
  "metric": "students",
  "current": 500,
  "limit": 500
}
```

---

---

[⬅️ Anterior: 09. Estados de Dominio](./09-estados-de-dominio.md) | [🏠 Índice Principal](../README.md) | [Siguiente: 11. Usage Metering ➡️](./11-usage-metering.md)

<!-- Documento perteneciente a la Guía Maestra de la Plataforma Educativa SaaS -->
<!-- Fuente original: cole.txt (Líneas 6234 a 6272) -->

# 8. API Contract

Cada endpoint debería seguir un estándar.

Por ejemplo:

```http
GET /api/v1/students
```

Respuesta:

```json
{
  "data": [],
  "meta": {
    "page": 1,
    "pageSize": 25,
    "total": 120
  }
}
```

Errores:

```json
{
  "error": {
    "code": "STUDENT_LIMIT_REACHED",
    "message": "The tenant has reached its student limit.",
    "details": {}
  }
}
```

El agente debe evitar respuestas inconsistentes entre módulos.

---

---

[⬅️ Anterior: 07. Estructura del Monorepo](./07-estructura-del-monorepo.md) | [🏠 Índice Principal](../README.md) | [Siguiente: 09. Estados de Dominio ➡️](./09-estados-de-dominio.md)

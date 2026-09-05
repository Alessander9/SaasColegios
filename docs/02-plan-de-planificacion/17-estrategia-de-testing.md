<!-- Documento perteneciente a la Guía Maestra de la Plataforma Educativa SaaS -->
<!-- Fuente original: cole.txt (Líneas 2996 a 3031) -->

# 17. 🧪 Estrategia de testing

Desde el diseño:

```text
Unit Tests
      ↓
Integration Tests
      ↓
Contract Tests
      ↓
E2E Tests
      ↓
Load Tests
      ↓
Security Tests
```

Y algo muy importante para microservicios:

### Contract Testing

Para asegurar:

```text
Finance
    ↕
Commerce
    ↕
Activities
```

no se rompan cuando evolucionamos una API.

---

---

[⬅️ Anterior: 16. Disponibilidad y Recuperación](./16-disponibilidad-y-recuperacion.md) | [🏠 Índice Principal](../README.md) | [Siguiente: 18. DevOps ➡️](./18-devops.md)

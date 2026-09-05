<!-- Documento perteneciente a la Guía Maestra de la Plataforma Educativa SaaS -->
<!-- Fuente original: cole.txt (Líneas 3959 a 3999) -->

# 14. 🧪 Estrategia de testing

Antes de programar deberíamos decidir qué significa:

> "Esto está terminado."

Para cada funcionalidad:

```text
Requirement
    ↓
Acceptance Criteria
    ↓
Automated Test
```

Ejemplo:

> Un alumno no puede matricularse si el colegio ha alcanzado el límite contratado.

Test:

```text
Given:
500 alumnos

Limit:
500

When:
crear alumno 501

Then:
DENIED
LIMIT_REACHED
```

Esto es especialmente importante para los **entitlements**.

---

---

[⬅️ Anterior: 13. Catálogo de Eventos (Event Catalog)](./13-catalogo-de-eventos.md) | [🏠 Índice Principal](../README.md) | [Siguiente: 15. Design System ➡️](./15-design-system.md)

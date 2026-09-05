<!-- Documento perteneciente a la Guía Maestra de la Plataforma Educativa SaaS -->
<!-- Fuente original: cole.txt (Líneas 6709 a 6763) -->

# 19. La instrucción final para el agente

Esta sería una de las instrucciones más importantes:

```md
## Execution Protocol

You are not allowed to implement the entire platform in one step.

Work phase by phase.

For every phase:

1. Read the phase specification.
2. Read relevant domain documentation.
3. Inspect the existing repository.
4. Identify dependencies.
5. Produce an implementation plan.
6. Implement the smallest coherent vertical slice.
7. Run tests.
8. Run lint.
9. Run type checks.
10. Run migrations if required.
11. Validate tenant isolation.
12. Validate authorization.
13. Validate entitlements.
14. Validate audit requirements.
15. Validate events.
16. Update documentation.
17. Report completed work.
18. Identify remaining work.

Never silently skip requirements.

Never replace architecture decisions with shortcuts.

If a requirement is ambiguous, do not invent business rules.
Document the ambiguity and request clarification.

If a technical decision conflicts with an existing ADR:
stop and explain the conflict before implementing.

Never delete functionality to make tests pass.

Never weaken security to make development easier.

Never bypass tenant isolation for convenience.

Never expose secrets or credentials.

Never implement production infrastructure without documenting the decision.
```

---

---

[⬅️ Anterior: 18. Orden Exacto para el Agente](./18-orden-exacto-de-ejecucion.md) | [🏠 Índice Principal](../README.md) | [Siguiente: 20. Implementation State Tracker ➡️](./20-implementation-state.md)

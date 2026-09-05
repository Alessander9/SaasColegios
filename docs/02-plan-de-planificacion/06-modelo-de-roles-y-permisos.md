<!-- Documento perteneciente a la Guía Maestra de la Plataforma Educativa SaaS -->
<!-- Fuente original: cole.txt (Líneas 2511 a 2582) -->

# 6. 🔐 Modelo de roles y permisos

No debemos diseñar solamente:

```text
Admin
Profesor
Padre
Alumno
```

Necesitamos permisos granulares.

Por ejemplo:

```text
students.view
students.create
students.update
students.delete

grades.view
grades.create
grades.update
grades.publish

finance.view
finance.collect
finance.refund

payroll.view
payroll.process

store.manage
store.orders
store.inventory

activities.create
activities.manage
activities.registration
```

Y después:

```text
ROL
 ↓
PERMISOS
 ↓
RECURSOS
 ↓
ACCIONES
```

También tendremos permisos por ámbito:

```text
Todo el colegio
      ↓
Nivel
      ↓
Grado
      ↓
Sección
      ↓
Curso
```

Esto será muy potente.

---

---

[⬅️ Anterior: 05. Modelo Comercial](./05-modelo-comercial-y-addons.md) | [🏠 Índice Principal](../README.md) | [Siguiente: 07. Modelo de Datos ➡️](./07-modelo-de-datos.md)

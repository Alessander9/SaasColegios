<!-- Documento perteneciente a la Guía Maestra de la Plataforma Educativa SaaS -->
<!-- Fuente original: cole.txt (Líneas 2583 a 2635) -->

# 7. 🗄️ Modelo de datos

Después del dominio debemos hacer el **ERD completo**.

Por ejemplo:

```text
Tenant
  │
  ├──── User
  │
  ├──── School
  │        │
  │        ├── AcademicYear
  │        ├── Grade
  │        └── Section
  │
  ├──── Student
  │        │
  │        └── Enrollment
  │
  └──── Family
           │
           └── Student
```

Y separar:

### Datos maestros

* Alumno.
* Familia.
* Profesor.
* Curso.
* Producto.

### Datos transaccionales

* Matrícula.
* Pago.
* Pedido.
* Inscripción.
* Planilla.

### Datos históricos

* Notas.
* Asistencia.
* Estados.
* Auditoría.

---

---

[⬅️ Anterior: 06. Modelo de Roles y Permisos](./06-modelo-de-roles-y-permisos.md) | [🏠 Índice Principal](../README.md) | [Siguiente: 08. Arquitectura Financiera ➡️](./08-arquitectura-financiera.md)

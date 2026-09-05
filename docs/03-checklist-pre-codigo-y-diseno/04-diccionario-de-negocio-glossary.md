<!-- Documento perteneciente a la Guía Maestra de la Plataforma Educativa SaaS -->
<!-- Fuente original: cole.txt (Líneas 3496 a 3543) -->

# 4. 🧠 Diccionario de negocio

Esto parece pequeño, pero evita muchísimos problemas.

Por ejemplo:

¿Qué significa exactamente:

* Alumno.
* Estudiante.
* Matrícula.
* Inscripción.
* Curso.
* Grado.
* Sección.
* Periodo.
* Pensión.
* Cuota.
* Concepto.
* Pago.
* Orden.
* Actividad.
* Apoderado.

Porque si un desarrollador entiende "inscripción" como matrícula y otro como inscripción a una actividad, terminaremos con un modelo de datos confuso.

Crearíamos:

# Business Glossary

```text
Alumno
Familia
Apoderado
Matrícula
Curso
Sección
Concepto
Pago
Orden
Actividad
...
```

Con una definición oficial de cada término.

---

---

[⬅️ Anterior: 03. Requisitos No Funcionales](./03-requisitos-no-funcionales.md) | [🏠 Índice Principal](../README.md) | [Siguiente: 05. Bounded Contexts ➡️](./05-bounded-contexts.md)

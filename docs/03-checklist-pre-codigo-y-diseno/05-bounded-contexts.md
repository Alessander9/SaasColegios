<!-- Documento perteneciente a la Guía Maestra de la Plataforma Educativa SaaS -->
<!-- Fuente original: cole.txt (Líneas 3544 a 3582) -->

# 5. 🧩 Bounded Contexts

Antes de crear microservicios debemos definir claramente los dominios.

Yo propondría:

```text
PLATFORM
IDENTITY
INSTITUTION
STUDENTS
FAMILIES
ENROLLMENT
ACADEMIC
FINANCE
HR
PAYROLL
COMMERCE
ACTIVITIES
COMMUNICATION
NOTIFICATIONS
DOCUMENTS
REPORTING
```

Y para cada uno definir:

* Responsabilidad.
* Entidades.
* Reglas.
* Eventos.
* APIs.
* Datos propietarios.
* Dependencias.

Esto nos dará el mapa real de los futuros microservicios.

---

---

[⬅️ Anterior: 04. Diccionario de Negocio (Glossary)](./04-diccionario-de-negocio-glossary.md) | [🏠 Índice Principal](../README.md) | [Siguiente: 06. System of Record ➡️](./06-definir-system-of-record.md)

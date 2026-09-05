<!-- Documento perteneciente a la Guía Maestra de la Plataforma Educativa SaaS -->
<!-- Fuente original: cole.txt (Líneas 2452 a 2510) -->

# 5. 💳 Modelo comercial

Tenemos que diseñar cómo vamos a vender la plataforma.

Por ejemplo:

```text
PLAN BÁSICO
├── 300 alumnos
├── Académico
├── Matrículas
└── Finanzas

PLAN PROFESIONAL
├── 1,000 alumnos
├── Todo lo anterior
├── Planilla
├── Tienda
└── Actividades

ENTERPRISE
├── Alumnos ilimitados*
├── Todos los módulos
├── API
├── BI
├── Soporte premium
└── Base dedicada*
```

Pero además:

### Add-ons

```text
+500 alumnos
+50 profesores
+100 GB
+1,000 pedidos
+API
+WhatsApp
+Contabilidad
```

Y debemos definir qué ocurre técnicamente cuando:

```text
current_usage > allowed_limit
```

¿Bloquear?

¿Advertir?

¿Permitir excedente y cobrar?

Esto forma parte del **Entitlement Engine**.

---

---

[⬅️ Anterior: 04. Multi-tenancy](./04-multi-tenancy.md) | [🏠 Índice Principal](../README.md) | [Siguiente: 06. Modelo de Roles y Permisos ➡️](./06-modelo-de-roles-y-permisos.md)

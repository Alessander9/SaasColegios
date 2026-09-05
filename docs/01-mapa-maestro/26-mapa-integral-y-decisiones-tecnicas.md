<!-- Documento perteneciente a la Guía Maestra de la Plataforma Educativa SaaS -->
<!-- Fuente original: cole.txt (Líneas 1046 a 2195) -->

# 🎯 El mapa maestro completo

En una sola vista:

```text
🌐 PLATAFORMA EDUCATIVA
│
├── 👑 SUPER ADMIN
│   ├── Dashboard
│   ├── Colegios
│   ├── Tenants
│   ├── Usuarios
│   ├── Soporte
│   └── Auditoría
│
├── 💳 SUSCRIPCIONES
│   ├── Planes
│   ├── Suscripciones
│   ├── Add-ons
│   ├── Billing
│   └── Promociones
│
├── 🧩 ENTITLEMENTS
│   ├── Features
│   ├── Módulos
│   ├── Submódulos
│   ├── Límites
│   ├── Overrides
│   └── Consumo
│
├── 🔐 SEGURIDAD
│   ├── Auth
│   ├── Roles
│   ├── Permisos
│   ├── Sesiones
│   └── Auditoría
│
└── 🏫 COLEGIO
    │
    ├── 🏢 Institución
    ├── 👨‍🎓 Alumnos
    ├── 👨‍👩‍👧 Familias
    ├── 📝 Matrículas
    ├── 📚 Académico
    ├── 💰 Finanzas
    ├── 👥 RRHH
    ├── 💵 Planilla
    ├── 🛒 Tienda
    ├── 📅 Actividades
    ├── 📢 Comunicaciones
    ├── 📊 Reportes
    ├── 📱 Portal Padres
    ├── 📱 Portal Profesores
    └── 📱 Portal Alumnos
```

## Lo que tenemos ahora

Con este mapa ya tenemos definido **el alcance funcional de la plataforma**. El siguiente nivel ya no debería ser agregar más ideas, sino convertir este mapa en especificaciones técnicas.

Yo continuaría en este orden:

**Mapa Maestro → Requerimientos de cada módulo → Roles/permisos → Flujos de negocio → Modelo de datos → Arquitectura → APIs → Diseño de pantallas → Roadmap → Desarrollo.**

Y hay una decisión arquitectónica que mantendría como requisito desde el principio: **multi-tenant + Entitlement Engine + núcleo transaccional financiero + auditoría**. Esos cuatro componentes son los que permitirán que la plataforma pueda pasar de un colegio piloto a decenas o cientos de colegios sin tener que reconstruirla.


Mi recomendación de stack

Para el tamaño y complejidad que estamos planteando, mi stack principal sería:

Capa	Tecnología recomendada
Frontend	Next.js + React + TypeScript
UI	Tailwind CSS + componentes propios
Backend	NestJS + TypeScript
API	REST + OpenAPI, eventos para procesos asíncronos
Base de datos	PostgreSQL
Cache	Redis
Mensajería	RabbitMQ inicialmente / Kafka cuando la escala lo justifique
Archivos	S3 compatible
Autenticación	Keycloak o proveedor gestionado
Búsqueda	PostgreSQL inicialmente / OpenSearch posteriormente
Jobs	BullMQ/Redis inicialmente
Observabilidad	OpenTelemetry + Prometheus + Grafana + Loki
Logs	ELK/OpenSearch
Contenedores	Docker
Orquestación	Kubernetes
CI/CD	GitHub Actions / GitLab CI
IaC	Terraform
CDN	Cloudflare / CDN cloud
Cloud	AWS, GCP o Azure
Monorepo	Nx o Turborepo
Documentación API	OpenAPI/Swagger
Testing	Jest + Playwright
Analytics	PostgreSQL → Data Warehouse

Y hay una decisión que me parece particularmente importante:

TypeScript de extremo a extremo para la primera etapa.

No usaría 4 lenguajes diferentes solamente porque estamos haciendo microservicios.

1. Arquitectura que construiría

No pensaría:

Frontend → Backend → Base de datos

Sino:

                         INTERNET
                            │
                            ▼
                    ┌───────────────┐
                    │ Cloudflare/CDN│
                    └───────┬───────┘
                            │
                            ▼
                    ┌───────────────┐
                    │ API Gateway   │
                    └───────┬───────┘
                            │
              ┌─────────────┼─────────────┐
              │             │             │
              ▼             ▼             ▼
        Platform Core   School Core    Portales
              │             │             │
              └─────────────┼─────────────┘
                            │
                     Event / Message Bus
                            │
          ┌─────────────────┼─────────────────┐
          ▼                 ▼                 ▼
      Finanzas          Académico          Tienda
          │                 │                 │
          └─────────────────┼─────────────────┘
                            │
                   ┌────────┴────────┐
                   ▼                 ▼
               PostgreSQL          Redis
                   │
             Object Storage
                   │
                   ▼
              Data Warehouse
2. Lo más importante: separar dominios

No quiero que tengamos un servicio llamado:

school-service

que termine teniendo 300 tablas y 500 endpoints.

Lo dividiría por bounded contexts.

Platform Domain
platform-service

Responsable de:

Tenants.
Colegios.
Estado de colegios.
Configuración global.
Super Admin.
Planes.
Suscripciones.
Entitlements.
Límites.
Add-ons.
Auditoría global.
3. Identity Service
identity-service

Responsable de:

Usuarios.
Autenticación.
Sesiones.
MFA.
Roles.
Permisos.
Organizaciones.
Relaciones usuario/tenant.

Aquí quiero una separación importante:

Usuario
   │
   ├── pertenece a Colegio A
   ├── pertenece a Colegio B
   └── tiene roles diferentes

Esto nos permite incluso que un usuario pueda tener acceso a más de una organización si algún día lo necesitamos.

4. School/Institution Service
institution-service

Gestionaría:

Colegio.
Sedes.
Periodos.
Niveles.
Grados.
Secciones.
Aulas.
Configuración institucional.
5. Student Service
student-service

Responsable de:

Alumnos.
Datos personales.
Documentos.
Estados.
Historial básico.
6. Family Service
family-service

Responsable de:

Padres.
Apoderados.
Tutores.
Contactos.
Relaciones familiares.

Por ejemplo:

Familia
   │
   ├── Padre
   ├── Madre
   │
   ├── Alumno A
   ├── Alumno B
   └── Alumno C
7. Enrollment Service
enrollment-service

Aquí concentramos:

Admisiones.
Preinscripciones.
Matrículas.
Renovaciones.
Traslados.
Retiros.
Asignación de sección.

Este servicio es muy importante porque conecta muchos dominios.

8. Academic Service
academic-service

Incluye:

Cursos.
Plan curricular.
Profesores.
Horarios.
Evaluaciones.
Notas.
Asistencia.
Boletas.
Actas.

Aunque sea un servicio grande inicialmente, internamente lo compondría:

Academic
├── Course
├── Evaluation
├── Grade
├── Attendance
├── Schedule
└── Academic Documents

No necesitamos convertir cada uno inmediatamente en un microservicio independiente.

9. Finance Service

Este merece mucho cuidado.

finance-service

Gestionaría:

Conceptos de cobro.
Pensiones.
Cuotas.
Descuentos.
Becas.
Estados de cuenta.
Pagos.
Devoluciones.
Caja.
Morosidad.

Y aquí aplicaría una regla:

Finanzas debe ser altamente consistente y transaccional.

No queremos que un pago aparezca como realizado en un módulo y pendiente en otro.

10. Commerce Service

Para la tienda:

commerce-service

Responsable de:

Productos.
Categorías.
Variantes.
Tallas.
Precios.
Inventario.
Carrito.
Pedidos.
Entregas.

Por ejemplo:

Product
   │
   ├── Variant
   │     ├── Size
   │     └── Color
   │
   └── Inventory
11. Activities Service
activities-service

Gestionará:

Actividades.
Eventos.
Talleres.
Excursiones.
Paseos.
Cupos.
Inscripciones.
Formularios.
Autorizaciones.
Participantes.
Asistencia.

Y puede consumir el sistema financiero:

Actividad
    ↓
Inscripción
    ↓
Orden
    ↓
Pago
12. HR Service
hr-service

Responsable de:

Trabajadores.
Profesores.
Contratos.
Documentos.
Vacaciones.
Permisos.
Incidencias.
Asistencia del personal.
13. Payroll Service
payroll-service

Separaría planilla de RRHH.

Porque posteriormente puede crecer mucho.

HR
│
├── Employees
├── Contracts
├── Attendance
└── Leave

Payroll
│
├── Payroll Period
├── Earnings
├── Deductions
├── Taxes
├── Bonuses
├── Settlements
└── Payslips
14. Communication Service
communication-service

Centraliza:

Comunicados.
Mensajes.
Plantillas.
Campañas.
Segmentación.

Y otro servicio:

notification-service

para:

Email.
Push.
SMS.
WhatsApp.

Así no contaminamos los servicios de negocio con integraciones externas.

15. Document Service
document-service

Todo documento pasa por aquí:

Alumno
Contrato
Boleta
Certificado
Autorización
Comprobante
Producto

Se almacena en:

S3 / Object Storage

Y la base de datos guarda metadata:

document_id
tenant_id
entity_type
entity_id
storage_key
mime_type
version
created_at
16. Reporting Service

No haría todos los reportes consultando directamente las bases transaccionales.

Tendríamos:

Servicios
    │
    ▼
Event Bus
    │
    ▼
Data Pipeline
    │
    ▼
Data Warehouse
    │
    ▼
Reporting / BI

Así podemos generar:

Reportes financieros.
Académicos.
Matrículas.
Tienda.
Actividades.
RRHH.
Plataforma SaaS.
17. Entitlement Service

Este es uno de los servicios más importantes de todo el proyecto.

entitlement-service

Pregunta:

¿Puede este colegio hacer esto?

Ejemplo:

Can:
tenant = colegio_001
feature = payroll
action = create

Respuesta:

allowed = true

Otro ejemplo:

tenant = colegio_002
resource = students
current = 500
limit = 500

Respuesta:

allowed = false
reason = LIMIT_REACHED
18. Feature Flags

También tendremos:

feature_flags

Por ejemplo:

PAYROLL
STORE
ACTIVITIES
API
ACCOUNTING
ADVANCED_REPORTS

Pero no mezclaría conceptualmente:

Feature Flag = funcionalidad técnica.

Entitlement = derecho comercial del cliente a usarla.

Esto nos permitirá hacer cosas como:

Feature técnicamente disponible
        ↓
Entitlement contratado
        ↓
Límite permitido
        ↓
Permiso del usuario
        ↓
ACCESO
19. Base de datos

Aquí tomaría una decisión importante.

No haría una única base gigantesca

Tampoco haría inmediatamente:

una base PostgreSQL por cada colegio.

Eso sería demasiado operacionalmente costoso al principio.

Haría:

PostgreSQL por dominio/servicio

Conceptualmente:

Platform DB
School DB
Student DB
Academic DB
Finance DB
Commerce DB
Activities DB
HR DB
Payroll DB

Y cada servicio es propietario de sus datos.

20. Multi-tenancy

Dentro de las bases de negocio:

tenant_id

sería obligatorio.

Ejemplo:

students

id
tenant_id
first_name
last_name
...

Y todas las consultas estarán protegidas.

Incluso podemos utilizar PostgreSQL Row Level Security como capa adicional.

21. ¿Una base por colegio?

Más adelante podríamos permitir distintos modelos:

Tier estándar
PostgreSQL
   │
   ├── Tenant A
   ├── Tenant B
   ├── Tenant C
   └── Tenant N
Enterprise
Colegio Enterprise
        │
        ▼
Base de datos dedicada

Esto es excelente comercialmente.

Podríamos vender:

Enterprise Dedicated Database

a instituciones grandes.

22. Mensajería

Para comunicación entre servicios:

Service A
    │
    ▼
Event Bus
    │
    ├── Service B
    ├── Service C
    └── Service D

Por ejemplo:

EnrollmentCompleted

puede provocar:

Finance → generar cuotas
Academic → asignar estructura
Notification → enviar confirmación
Reporting → registrar métrica

Esto evita acoplar todos los servicios.

23. RabbitMQ vs Kafka

Para este proyecto comenzaría con:

RabbitMQ

Porque necesitamos principalmente:

Jobs.
Eventos.
Colas.
Procesamiento asíncrono.
Integraciones.

Kafka lo introduciría cuando realmente tengamos necesidades de:

enorme volumen de eventos;
streaming;
analytics en tiempo real;
múltiples consumidores masivos.

No usaría Kafka simplemente porque "microservicios = Kafka".

24. Redis

Redis tendría varios usos:

Redis
├── Cache
├── Sesiones
├── Rate limiting
├── Locks
├── Idempotency keys
└── Job queues

Especialmente importante para:

Entitlements

Podemos cachear:

tenant:001:entitlements

y evitar consultar la base de datos constantemente.

25. API Gateway

Todo tráfico externo entra por:

Client
   ↓
API Gateway

Responsabilidades:

Authentication.
Rate limiting.
Routing.
CORS.
API versioning.
Request tracing.

Por ejemplo:

/api/v1/students
/api/v1/enrollments
/api/v1/finance
/api/v1/store
/api/v1/activities
26. Frontend

Tendría un ecosistema de aplicaciones.

Super Admin
platform-web
Colegio
school-web
Portal padres
parent-web
Portal profesores
teacher-web
Portal alumnos
student-web

Pero compartirían:

packages/
├── ui
├── auth
├── api-client
├── types
├── permissions
└── utilities

Por eso usaría Nx o Turborepo.

27. Mobile

No comenzaría haciendo cuatro aplicaciones móviles.

Inicialmente:

PWA / responsive web.

Posteriormente:

React Native

para una aplicación móvil de:

Padres.
Profesores.
Alumnos.
28. Infraestructura

Para producción:

                    CLOUD
                      │
                Cloudflare
                      │
                  Load Balancer
                      │
                 Kubernetes
                      │
       ┌──────────────┼──────────────┐
       │              │              │
    API Pods       Worker Pods    Service Pods
       │              │              │
       └──────────────┼──────────────┘
                      │
              PostgreSQL / Redis
                      │
              Object Storage
Kubernetes

Sí lo utilizaría como arquitectura objetivo.

Pero no empezaría necesariamente con un cluster Kubernetes enorme.

Podemos comenzar con:

Docker
+
Managed Kubernetes

cuando entremos en producción real.

29. CI/CD

Cada servicio debería poder desplegarse independientemente.

Git Push
   ↓
CI
   ├── Lint
   ├── Unit Tests
   ├── Integration Tests
   ├── Security Scan
   └── Build
          ↓
       Docker
          ↓
      Registry
          ↓
       Deploy
          ↓
     Kubernetes
30. Observabilidad

Desde el primer día:

OpenTelemetry

Para tracing distribuido.

Ejemplo:

POST /enrollment

Gateway
   ↓ 12ms
Enrollment Service
   ↓ 34ms
Finance Service
   ↓ 20ms
Notification Service
   ↓ 15ms

Podremos saber dónde está el problema.

Stack
OpenTelemetry.
Prometheus.
Grafana.
Loki.
OpenSearch.
31. Seguridad

La arquitectura debe aplicar:

Zero Trust
+
Least Privilege
+
Tenant Isolation
+
Encryption
+
Auditability

Y específicamente:

TLS.
MFA.
RBAC.
permisos granulares.
aislamiento tenant.
secrets management.
WAF.
rate limiting.
backups.
disaster recovery.
auditoría.
32. Patrón fundamental: Transactional Outbox

Para este proyecto lo considero obligatorio.

Ejemplo:

Un padre paga una pensión.

No queremos:

Pago guardado ✓
Evento perdido ✗

Usamos:

Finance DB
│
├── Payment
└── Outbox Event
          │
          ▼
      Message Broker
          │
          ├── Notification
          ├── Reporting
          └── Accounting

Esto aumenta muchísimo la confiabilidad.

33. Idempotencia

Especialmente para:

pagos;
matrículas;
pedidos;
inscripciones.

Si el usuario presiona dos veces:

"Pagar"

no queremos cobrar dos veces.

Usaremos:

idempotency_key

en operaciones críticas.

34. ¿Microservicios desde el día uno?

Aquí está mi recomendación más importante.

Sí a microservicios como arquitectura de dominios.

Pero:

No a 20 repositorios, 20 pipelines y 20 bases desde el primer sprint.

Haría una evolución:

Etapa 1
Modular Monolith

pero con módulos completamente separados:

/apps
  api

/modules
  platform
  identity
  students
  academic
  finance
  commerce
  activities
  hr
  payroll

Cada módulo tiene:

controller
application
domain
infrastructure
Etapa 2

Extraemos:

Finance
Commerce
Notifications

como microservicios.

Etapa 3

Extraemos:

Academic
Payroll
Activities

cuando la carga lo justifique.

Etapa 4

Plataforma completamente distribuida.

Esto nos permite mantener la arquitectura preparada para microservicios sin pagar desde el principio todo el costo operacional de los microservicios.

35. Arquitectura de código

Me gusta especialmente esta estructura:

platform/
│
├── apps/
│   ├── platform-api
│   ├── school-api
│   ├── worker
│   └── ...
│
├── services/
│   ├── identity
│   ├── institution
│   ├── students
│   ├── families
│   ├── enrollment
│   ├── academic
│   ├── finance
│   ├── commerce
│   ├── activities
│   ├── hr
│   ├── payroll
│   ├── notifications
│   ├── documents
│   └── reporting
│
├── packages/
│   ├── ui
│   ├── auth
│   ├── database
│   ├── events
│   ├── contracts
│   ├── permissions
│   ├── observability
│   └── config
│
└── infrastructure/
    ├── terraform
    ├── kubernetes
    ├── docker
    └── monitoring
36. La arquitectura completa

En términos conceptuales:

                              INTERNET
                                  │
                    ┌─────────────┴─────────────┐
                    │                           │
              Web / Mobile                 Integraciones
                    │                           │
                    └─────────────┬─────────────┘
                                  ▼
                         ┌────────────────┐
                         │ API GATEWAY/WAF │
                         └───────┬────────┘
                                 │
                         ┌───────▼────────┐
                         │ IDENTITY / IAM │
                         └───────┬────────┘
                                 │
          ┌──────────────────────┼──────────────────────┐
          │                      │                      │
          ▼                      ▼                      ▼
   PLATFORM DOMAIN        SCHOOL DOMAIN         BUSINESS DOMAINS
          │                      │                      │
   ┌──────┴──────┐       ┌───────┴───────┐      ┌─────┼──────────┐
   │             │       │               │      │     │          │
Tenants     Entitlements Students      Academic Finance Commerce Activities
Plans       Billing      Families      Enrollment HR      Payroll
Subscriptions           Institution   Attendance         Notifications
                          │
                          ▼
                   ┌───────────────┐
                   │ EVENT BUS     │
                   │ RabbitMQ      │
                   └───────┬───────┘
                           │
             ┌─────────────┼──────────────┐
             ▼             ▼              ▼
          Workers       Reporting      Notifications
             │             │              │
             ▼             ▼              ▼
          Redis       Data Warehouse   Email/SMS/etc.
             │
             ▼
       ┌───────────────────────────────┐
       │           DATA               │
       │ PostgreSQL / Redis / S3      │
       └───────────────────────────────┘
                           │
                           ▼
                ┌────────────────────┐
                │ OBSERVABILITY      │
                │ OTel/Grafana/Logs  │
                └────────────────────┘
🎯 Mi elección final

Si hoy tuviera que arrancar este proyecto, elegiría:

Frontend

Next.js
React
TypeScript
Tailwind
Monorepo Nx

Backend

NestJS
TypeScript
REST/OpenAPI
Domain-driven modules

Datos

PostgreSQL
Redis
S3

Asíncrono

RabbitMQ
BullMQ para jobs

Infraestructura

Docker
Kubernetes
Terraform
AWS/GCP/Azure

Seguridad

Keycloak o IAM gestionado
JWT/OIDC
MFA
RBAC
Tenant isolation

Observabilidad

OpenTelemetry
Prometheus
Grafana
Loki/OpenSearch

CI/CD

GitHub Actions
Docker Registry
Kubernetes deployments

Arquitectura

Multi-tenant
Domain-driven
API-first
Event-driven donde tenga sentido
Transactional Outbox
Idempotencia
Microservicios progresivos


Sí. De hecho, **antes de escribir código todavía nos falta una etapa importante de planificación**. El stack y la arquitectura son solamente una parte.

Para un proyecto de este tamaño, yo planificaría en **12 grandes bloques**. Si hacemos esto correctamente, después el desarrollo será mucho más ordenado y podremos incorporar nuevos colegios sin rehacer la plataforma.

---

[⬅️ Anterior: 25. Clasificación de Módulos](./25-clasificacion-de-modulos.md) | [🏠 Índice Principal](../README.md) | [Siguiente: 01. Requerimientos Funcionales ➡️](../02-plan-de-planificacion/01-requerimientos-funcionales.md)

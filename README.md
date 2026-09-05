# 🏫 Cole Platform — Plataforma Integral de Gestión Educativa SaaS

Multi-tenant SaaS platform for managing schools, built with NestJS, Next.js, PostgreSQL, and Prisma.

## 🏗️ Architecture

```
cole-platform/
├── apps/
│   ├── web-platform-admin/     # Super Admin portal
│   ├── web-school-admin/       # School administration panel
│   ├── web-teacher-portal/     # Teacher portal
│   ├── web-parent-portal/      # Parent/family portal
│   └── web-student-portal/     # Student portal
├── services/
│   └── core-api/               # NestJS modular monolith
│       └── src/modules/
│           ├── platform/       # Tenants, Plans, Subscriptions
│           ├── identity/       # Auth, RBAC, Roles
│           ├── school-core/    # Institution, Campus, Periods
│           ├── student/        # Student records
│           ├── enrollment/     # Admissions & enrollment
│           ├── academic/       # Curriculum, grades, attendance
│           ├── finance/        # Payments, cash box, charges
│           ├── commerce/       # Virtual store, inventory
│           ├── activity/       # Workshops, trips, events
│           ├── hr/             # Employee records, contracts
│           ├── payroll/        # Payroll processing
│           ├── reporting/      # Analytics & BI dashboards
│           ├── notification/   # Email, SMS, push, in-app
│           ├── document/       # PDF generation & storage
│           ├── audit/          # Immutable audit logs
│           └── entitlement/    # Feature entitlements engine
├── packages/
│   ├── database/               # Prisma schema & migrations
│   ├── domain-types/           # Shared types, events, permissions
│   ├── logger/                 # Structured JSON logging
│   └── ui-components/          # React UI primitives
├── docker-compose.yml          # Development services
├── docker-compose.prod.yml     # Production deployment
└── turbo.json                  # Turborepo config
```

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- pnpm 9+
- Docker & Docker Compose

### Development

```bash
# Install dependencies
pnpm install

# Start infrastructure (PostgreSQL, Redis, RabbitMQ, MinIO)
docker compose up -d

# Generate Prisma client
cd packages/database && pnpm prisma generate

# Run database migrations
pnpm prisma migrate dev

# Start all apps in dev mode
pnpm dev
```

### Available Apps

| App | URL | Description |
|---|---|---|
| Platform Admin | http://localhost:3000 | Super Admin dashboard |
| School Admin | http://localhost:3001 | School administration |
| Teacher Portal | http://localhost:3002 | Teacher interface |
| Parent Portal | http://localhost:3003 | Parent/family interface |
| Student Portal | http://localhost:3004 | Student interface |
| API Docs | http://localhost:4000/docs | Swagger OpenAPI |

## 🧪 Testing

```bash
# Run all tests
pnpm test

# Run tests for a specific module
cd services/core-api && pnpm jest --testPathPattern=finance

# Type check
pnpm typecheck
```

## 🏢 Modules

| Module | Description | Tests |
|---|---|---|
| Platform | Tenant provisioning, plans, subscriptions | ✅ |
| Identity | JWT auth, RBAC, permissions | ✅ |
| School Core | Institution config, campus, periods | ✅ |
| Student | Student records, families | ✅ |
| Enrollment | Admissions, enrollment lifecycle | ✅ |
| Academic | Curriculum, grades, attendance | ✅ |
| Finance | Charges, payments, cash box | ✅ |
| Commerce | Virtual store, inventory, orders | ✅ |
| Activity | Workshops, trips, consents | ✅ |
| HR | Employee records, contracts | ✅ |
| Payroll | Payroll processing, payslips | ✅ |
| Reporting | Analytics, KPIs, exports | ✅ |
| Notification | Email, SMS, push, in-app | ✅ |
| Document | PDF generation, file storage | ✅ |
| Audit | Immutable audit logs | ✅ |

## 🔐 Security

- Multi-tenant data isolation (every query scoped by `tenant_id`)
- JWT authentication with tenant context resolution
- Role-based access control (RBAC) with granular permissions
- Rate limiting (100 req/min global, 10 req/min auth)
- Security headers (Helmet)
- CORS configuration
- Input validation & sanitization
- Immutable financial records (no deletes, only reversals)
- Audit logging for all sensitive operations

## 📦 Production Deployment

```bash
# Set environment variables
cp .env.example .env
# Edit .env with production values

# Deploy with Docker Compose
docker compose -f docker-compose.prod.yml up -d
```

### Infrastructure

- **PostgreSQL 16** — Primary database with connection pooling
- **Redis 7** — Caching, sessions, rate limiting
- **RabbitMQ 3** — Async event processing
- **MinIO** — Object storage for documents and files

## 📊 Tech Stack

- **Backend:** NestJS 11, TypeScript, Prisma ORM
- **Frontend:** Next.js 15 (App Router), React, Tailwind CSS
- **Database:** PostgreSQL 16
- **Cache:** Redis 7
- **Queue:** RabbitMQ 3
- **Storage:** MinIO / S3-compatible
- **Monorepo:** Turborepo + pnpm workspaces
- **Testing:** Jest
- **API Docs:** Swagger / OpenAPI

## 📝 License

Private — Cole Platform © 2026

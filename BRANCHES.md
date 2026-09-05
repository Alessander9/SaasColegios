# 🌿 Estrategia de Ramas Git, Alta Disponibilidad y Respaldo - SaaS Colegios

Este documento describe la arquitectura oficial de ramas, entornos de despliegue, políticas de recuperación ante desastres (DR) y el flujo de trabajo (GitFlow) para garantizar que la plataforma **nunca quede sin solución frente al cliente y se mantenga 100% online**.

---

## 🗺️ Mapa General de Ramas y Entornos

```
                              [feature/*] (Nuevas funcionalidades)
                                     │
                                     ▼
 [dev] (Integración continua / Testing) ────────────────────────┐
                                                                │ (PR Aprobado)
                                                                ▼
 [staging] (Pre-producción espejo para pruebas de humo/carga) ──┤
                                                                │ (Validación 100%)
                                                                ▼
 [main] (Troncal oficial auditado) ────────────────────────────► [deploy] (Producción en Vivo)
                                                                │
                     ┌──────────────────────────────────────────┼──────────────────────────────────────────┐
                     ▼                                          ▼                                          ▼
           [backup-pre-deploy]                            [backup-sistema]                         Tags Inmutables
      (Snapshot estable anterior)                    (Copia de seguridad total)                   (v1.2.0-stable)
                     │
                     ▼
          [hotfix/*] (Parches críticos en caliente directos a producción)
```

---

## 📋 Detalle y Propósito de Cada Rama

### 1. `deploy` (Producción en Vivo)
* **Propósito:** Código fuente idéntico al ejecutado en los servidores de producción de los colegios.
* **Características activas:**
  - Sistema Dual de Asistencia Escolar (Kiosko QR en Portería + Registro Manual Docente).
  - Resiliencia Offline-First (almacenamiento en cola local y autosincronización).
  - Selector multimoneda (Soles, Dólares, Euros).
  - Persistencia de sesión con cookies y timeout configurable por inactividad.
  - Microanimaciones e interfaz ejecutiva interactiva.
* **Políticas:** Despliegues protegidos con cero tiempo de inactividad (*Zero-Downtime*).

---

### 2. `staging` (Entorno Espejo de Pre-Producción)
* **Propósito:** Entorno idéntico a producción donde se ejecutan pruebas de carga, pruebas de regresión E2E de Selenium y validaciones de aceptación de cliente antes de enviar a `deploy`.
* **Regla:** Ningún cambio pasa a `deploy` sin haber estado en `staging` exitosamente.

---

### 3. `hotfix` (Parches Críticos de Emergencia)
* **Propósito:** Rama de respuesta ultrarrápida (SLA < 15 min) para corregir incidencias urgentes reportadas en vivo sin esperar al ciclo de desarrollo normal.
* **Flujo:** Se desprende de `deploy`/`main`, se aplica el parche, se valida y se mergea de inmediato hacia `deploy`, `main` y `dev`.

---

### 4. `dev` (Desarrollo Activo e Integración Continua)
* **Propósito:** Rama de trabajo diario donde los desarrolladores unen sus ramas `feature/*` mediante Pull Requests.

---

### 5. `feature` (Nuevas Funcionalidades y Módulos)
* **Propósito:** Rama base para nuevas capacidades (ej. facturación SUNAT, integración con SIAGIE MINEDU, pagos automáticos).
* **Convención:** `feature/nombre-de-la-funcionalidad`.

---

### 6. `backup-pre-deploy` (Rollback Inmediato Pre-Deploy)
* **Propósito:** Punto de restauración garantizado previo al último despliegue mayor (Commit `50b8ad0`).
* **Uso:** Si un despliegue mayor presenta inconsistencias en la nube, este snapshot permite regresar al estado previo en segundos.

---

### 7. `backup-sistema` (Copia de Seguridad Integral)
* **Propósito:** Snapshot histórico de todo el ecosistema (5 portales web, backend NestJS, bases de datos Prisma y suite Selenium E2E).

---

## 🏷️ Tags Semánticos Inmutables (Releases)

Las ramas se mueven con nuevos commits, pero los **Git Tags** permanecen fijos e inmutables:
* **`v1.2.0-stable`**: Versión certificada con Asistencia Dual QR, Offline-First, Multimoneda, Persistencia de Sesión y Suite E2E con 100% de éxito.

---

## 🛡️ Herramientas de Alta Disponibilidad & Disaster Recovery

El sistema cuenta con scripts automatizados de respaldo y restauración en un solo comando:

```bash
# Generar un snapshot completo del sistema en la carpeta /backups
pnpm run backup:system

# Verificar integridad y restaurar estado
pnpm run restore:system
```

---

## 🔒 Tabla de Gobernanza y SLAs

| Rama / Tag | Entorno | Nivel de Estabilidad | SLA de Recuperación | Requiere Tests |
| :--- | :--- | :--- | :--- | :--- |
| `deploy` | Producción | ⭐⭐⭐⭐⭐ (Crítico) | < 3 min | Sí (100% E2E + Build) |
| `hotfix` | Parche Urgente | ⭐⭐⭐⭐⭐ (Crítico) | Inmediato | Sí (Smoke Tests) |
| `staging` | Pre-Producción | ⭐⭐⭐⭐⭐ (Alto) | < 5 min | Sí (E2E Completo) |
| `main` | Troncal | ⭐⭐⭐⭐⭐ (Alto) | < 5 min | Sí (100% Tests) |
| `dev` | Desarrollo | ⭐⭐⭐⭐ (Medio) | < 15 min | Sí (Build + Unit) |
| `feature` | En Desarrollo | ⭐⭐⭐ (En Construcción) | N/A | Recomendado |
| `v1.2.0-stable` | Tag Inmutable | ⭐⭐⭐⭐⭐ (Inmutable) | Punto Cero | Validado |

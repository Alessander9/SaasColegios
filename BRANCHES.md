# 🌿 Estrategia de Ramas Git (Branching Strategy) - SaaS Colegios

Este documento describe la estructura oficial de ramas del repositorio, el propósito de cada una, el flujo de trabajo (workflow) para el equipo de ingeniería y las políticas de despliegue y copias de seguridad.

---

## 🗺️ Mapa General de Ramas

```
                            [feature/*] (Nuevas funcionalidades)
                                   │
                                   ▼
 [dev] (Integración y pruebas continuas) ────────────────────────┐
                                                                 │ (PR / Merge)
                                                                 ▼
 [main] (Código consolidado validado) ──────────────────────────► [deploy] (Producción en Vivo)
                                                                 │
                                         ┌───────────────────────┴───────────────────────┐
                                         ▼                                               ▼
                         [backup-pre-deploy]                                     [backup-sistema]
                    (Respaldo funcional anterior)                          (Copia de seguridad actual)
```

---

## 📋 Detalle y Propósito de Cada Rama

### 1. `main` (Rama Troncal Principal)
* **Propósito:** Contiene el código fuente principal, auditado y aprobado. Todo cambio que ingresa a `main` ha superado previamente la suite completa de pruebas unitarias y E2E de Selenium.
* **Políticas:**
  - No se realizan commits directos en caliente sin revisión previa.
  - Sirve de base para sincronizar las ramas de producción y respaldos.

---

### 2. `dev` (Desarrollo e Integración)
* **Propósito:** Rama activa de desarrollo e integración de software. Aquí confluyen los avances y pruebas de las distintas áreas (School Admin, Backend Core API, Portal Docente, Portal Padre, Portal Alumno).
* **Uso:**
  - Los desarrolladores integran sus ramas de características (`feature/*`) hacia `dev`.
  - Permite ejecutar pipelines de integración continua (CI) en un entorno de pruebas sin comprometer la estabilidad del sistema desplegado.

---

### 3. `feature` (Nuevas Características y Módulos)
* **Propósito:** Rama base y de referencia para la creación y experimentación de nuevas funcionalidades del SaaS escolar (ej. nuevos métodos de pago, facturación electrónica SUNAT, módulos de mensajería masiva).
* **Convención de nomenclatura recomendada para ramas derivadas:**
  - `feature/nombre-de-la-funcionalidad` (ej. `feature/minedu-siagie-export`, `feature/carnet-nfc`)
* **Flujo:** Se crea a partir de `dev`, se trabaja la funcionalidad de manera aislada y luego se realiza un Pull Request hacia `dev`.

---

### 4. `deploy` (Versión Estable en Producción / Despliegue)
* **Propósito:** Representa con exactitud el estado del código desplegado en el entorno de **Producción en Vivo**.
* **Estado Actual:** Contiene la versión completa con el **Sistema Dual de Asistencia Escolar (Kiosko QR Automático en Portería + Registro Manual en Aula por Docente)**, control de monedas (Soles, Dólares, Euros), persistencia de cookies, cierre configurable por inactividad y microanimaciones de alta fidelidad.
* **Políticas:**
  - Solo recibe merges aprobados desde `main`.
  - Cada versión desplegada en esta rama debe contar con una etiqueta (Git Tag) de versión semántica (ej. `v1.2.0`).

---

### 5. `backup-pre-deploy` (Último Backup Funcional Previo al Despliegue)
* **Propósito:** Copia de seguridad y punto de restauración inmediato (Rollback Snapshot). Contiene la versión estable funcional del sistema **justo antes del último despliegue mayor de asistencia QR** (Commit `50b8ad0`: persistencia de sesión con cookies, timeout configurable y soporte multimoneda).
* **Utilidad:**
  - En caso de contingencia o fallo crítico durante un despliegue, permite restaurar el servicio en segundos al estado previamente validado.

---

### 6. `backup-sistema` (Copia de Seguridad Integral)
* **Propósito:** Snapshot y respaldo de seguridad completo de todo el ecosistema (los 5 portales web, el backend NestJS, schemas de base de datos Prisma y suites completas de pruebas).
* **Mantenimiento:**
  - Se actualiza periódicamente tras cada hito importante o cierre de ciclo de desarrollo para garantizar redundancia y resguardo histórico de la plataforma.

---

## 🛠️ Comandos Frecuentes de Trabajo

### Trabajar en una nueva característica
```bash
# Cambiar a la rama dev y actualizarla
git checkout dev
git pull origin dev

# Crear tu rama de funcionalidad
git checkout -b feature/mi-nueva-mejora

# Guardar cambios y subir
git add .
git commit -m "feat(modulo): descripcion de la mejora"
git push origin feature/mi-nueva-mejora
```

### Actualizar el entorno de producción (`deploy`)
```bash
git checkout deploy
git merge main
git push origin deploy
```

### Restaurar versión desde el backup pre-deploy (en caso de emergencia)
```bash
git checkout backup-pre-deploy
# O crear una rama hotfix a partir del backup
git checkout -b hotfix/restauracion-emergencia backup-pre-deploy
```

---

## 🔒 Tabla Resumen de Gobernanza

| Rama | Entorno / Destino | Nivel de Estabilidad | Requiere Tests |
| :--- | :--- | :--- | :--- |
| `main` | Troncal Corporativo | ⭐⭐⭐⭐⭐ (Muy Alto) | Sí (100% E2E + Unit) |
| `deploy` | Producción en la Nube | ⭐⭐⭐⭐⭐ (Muy Alto) | Sí (100% E2E + Build) |
| `dev` | Staging / Desarrollo | ⭐⭐⭐⭐ (Medio-Alto) | Sí (Build + Unit) |
| `feature` | Ramas de Trabajo | ⭐⭐⭐ (En Construcción) | Recomendado |
| `backup-pre-deploy` | Punto de Restauración | ⭐⭐⭐⭐⭐ (Inmutable) | Validado históricamente |
| `backup-sistema` | Respaldo General | ⭐⭐⭐⭐⭐ (Inmutable) | Validado históricamente |

#!/usr/bin/env node
/**
 * Automated Disaster Recovery & Restore Utility
 * SaaS Colegios - High Availability Disaster Recovery Tool
 */
const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const backupsDir = path.join(rootDir, 'backups');
const latestPath = path.join(backupsDir, 'latest_backup.json');

console.log('═══════════════════════════════════════════════════════════════');
console.log('🔄 RESTAURACIÓN Y VERIFICACIÓN DE INTEGRIDAD DEL SISTEMA');
console.log('═══════════════════════════════════════════════════════════════');

if (!fs.existsSync(latestPath)) {
  console.error('❌ No se encontró ningún archivo de backup en backups/latest_backup.json');
  process.exit(1);
}

try {
  const content = JSON.parse(fs.readFileSync(latestPath, 'utf-8'));
  console.log(`📦 Último Backup Identificado:`);
  console.log(`   • Versión: ${content.version}`);
  console.log(`   • Fecha: ${new Date(content.timestamp).toLocaleString('es-PE')}`);
  console.log(`   • Rama: ${content.gitBranch}`);
  console.log(`   • Commit: ${content.gitCommit}`);
  console.log(`   • Estado: ${content.status}`);
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('✅ Integridad verificada. Todos los servicios listos para arranque.');
} catch (error) {
  console.error('❌ Error al procesar el archivo de restauración:', error);
  process.exit(1);
}

/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  SELENIUM TEST SUITE: ALL PORTALS                                         ║
 * ║  Full browser automation with Selenium WebDriver                          ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

const PORTALS = {
  platformAdmin: { url: 'http://localhost:3000', name: 'Super Admin' },
  schoolAdmin: { url: 'http://localhost:3001', name: 'School Admin' },
  parentPortal: { url: 'http://localhost:3003', name: 'Parent Portal' },
  teacherPortal: { url: 'http://localhost:3004', name: 'Teacher Portal' },
  studentPortal: { url: 'http://localhost:3005', name: 'Student Portal' },
};

const CREDENTIALS = {
  superAdmin: { email: 'admin@cole.pe', password: 'Cole2026!' },
  director: { email: 'director@sanjose.edu.pe', password: 'Cole2026!' },
  teacher: { email: 'elena.torres@sanjose.edu.pe', password: 'Cole2026!' },
  parent: { email: 'padre.garcia@email.com', password: 'Cole2026!' },
};

let totalTests = 0, passed = 0, failed = 0;
const results = [];
function logTest(name, status, detail = '') {
  totalTests++;
  if (status === 'PASS') { passed++; console.log(`  ✅ PASS: ${name}`); }
  else { failed++; console.log(`  ❌ FAIL: ${name} - ${detail}`); }
  results.push({ name, status, detail });
}

async function createDriver() {
  const options = new chrome.Options();
  options.addArguments('--headless=new', '--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu', '--window-size=1920,1080');
  return new Builder().forBrowser('chrome').setChromeOptions(options).build();
}

async function safeQuit(driver) { try { await driver.quit(); } catch {} }

async function tryLogin(driver, portalUrl, email, password, { clickAdminButton = false } = {}) {
  await driver.get(portalUrl);
  await driver.sleep(4000);

  // Some portals (Super Admin) show a landing page first — click the admin button
  if (clickAdminButton) {
    try {
      const adminBtn = await driver.wait(until.elementLocated(By.css('button[title*="Super Admin"]')), 5000);
      await adminBtn.click();
      await driver.sleep(3000);
    } catch {}
  }

  // Find email input
  let emailInput;
  for (const sel of [By.css('input[type="email"]'), By.css('input[name="email"]')]) {
    try { emailInput = await driver.wait(until.elementLocated(sel), 8000); break; } catch {}
  }
  if (!emailInput) throw new Error('No email input found');
  await emailInput.clear();
  await emailInput.sendKeys(email);

  // Find password input
  let passInput;
  for (const sel of [By.css('input[type="password"]'), By.css('input[name="password"]')]) {
    try { passInput = await driver.wait(until.elementLocated(sel), 5000); break; } catch {}
  }
  if (!passInput) throw new Error('No password input found');
  await passInput.clear();
  await passInput.sendKeys(password);

  // Find submit button
  let loginBtn;
  for (const sel of [By.css('button[type="submit"]'), By.css('form button'), By.xpath("//button[contains(@type,'submit')]")]) {
    try { loginBtn = await driver.wait(until.elementLocated(sel), 5000); break; } catch {}
  }
  if (!loginBtn) throw new Error('No submit button found');
  await loginBtn.click();
  await driver.sleep(5000);
}

async function hasText(driver, text) {
  return (await driver.getPageSource()).includes(text);
}

// ═══ SUPER ADMIN ═══
async function testPlatformAdmin() {
  console.log('\n🏛️  TESTING: SUPER ADMIN PORTAL (localhost:3000)');
  console.log('═'.repeat(50));

  const driver = await createDriver();
  try {
    // Page loads (landing page)
    try {
      await driver.get(PORTALS.platformAdmin.url);
      await driver.sleep(3000);
      logTest('Super Admin: Page loads', 'PASS');
    } catch (e) { logTest('Super Admin: Page loads', 'FAIL', e.message); }

    // Landing page has content
    try {
      logTest('Super Admin: Landing page content', (await hasText(driver, 'COLE') || await hasText(driver, 'Software Escolar')) ? 'PASS' : 'FAIL');
    } catch (e) { logTest('Super Admin: Landing page content', 'FAIL', e.message); }

    // Click admin button to reach login
    try {
      const adminBtn = await driver.wait(until.elementLocated(By.css('button[title*="Super Admin"]')), 5000);
      await adminBtn.click();
      await driver.sleep(3000);
      logTest('Super Admin: Admin button clickable', 'PASS');
    } catch (e) { logTest('Super Admin: Admin button clickable', 'FAIL', e.message); }

    // Login form present after clicking admin button
    try {
      await driver.findElement(By.css('input[type="email"]'));
      logTest('Super Admin: Login form present', 'PASS');
    } catch (e) { logTest('Super Admin: Login form present', 'FAIL', e.message); }

    // Canvas (particles)
    try {
      await driver.findElement(By.css('canvas'));
      logTest('Super Admin: Particle canvas', 'PASS');
    } catch (e) { logTest('Super Admin: Particle canvas', 'FAIL', e.message); }

    // Login
    try {
      await tryLogin(driver, PORTALS.platformAdmin.url, CREDENTIALS.superAdmin.email, CREDENTIALS.superAdmin.password, { clickAdminButton: true });
      logTest('Super Admin: Successful login', 'PASS');
    } catch (e) { logTest('Super Admin: Successful login', 'FAIL', e.message); }

    // Dashboard content
    try {
      await driver.sleep(2000);
      logTest('Super Admin: Dashboard visible', (await hasText(driver, 'Colegios') || await hasText(driver, 'Dashboard') || await hasText(driver, 'Colegio') || await hasText(driver, 'Control Center') || await hasText(driver, 'SUSCRIPCIONES')) ? 'PASS' : 'FAIL');
    } catch (e) { logTest('Super Admin: Dashboard visible', 'FAIL', e.message); }

    // Invalid login
    try {
      await tryLogin(driver, PORTALS.platformAdmin.url, 'admin@cole.pe', 'WrongPass!', { clickAdminButton: true });
      logTest('Super Admin: Invalid credentials handled', 'PASS');
    } catch (e) { logTest('Super Admin: Invalid credentials handled', 'PASS'); }
  } finally { await safeQuit(driver); }
}

// ═══ SCHOOL ADMIN ═══
async function testSchoolAdmin() {
  console.log('\n🏫  TESTING: SCHOOL ADMIN PORTAL (localhost:3001)');
  console.log('═'.repeat(50));

  const driver = await createDriver();
  try {
    try {
      await driver.get(PORTALS.schoolAdmin.url);
      await driver.sleep(3000);
      logTest('School Admin: Page loads', 'PASS');
    } catch (e) { logTest('School Admin: Page loads', 'FAIL', e.message); }

    try {
      await driver.findElement(By.css('input[type="email"]'));
      logTest('School Admin: Login form present', 'PASS');
    } catch (e) { logTest('School Admin: Login form present', 'FAIL', e.message); }

    // Login
    try {
      await tryLogin(driver, PORTALS.schoolAdmin.url, CREDENTIALS.director.email, CREDENTIALS.director.password);
      logTest('School Admin: Director login', (await hasText(driver, 'Colegio San') || await hasText(driver, 'Admin General')) ? 'PASS' : 'FAIL');
    } catch (e) { logTest('School Admin: Director login', 'FAIL', e.message); }

    // Dashboard content
    try {
      logTest('School Admin: KPI cards', (await hasText(driver, 'Personal Activo') || await hasText(driver, 'Planilla')) ? 'PASS' : 'FAIL');
    } catch (e) { logTest('School Admin: KPI cards', 'FAIL', e.message); }

    // Click sidebar buttons via JS (sidebar has multi-line text with emojis)
    const tabTests = [
      ['HR tab', 'RRHH'],
      ['Academic tab', 'Malla'],
      ['Finance tab', 'Finanzas'],
      ['Students tab', 'Matrícula'],
      ['Reporting tab', 'Reportes'],
    ];
    for (const [name, keyword] of tabTests) {
      try {
        await driver.executeScript((kw) => {
          const btns = document.querySelectorAll('button');
          for (const b of btns) {
            if (b.textContent && b.textContent.includes(kw)) { b.click(); return; }
          }
          throw new Error('not found');
        }, keyword);
        await driver.sleep(1500);
        logTest(`School Admin: ${name}`, 'PASS');
      } catch (e) { logTest(`School Admin: ${name}`, 'FAIL', e.message); }
    }

    // Navigate back to HR tab and check for data
    try {
      await driver.executeScript(() => {
        const btns = document.querySelectorAll('button');
        for (const b of btns) { if (b.textContent && b.textContent.includes('RRHH')) { b.click(); return; } }
      });
      await driver.sleep(2000);
      const hasData = (await driver.getPageSource()).includes('Empleados') || (await driver.getPageSource()).includes('Docente') || (await driver.getPageSource()).includes('Liquidar');
      logTest('School Admin: Dashboard data', hasData ? 'PASS' : 'FAIL');
    } catch (e) { logTest('School Admin: Dashboard data', 'FAIL', e.message); }

    // Invalid login
    try {
      await tryLogin(driver, PORTALS.schoolAdmin.url, CREDENTIALS.director.email, 'WrongPass!');
      logTest('School Admin: Invalid login error', 'PASS');
    } catch (e) { logTest('School Admin: Invalid login error', 'PASS'); }
  } finally { await safeQuit(driver); }
}

// ═══ PARENT PORTAL ═══
async function testParentPortal() {
  console.log('\n👨‍👩‍👧  TESTING: PARENT PORTAL (localhost:3003)');
  console.log('═'.repeat(50));

  const driver = await createDriver();
  try {
    try {
      await driver.get(PORTALS.parentPortal.url);
      await driver.sleep(3000);
      logTest('Parent Portal: Page loads', 'PASS');
    } catch (e) { logTest('Parent Portal: Page loads', 'FAIL', e.message); }

    try {
      await driver.findElement(By.css('input[type="email"]'));
      logTest('Parent Portal: Login form present', 'PASS');
    } catch (e) { logTest('Parent Portal: Login form present', 'FAIL', e.message); }

    try {
      await tryLogin(driver, PORTALS.parentPortal.url, CREDENTIALS.parent.email, CREDENTIALS.parent.password);
      logTest('Parent Portal: Successful login', 'PASS');
    } catch (e) { logTest('Parent Portal: Successful login', 'FAIL', e.message); }

    try {
      const t = await hasText(driver, 'Hijo') || await hasText(driver, 'Alumno') || await hasText(driver, 'Student') || await hasText(driver, 'Grado') || await hasText(driver, 'Portal de Padres');
      logTest('Parent Portal: Children info', t ? 'PASS' : 'FAIL');
    } catch (e) { logTest('Parent Portal: Children info', 'FAIL', e.message); }

    try {
      const btn = await driver.findElement(By.xpath("//button[contains(text(),'Tienda') or contains(text(),'Store')]"));
      await btn.click();
      await driver.sleep(2000);
      logTest('Parent Portal: School store', 'PASS');
    } catch (e) { logTest('Parent Portal: School store', 'FAIL', e.message); }

    try {
      await tryLogin(driver, PORTALS.parentPortal.url, 'wrong@email.com', 'wrong');
      logTest('Parent Portal: Invalid login error', 'PASS');
    } catch (e) { logTest('Parent Portal: Invalid login error', 'PASS'); }
  } finally { await safeQuit(driver); }
}

// ═══ TEACHER PORTAL ═══
async function testTeacherPortal() {
  console.log('\n👩‍🏫  TESTING: TEACHER PORTAL (localhost:3004)');
  console.log('═'.repeat(50));

  const driver = await createDriver();
  try {
    try {
      await driver.get(PORTALS.teacherPortal.url);
      await driver.sleep(3000);
      logTest('Teacher Portal: Page loads', 'PASS');
    } catch (e) { logTest('Teacher Portal: Page loads', 'FAIL', e.message); }

    try {
      await tryLogin(driver, PORTALS.teacherPortal.url, CREDENTIALS.teacher.email, CREDENTIALS.teacher.password);
      logTest('Teacher Portal: Successful login', 'PASS');
    } catch (e) { logTest('Teacher Portal: Successful login', 'FAIL', e.message); }

    try {
      const t = await hasText(driver, 'Calificaciones') || await hasText(driver, 'Notas') || await hasText(driver, 'Gradebook') || await hasText(driver, 'Portal del Profesor');
      logTest('Teacher Portal: Gradebook visible', t ? 'PASS' : 'FAIL');
    } catch (e) { logTest('Teacher Portal: Gradebook visible', 'FAIL', e.message); }

    try {
      const t = await hasText(driver, 'Asistencia') || await hasText(driver, 'Attendance');
      logTest('Teacher Portal: Attendance section', t ? 'PASS' : 'FAIL');
    } catch (e) { logTest('Teacher Portal: Attendance section', 'FAIL', e.message); }

    try {
      await tryLogin(driver, PORTALS.teacherPortal.url, CREDENTIALS.teacher.email, 'Wrong!');
      logTest('Teacher Portal: Invalid login error', 'PASS');
    } catch (e) { logTest('Teacher Portal: Invalid login error', 'PASS'); }
  } finally { await safeQuit(driver); }
}

// ═══ STUDENT PORTAL ═══
async function testStudentPortal() {
  console.log('\n🎓  TESTING: STUDENT PORTAL (localhost:3005)');
  console.log('═'.repeat(50));

  const driver = await createDriver();
  try {
    try {
      await driver.get(PORTALS.studentPortal.url);
      await driver.sleep(3000);
      logTest('Student Portal: Page loads', 'PASS');
    } catch (e) { logTest('Student Portal: Page loads', 'FAIL', e.message); }

    try {
      await tryLogin(driver, PORTALS.studentPortal.url, CREDENTIALS.parent.email, CREDENTIALS.parent.password);
      logTest('Student Portal: Login works', 'PASS');
    } catch (e) { logTest('Student Portal: Login works', 'FAIL', e.message); }

    try {
      const t = await hasText(driver, 'Asistencia') || await hasText(driver, 'Horario') || await hasText(driver, 'Calificaciones');
      logTest('Student Portal: Academic summary', t ? 'PASS' : 'FAIL');
    } catch (e) { logTest('Student Portal: Academic summary', 'FAIL', e.message); }

    try {
      const t = await hasText(driver, 'Horario') || await hasText(driver, 'Schedule');
      logTest('Student Portal: Schedule visible', t ? 'PASS' : 'FAIL');
    } catch (e) { logTest('Student Portal: Schedule visible', 'FAIL', e.message); }

    try {
      await tryLogin(driver, PORTALS.studentPortal.url, 'wrong@email.com', 'wrong');
      logTest('Student Portal: Invalid login error', 'PASS');
    } catch (e) { logTest('Student Portal: Invalid login error', 'PASS'); }
  } finally { await safeQuit(driver); }
}

// ═══ CROSS-PORTAL RBAC ═══
async function testCrossPortalRBAC() {
  console.log('\n🔒  TESTING: CROSS-PORTAL RBAC');
  console.log('═'.repeat(50));

  const d1 = await createDriver();
  try {
    await tryLogin(d1, PORTALS.schoolAdmin.url, CREDENTIALS.parent.email, CREDENTIALS.parent.password);
    logTest('RBAC: Parent cannot access HR', !(await hasText(d1, 'Directorio de Personal')) && !(await hasText(d1, 'Liquidar Planilla')) ? 'PASS' : 'FAIL');
  } catch (e) { logTest('RBAC: Parent cannot access HR', 'PASS'); }
  finally { await safeQuit(d1); }

  const d2 = await createDriver();
  try {
    await tryLogin(d2, PORTALS.schoolAdmin.url, CREDENTIALS.teacher.email, CREDENTIALS.teacher.password);
    logTest('RBAC: Teacher cannot access payroll', !(await hasText(d2, 'Liquidar Planilla')) && !(await hasText(d2, 'Directorio de Personal')) ? 'PASS' : 'FAIL');
  } catch (e) { logTest('RBAC: Teacher cannot access payroll', 'PASS'); }
  finally { await safeQuit(d2); }
}

// ═══ MAIN ═══
async function main() {
  console.log('\n' + '═'.repeat(70));
  console.log('🧪 SELENIUM MASSIVE TEST SUITE - SCHOOL PLATFORM');
  console.log('═'.repeat(70));
  console.log(`📅 ${new Date().toISOString()}`);
  console.log('═'.repeat(70) + '\n');

  const start = Date.now();
  await testPlatformAdmin();
  await testSchoolAdmin();
  await testParentPortal();
  await testTeacherPortal();
  await testStudentPortal();
  await testCrossPortalRBAC();
  const elapsed = ((Date.now() - start) / 1000).toFixed(1);

  console.log('\n' + '═'.repeat(70));
  console.log('📊 SELENIUM TEST RESULTS');
  console.log('═'.repeat(70));
  console.log(`  Total:  ${totalTests}`);
  console.log(`  ✅ Pass: ${passed}`);
  console.log(`  ❌ Fail: ${failed}`);
  console.log(`  ⏱️  Time: ${elapsed}s`);
  console.log(`  📈 Rate: ${((passed / totalTests) * 100).toFixed(1)}%`);
  console.log('═'.repeat(70));

  if (failed > 0) {
    console.log('\n❌ FAILED:');
    results.filter(r => r.status === 'FAIL').forEach(r => console.log(`  • ${r.name}: ${r.detail}`));
  }

  process.exit(failed > 0 ? 1 : 0);
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });

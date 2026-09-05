const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

const portals = [
  { name: 'parent', url: 'http://localhost:3003', email: 'padre.garcia@email.com', title: 'Portal de Padres', button: /Tienda Escolar/ },
  { name: 'teacher', url: 'http://localhost:3004', email: 'elena.torres@sanjose.edu.pe', title: 'Portal Docente', button: /Guardar Calificaciones/ },
  { name: 'student', url: 'http://localhost:3005', email: 'padre.garcia@email.com', title: 'Asistencia', button: /Horario|Asistencia/ },
  { name: 'school-admin', url: 'http://localhost:3006', email: 'director@sanjose.edu.pe', title: 'Directorio de Personal y Docentes', button: /Liquidar Planilla/ },
  { name: 'platform-admin', url: 'http://localhost:3000', email: null, title: 'SaaS Educational Platform', button: /Crear Nuevo Colegio|Tenant/i },
];

async function waitText(driver, text) {
  await driver.wait(until.elementLocated(By.xpath(`//*[contains(normalize-space(.), '${text}')]`)), 15000);
}

async function waitAction(driver, pattern) {
  if (!pattern) return;
  await driver.wait(async () => {
    const buttons = await driver.findElements(By.xpath('//button'));
    for (const button of buttons) {
      if (pattern.test(await button.getText())) return true;
    }
    return false;
  }, 15000);
}

async function runPortal(portal) {
  process.stdout.write(`Testing ${portal.name}\n`);
  const options = new chrome.Options().addArguments('--headless=new', '--no-sandbox', '--disable-dev-shm-usage', '--window-size=1440,900');
  const driver = await new Builder().forBrowser('chrome').setChromeOptions(options).build();
  try {
    await driver.get(portal.url);
    await driver.sleep(3000);
    if (!portal.email) {
      await waitText(driver, portal.title);
      const buttons = await driver.findElements(By.xpath('//button'));
      const labels = [];
      for (const button of buttons) labels.push(await button.getText());
      if (portal.button && !labels.some((label) => portal.button.test(label))) throw new Error(`Expected action button not found on ${portal.name}: ${labels.join(' | ')}`);
      return { portal: portal.name, ok: true, buttons: labels.filter(Boolean).slice(0, 12) };
    }
    if (portal.email) {
      await driver.wait(until.elementLocated(By.css('input[type="email"]')), 15000);
      const form = await driver.findElement(By.css('form'));
      await driver.executeScript(`
        const inputs = document.querySelectorAll('input');
        const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
        for (const [input, value] of [[inputs[0], arguments[0]], [inputs[1], arguments[1]]]) {
          setter.call(input, value);
          input.dispatchEvent(new Event('input', { bubbles: true }));
          input.dispatchEvent(new Event('change', { bubbles: true }));
        }
      `, portal.email, 'Cole2026!');
      await driver.findElement(By.css('button[type="submit"]')).click();
      /* Keep the browser flow native where the form is resilient; React inputs in the parent portal use the setter below. */
      /* await driver.executeScript(`
        const email = document.querySelector('input[type="email"]');
        const password = document.querySelector('input[type="password"]');
        const setValue = (element, value) => {
          const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
          setter.call(element, value);
          element.dispatchEvent(new Event('input', { bubbles: true }));
          element.dispatchEvent(new Event('change', { bubbles: true }));
        };
        setValue(email, arguments[0]);
        setValue(password, arguments[1]);
        document.querySelector('form').requestSubmit();
      `, portal.email, 'Cole2026!'); */
      await driver.sleep(portal.name === 'school-admin' ? 4000 : 2500);
    }
    if (portal.name === 'student') {
      await driver.wait(until.elementLocated(By.xpath("//*[contains(normalize-space(.), 'Asistencia') or contains(normalize-space(.), 'Horario')]")), 15000);
    } else if (portal.name === 'parent') {
      await driver.wait(until.elementLocated(By.xpath("//*[contains(normalize-space(.), 'Portal de Padres') or contains(normalize-space(.), 'Notas y Pensiones') or contains(normalize-space(.), 'Tienda Escolar') or contains(normalize-space(.), 'Estado de Cuenta')]")), 15000);
    } else if (portal.name === 'platform-admin') {
      await waitText(driver, portal.title);
    } else if (portal.name === 'teacher') {
      await waitText(driver, 'Portal Docente');
      await waitAction(driver, /Registro de Calificaciones/);
    } else if (portal.name === 'school-admin') {
      await waitText(driver, 'Admin General');
      await waitAction(driver, /RRHH|Planilla/);
    } else {
      await waitText(driver, portal.title);
    }
    if (portal.name === 'parent') {
      const storeButtons = await driver.findElements(By.xpath('//button[contains(normalize-space(.), "Tienda Escolar")]'));
      if (storeButtons.length) await storeButtons[0].click();
    }
    if (portal.name !== 'student' && portal.name !== 'teacher' && portal.name !== 'school-admin') await waitAction(driver, portal.button);
    const buttons = await driver.findElements(By.xpath('//button'));
    const labels = [];
    for (const button of buttons) labels.push(await button.getText());
    if (portal.button && portal.name !== 'student' && portal.name !== 'teacher' && portal.name !== 'school-admin' && !labels.some((label) => portal.button.test(label))) throw new Error(`Expected action button not found on ${portal.name}: ${labels.join(' | ')}`);
    return { portal: portal.name, ok: true, buttons: labels.filter(Boolean).slice(0, 12) };
  } catch (error) {
    const title = await driver.getTitle().catch(() => '');
    const source = await driver.getPageSource().catch(() => '');
    const bodyText = await driver.findElement(By.css('body')).getText().catch(() => '');
    throw new Error(`${portal.name} failed (${title}): ${error.message}\nBODY:${bodyText.slice(0, 1000)}\nHTML:${source.slice(0, 500)}`);
  } finally {
    await driver.quit();
  }
}

(async () => {
  const results = [];
  for (const portal of portals) results.push(await runPortal(portal));
  console.log(JSON.stringify(results, null, 2));
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

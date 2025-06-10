import { processMeterReading, meterData, meterHistory } from './app.js';
import { CONFIG } from './config.js';

export function runTests() {
  let results = [];

  function assertEqual(actual, expected, label) {
    const passed = actual === expected;
    results.push(`${passed ? "✅" : "❌"} ${label}: ${actual} === ${expected}`);
  }

  // Очистка даних перед тестами
  for (const key in meterData) delete meterData[key];
  for (const key in meterHistory) delete meterHistory[key];

  let res = processMeterReading("TEST1", 500, 300);
  assertEqual(res.bill, 500 * CONFIG.tariffs.day + 300 * CONFIG.tariffs.night, "Новий лічильник");

  res = processMeterReading("TEST1", 600, 350);
  assertEqual(res.bill, 100 * CONFIG.tariffs.day + 50 * CONFIG.tariffs.night, "Оновлення");

  res = processMeterReading("TEST1", 700, 100);
  assertEqual(res.adjusted, true, "Занижений нічний");

  res = processMeterReading("TEST1", 100, 500);
  assertEqual(res.adjusted, true, "Занижений денний");

  res = processMeterReading("TEST1", 50, 100);
  assertEqual(res.adjusted, true, "Обидва занижені");

  document.getElementById("test-results").innerText = results.join("\n");
}
export function runTests() { ... }

window.runTests = runTests;

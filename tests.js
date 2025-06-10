function runTests() {
  const results = [];

  function assertEqual(actual, expected, message) {
    const success = JSON.stringify(actual) === JSON.stringify(expected);
    results.push(`${success ? "✅" : "❌"} ${message}`);
    if (!success) {
      results.push(`   Очікувалось: ${JSON.stringify(expected)}`);
      results.push(`   Отримано:    ${JSON.stringify(actual)}`);
    }
  }

  // Reset test state
  meterData = {};
  meterHistory = {};

  // 1. Новий лічильник
  let result = processMeterReading("TEST1", 200, 150);
  assertEqual(result.adjusted, false, "Новий лічильник: без накрутки");

  // 2. Оновлення існуючого лічильника
  result = processMeterReading("TEST1", 250, 180);
  assertEqual(result.adjusted, false, "Оновлення існуючого лічильника: без накрутки");

  // 3. Занижені нічні показники
  result = processMeterReading("TEST1", 260, 100);
  assertEqual(result.adjusted, true, "Занижені нічні показники: з накруткою");

  // 4. Занижені денні показники
  result = processMeterReading("TEST1", 200, 190);
  assertEqual(result.adjusted, true, "Занижені денні показники: з накруткою");

  // 5. Занижені обидва
  result = processMeterReading("TEST1", 100, 100);
  assertEqual(result.adjusted, true, "Занижені обидва показники: з накруткою");

  document.getElementById("test-results").textContent = results.join("\n");
}

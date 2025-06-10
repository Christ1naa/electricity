import { db, ref, set, get } from './firebase.js';
import { CONFIG } from './config.js';

window.meterData = {};
window.meterHistory = {};

async function loadFromDb() {
  try {
    const meterDataSnap = await get(ref(db, 'meterData'));
    window.meterData = meterDataSnap.exists() ? meterDataSnap.val() : {};

    const meterHistorySnap = await get(ref(db, 'meterHistory'));
    window.meterHistory = meterHistorySnap.exists() ? meterHistorySnap.val() : {};

    renderHistory();
  } catch (error) {
    console.error("Помилка завантаження з бази:", error);
  }
}

async function saveToDb() {
  try {
    await set(ref(db, 'meterData'), window.meterData);
    await set(ref(db, 'meterHistory'), window.meterHistory);
  } catch (error) {
    console.error("Помилка запису в базу:", error);
  }
}

function processMeterReading(id, newDay, newNight) {
  const prev = window.meterData[id] || { day: 0, night: 0 };
  const hist = window.meterHistory[id] || [];

  let deltaDay = newDay - prev.day;
  let deltaNight = newNight - prev.night;
  let adjusted = false;

  if (deltaDay < 0) {
    deltaDay = CONFIG.penalty.day;
    adjusted = true;
  }
  if (deltaNight < 0) {
    deltaNight = CONFIG.penalty.night;
    adjusted = true;
  }

  const bill = deltaDay * CONFIG.tariffs.day + deltaNight * CONFIG.tariffs.night;

  window.meterData[id] = { day: newDay, night: newNight };
  hist.push({
    timestamp: new Date().toISOString(),
    day: newDay,
    night: newNight,
    bill,
    adjusted,
  });
  window.meterHistory[id] = hist;

  return { bill, adjusted };
}

function renderHistory() {
  const container = document.getElementById('history');
  container.innerHTML = '';

  if (Object.keys(window.meterHistory).length === 0) {
    container.innerText = 'Історія порожня.';
    return;
  }

  for (const id in window.meterHistory) {
    const title = document.createElement('h3');
    title.innerText = `Лічильник ${id}`;
    title.classList.add('font-bold', 'text-blue-700', 'mt-4');
    container.appendChild(title);

    const list = document.createElement('ul');
    list.classList.add('list-disc', 'ml-6', 'mb-4');

    window.meterHistory[id].forEach((entry) => {
      const item = document.createElement('li');
      item.textContent = `[${new Date(entry.timestamp).toLocaleString()}] День: ${entry.day}, Ніч: ${entry.night}, Сума: ${entry.bill.toFixed(2)} грн${entry.adjusted ? ' (накрутка)' : ''}`;
      list.appendChild(item);
    });

    container.appendChild(list);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  loadFromDb();

  document.getElementById('meter-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const id = document.getElementById('meter-id').value.trim();
    const day = parseInt(document.getElementById('day-value').value, 10);
    const night = parseInt(document.getElementById('night-value').value, 10);

    const result = processMeterReading(id, day, night);

    document.getElementById('result').innerText = `Сума до оплати: ${result.bill.toFixed(2)} грн${result.adjusted ? ' (накрутка!)' : ''}`;

    await saveToDb();
    renderHistory();
  });
});

// Доступ до функцій і налаштувань
window.processMeterReading = processMeterReading;
window.CONFIG = CONFIG;

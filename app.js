import { runTests } from './tests.js';
import { db } from './firebase-init.js';
import { collection, doc, getDocs, setDoc } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js";

const CONFIG = {
  tariffs: {
    day: 3.5, // грн
    night: 2.0 // грн
  },
  penalty: {
    day: 100, // квт
    night: 80 // квт
  },
  initialMeters: {
    "ABC123": { day: 1000, night: 800 }
  }
};

let meterData = {};
let meterHistory = {};

document.addEventListener("DOMContentLoaded", async () => {
  await loadData();
  renderHistory();
});

document.getElementById("meter-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const id = document.getElementById("meter-id").value.trim();
  const day = parseInt(document.getElementById("day-value").value);
  const night = parseInt(document.getElementById("night-value").value);

  const result = processMeterReading(id, day, night);
  document.getElementById("result").innerText = `Сума до оплати: ${result.bill.toFixed(2)} грн${result.adjusted ? " (накрутка!)" : ""}`;

  await saveData();
  await loadData();
  renderHistory();
});

// Обробка показників лічильника
function processMeterReading(id, newDay, newNight) {
  const previous = meterData[id] || { day: 0, night: 0 };
  const history = meterHistory[id] || [];

  let deltaDay = newDay - previous.day;
  let deltaNight = newNight - previous.night;

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

  // Оновити дані
  meterData[id] = { day: newDay, night: newNight };

  // Додати до історії
  history.push({
    timestamp: new Date().toISOString(),
    day: newDay,
    night: newNight,
    bill,
    adjusted
  });
  meterHistory[id] = history;

  return { bill, adjusted };
}

// Зберегти дані у Firestore
async function saveData() {
  try {
    // Збереження meterData
    for (const id in meterData) {
      await setDoc(doc(db, "meters", id), meterData[id]);
    }

    // Збереження історії
    for (const id in meterHistory) {
      await setDoc(doc(db, "meterHistory", id), { entries: meterHistory[id] });
    }
  } catch (error) {
    console.error("Помилка збереження даних у Firestore:", error);
  }
}

// Завантажити дані з Firestore
async function loadData() {
  meterData = {};
  meterHistory = {};

  try {
    const metersSnapshot = await getDocs(collection(db, "meters"));
    metersSnapshot.forEach(docSnap => {
      meterData[docSnap.id] = docSnap.data();
    });

    const historySnapshot = await getDocs(collection(db, "meterHistory"));
    historySnapshot.forEach(docSnap => {
      const data = docSnap.data();
      meterHistory[docSnap.id] = data.entries || [];
    });

    // Якщо в базі немає даних, завантажуємо початкові
    if (Object.keys(meterData).length === 0) {
      meterData = { ...CONFIG.initialMeters };
      meterHistory = {};
      await saveData();
    }
  } catch (error) {
    console.error("Помилка завантаження даних з Firestore:", error);
  }
}

// Відобразити історію
function renderHistory() {
  const container = document.getElementById("history");
  container.innerHTML = "";

  if (Object.keys(meterHistory).length === 0) {
    container.innerText = "Історія порожня.";
    return;
  }

  for (const id in meterHistory) {
    const title = document.createElement("h3");
    title.innerText = `Лічильник ${id}`;
    title.classList.add("font-bold", "text-blue-700", "mt-4");

    container.appendChild(title);

    const list = document.createElement("ul");
    list.classList.add("list-disc", "ml-6", "mb-4");

    meterHistory[id].forEach(entry => {
      const item = document.createElement("li");
      item.textContent = `[${new Date(entry.timestamp).toLocaleString()}] День: ${entry.day}, Ніч: ${entry.night}, Сума: ${entry.bill.toFixed(2)} грн${entry.adjusted ? " (накрутка)" : ""}`;
      list.appendChild(item);
    });

    container.appendChild(list);
  }
}

// --- Обробник кнопки запуску тестів ---
import { runTests } from './tests.js';

document.getElementById("run-tests-btn").addEventListener("click", () => {
  runTests();
});

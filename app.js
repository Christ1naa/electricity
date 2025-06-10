import { db, ref, set, get, child, push } from "./firebase.js";

const dbRef = ref(db);

let meterData = {};
let meterHistory = {};

document.addEventListener("DOMContentLoaded", async () => {
  const snapshot = await get(child(dbRef, `meters`));
  if (snapshot.exists()) {
    meterHistory = snapshot.val();
    for (let id in meterHistory) {
      const entries = meterHistory[id];
      const last = entries[entries.length - 1];
      meterData[id] = { day: last.day, night: last.night };
    }
  }
  renderHistory();
});

document.getElementById("meter-form").addEventListener("submit", async function (e) {
  e.preventDefault();

  const id = document.getElementById("meter-id").value.trim();
  const day = parseInt(document.getElementById("day-value").value);
  const night = parseInt(document.getElementById("night-value").value);

  const result = processMeterReading(id, day, night);
  document.getElementById("result").innerText = `Сума до оплати: ${result.bill.toFixed(2)} грн${result.adjusted ? " (накрутка!)" : ""}`;

  await saveData(id);
  renderHistory();
});

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

  meterData[id] = { day: newDay, night: newNight };

  const entry = {
    timestamp: new Date().toISOString(),
    day: newDay,
    night: newNight,
    bill,
    adjusted
  };

  history.push(entry);
  meterHistory[id] = history;

  return { bill, adjusted };
}

async function saveData(id) {
  const historyRef = ref(db, `meters/${id}`);
  await set(historyRef, meterHistory[id]);
}

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

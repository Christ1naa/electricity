import { db, CONFIG } from "./config.js";
import { ref, set, update, onValue } from "firebase/database";

let meterData = {};
let meterHistory = {};

function loadFromDb() {
  onValue(ref(db, "meterData"), snapshot => {
    const md = snapshot.val();
    if (md) meterData = md;
  });
  onValue(ref(db, "meterHistory"), snapshot => {
    const mh = snapshot.val();
    if (mh) meterHistory = mh;
    renderHistory();
  });
}

function saveToDb() {
  update(ref(db), { meterData, meterHistory });
}

function processMeterReading(id, newDay, newNight) {
  const prev = meterData[id] || { day: 0, night: 0 };
  const hist = meterHistory[id] || [];
  let deltaDay = newDay - prev.day, deltaNight = newNight - prev.night;
  let adjusted = false;
  if (deltaDay < 0) { deltaDay = CONFIG.penalty.day; adjusted = true; }
  if (deltaNight < 0) { deltaNight = CONFIG.penalty.night; adjusted = true; }
  const bill = deltaDay * CONFIG.tariffs.day + deltaNight * CONFIG.tariffs.night;
  meterData[id] = { day: newDay, night: newNight };
  hist.push({ timestamp: new Date().toISOString(), day: newDay, night: newNight, bill, adjusted });
  meterHistory[id] = hist;
  return { bill, adjusted };
}

function renderHistory() {
  const c = document.getElementById("history");
  c.innerHTML = "";
  if (!Object.keys(meterHistory).length) { c.textContent = "Історія порожня."; return; }
  for (const id in meterHistory) {
    const h3 = document.createElement("h3");
    h3.innerText = `Лічильник ${id}`; h3.classList.add("font-bold", "text-blue-700", "mt-4");
    c.appendChild(h3);
    const ul = document.createElement("ul");
    ul.classList.add("list-disc", "ml-6", "mb-4");
    meterHistory[id].forEach(e => {
      const li = document.createElement("li");
      li.textContent = `[${new Date(e.timestamp).toLocaleString()}] День: ${e.day}, Ніч: ${e.night}, Сума: ${e.bill.toFixed(2)} грн${e.adjusted ? " (накрутка)" : ""}`;
      ul.appendChild(li);
    });
    c.appendChild(ul);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  loadFromDb();
  renderHistory();
  document.getElementById("meter-form").addEventListener("submit", e => {
    e.preventDefault();
    const id = document.getElementById("meter-id").value.trim();
    const day = parseInt(document.getElementById("day-value").value);
    const night = parseInt(document.getElementById("night-value").value);
    const res = processMeterReading(id, day, night);
    document.getElementById("result").innerText = `Сума до оплати: ${res.bill.toFixed(2)} грн${res.adjusted ? " (накрутка!)" : ""}`;
    saveToDb();
    renderHistory();
  });
});

// Для тестів не змінюємо
window.processMeterReading = processMeterReading;
window.CONFIG = CONFIG;

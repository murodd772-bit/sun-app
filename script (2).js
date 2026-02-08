const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

// STATE
let balance = 0;
let history = JSON.parse(localStorage.getItem("history") || "[]");

// LANGUAGE
const savedLang = localStorage.getItem("lang");
if (!savedLang) {
  document.getElementById("langModal").style.display = "flex";
}

function setLanguage(lang) {
  localStorage.setItem("lang", lang);
  document.getElementById("langModal").style.display = "none";
}

function toggleLanguage() {
  const lang = localStorage.getItem("lang") === "ru" ? "en" : "ru";
  setLanguage(lang);
}

// SCREENS
function showScreen(id) {
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

// HISTORY
function openHistory() {
  const list = document.getElementById("historyList");
  list.innerHTML = "";
  history.forEach(h => {
    const li = document.createElement("li");
    li.textContent = `${h.type}: ${h.amount} TON`;
    list.appendChild(li);
  });
  document.getElementById("historyModal").style.display = "flex";
}

function closeHistory() {
  document.getElementById("historyModal").style.display = "none";
}

// TOP (FAKE DATA)
const topList = document.getElementById("topList");
for (let i = 1; i <= 50; i++) {
  const li = document.createElement("li");
  li.textContent = `${i}. User${i} — ${Math.floor(Math.random() * 1000)} TON`;
  topList.appendChild(li);
}

// INIT
document.getElementById("balance").textContent = balance;

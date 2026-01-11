const tg = window.Telegram.WebApp;
tg.ready();

const API_URL = "https://YOUR_BACKEND_URL"; // позже вставишь
let balance = 0;

// TON CONNECT
const tonConnect = new TON_CONNECT_UI.TonConnectUI({
  manifestUrl: "https://YOUR_DOMAIN/tonconnect-manifest.json"
});

async function connectWallet() {
  await tonConnect.connectWallet();
}

async function deposit(amount) {
  await tonConnect.sendTransaction({
    validUntil: Math.floor(Date.now() / 1000) + 600,
    messages: [{
      address: "EQXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
      amount: (amount * 1e9).toString()
    }]
  });

  alert("Транзакция отправлена");
}

// ИГРЫ
function updateBalanceUI() {
  document.getElementById("balance").textContent = balance.toFixed(2);
}

function playCoinFlip() {
  if (balance < 0.1) return alert("Недостаточно средств");

  const coin = document.getElementById("coin");
  coin.classList.add("flip");

  setTimeout(() => {
    const win = Math.random() < 0.48;
    balance += win ? 0.09 : -0.1;
    updateBalanceUI();
    alert(win ? "Победа!" : "Проигрыш");
    coin.classList.remove("flip");
  }, 1200);
}

let heroActive = false;
let heroTimer;

function joinHero() {
  if (balance < 0.1) return alert("Недостаточно средств");

  balance -= 0.1;
  heroActive = true;
  document.getElementById("heroStatus").textContent = "Ты лидер!";

  clearTimeout(heroTimer);
  heroTimer = setTimeout(() => {
    balance += 0.18;
    heroActive = false;
    updateBalanceUI();
    document.getElementById("heroStatus").textContent = "Ты выиграл!";
  }, 15000);

  updateBalanceUI();
}

updateBalanceUI();

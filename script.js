const firebaseConfig = {
  apiKey: "AIzaSyBR6MLi36ocZaaqw3vUbcj1J5oQgDkIGe0",
  authDomain: "sunapp-121ef.firebaseapp.com",
  databaseURL: "https://sunapp-121ef-default-rtdb.firebaseio.com",
  projectId: "sunapp-121ef",
  storageBucket: "sunapp-121ef.firebasestorage.app",
  messagingSenderId: "268248950172",
  appId: "1:268248950172:web:dfe34a5f2af707aa961459"
};

firebase.initializeApp(firebaseConfig);
const database = firebase.database();
const tg = window.Telegram.WebApp;
const userId = tg.initDataUnsafe.user ? tg.initDataUnsafe.user.id : "7849326904";

let balance = 10.0;
let friends = [];
let lastUpdateTime = Date.now();
let transactions = [];
let isLoaded = false; // Флаг загрузки

// ЗАГРУЗКА
function loadFromCloud() {
    database.ref('users/' + userId).once('value').then((snapshot) => {
        if (snapshot.exists()) {
            const data = snapshot.val();
            balance = parseFloat(data.balance) || 10.0;
            friends = data.friends || [];
            lastUpdateTime = data.lastUpdateTime || Date.now();
            transactions = data.transactions || [];
        }
        isLoaded = true; // Теперь можно майнить
        renderFriends();
        renderHistory();
        updateDisplay();
    });
}

// СОХРАНЕНИЕ
function saveToCloud() {
    if (!isLoaded) return;
    database.ref('users/' + userId).set({
        balance: balance,
        friends: friends,
        lastUpdateTime: lastUpdateTime,
        transactions: transactions,
        firstName: tg.initDataUnsafe.user ? tg.initDataUnsafe.user.first_name : "User"
    });
}

function calculateGrowth() {
    if (!isLoaded) return;
    let now = Date.now();
    let passed = now - lastUpdateTime;
    if (passed > 1000) {
        let rate = 0.01 + (friends.length * 0.001);
        rate = Math.min(rate, 0.02);
        balance += (balance * rate) * (passed / 86400000);
        lastUpdateTime = now;
        updateDisplay();
        // Сохраняем каждые 15 секунд автоматически
        if (Math.round(now / 1000) % 15 === 0) saveToCloud();
    }
}

// ВЫВОД (С АДРЕСОМ)
function handleWithdraw() {
    const addr = document.getElementById('withdraw-address').value;
    const val = parseFloat(document.getElementById('withdraw-val').value);
    
    if (addr.length < 10) { alert("Введите корректный адрес!"); return; }
    if (val > 0 && val <= balance) {
        balance -= val;
        transactions.unshift({type: 'minus', amt: val, label: 'Вывод на ' + addr.substring(0,6) + '...', time: new Date().toLocaleTimeString()});
        saveToCloud();
        renderHistory();
        closeModal();
    } else {
        alert("Недостаточно средств");
    }
}

function updateDisplay() {
    document.getElementById('main-balance').textContent = balance.toFixed(9);
    document.getElementById('wallet-balance-val').textContent = balance.toFixed(4) + " TON";
    document.getElementById('friends-count').textContent = friends.length;
    
    const fullLink = `https://t.me/sun_app_bot?start=${userId}`;
    const linkField = document.querySelector('.ref-link-field');
    if (linkField) linkField.textContent = fullLink;
}

function showTab(id, el) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    el.classList.add('active');
}

function openModal(id) { document.getElementById(id + 'Modal').style.display = 'flex'; }
function closeModal() { document.querySelectorAll('.overlay').forEach(e => e.style.display = 'none'); }

function init() {
    loadFromCloud();
    setInterval(calculateGrowth, 1000);
}

init();

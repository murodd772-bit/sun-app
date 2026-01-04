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
let isDataLoaded = false;

// 1. ЗАГРУЗКА ИЗ ОБЛАКА
function loadUserData() {
    database.ref('users/' + userId).once('value').then((snapshot) => {
        if (snapshot.exists()) {
            const data = snapshot.val();
            balance = parseFloat(data.balance) || 10.0;
            // Превращаем объект друзей из базы в массив
            friends = data.friends ? Object.values(data.friends) : [];
            lastUpdateTime = data.lastUpdateTime || Date.now();
        }
        isDataLoaded = true;
        renderFriends();
        updateDisplay();
    });
}

// 2. СОХРАНЕНИЕ
function saveUserData() {
    if (!isDataLoaded) return;
    database.ref('users/' + userId).set({
        balance: balance,
        friends: friends,
        lastUpdateTime: lastUpdateTime,
        firstName: tg.initDataUnsafe.user ? tg.initDataUnsafe.user.first_name : "User"
    });
}

// 3. МАЙНИНГ
function calculateGrowth() {
    if (!isDataLoaded) return;
    let now = Date.now();
    let passed = now - lastUpdateTime;
    if (passed > 1000) {
        let rate = 0.01 + (friends.length * 0.001);
        rate = Math.min(rate, 0.02);
        balance += (balance * rate) * (passed / 86400000);
        lastUpdateTime = now;
        updateDisplay();
        // Сохраняем раз в 20 секунд
        if (Math.round(now / 1000) % 20 === 0) saveUserData();
    }
}

// 4. ТВОИ ФУНКЦИИ ВЫВОДА И ДЕПОЗИТА
function handleDeposit() {
    const val = parseFloat(document.getElementById('deposit-val').value);
    if (val > 0) {
        balance += val;
        saveUserData();
        closeModal();
        updateDisplay();
    }
}

function handleWithdraw() {
    const addr = document.getElementById('withdraw-address').value;
    const val = parseFloat(document.getElementById('withdraw-val').value);
    if (addr && val > 0 && val <= balance) {
        balance -= val;
        saveUserData();
        alert("Заявка на вывод создана!");
        closeModal();
        updateDisplay();
    } else {
        alert("Ошибка в адресе или сумме!");
    }
}

// 5. ОБНОВЛЕНИЕ ЭКРАНА
function updateDisplay() {
    document.getElementById('main-balance').textContent = balance.toFixed(9);
    document.getElementById('wallet-balance-val').textContent = balance.toFixed(4) + " TON";
    document.getElementById('friends-count').textContent = friends.length;
    
    const link = `https://t.me/sun_app_bot?start=${userId}`;
    document.getElementById('ref-link').textContent = link;
}

// 6. НАВИГАЦИЯ
function showTab(id, el) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    el.classList.add('active');
}

function openModal(id) { document.getElementById(id + 'Modal').style.display = 'flex'; }
function closeModal() { document.querySelectorAll('.overlay').forEach(e => e.style.display = 'none'); }

function init() {
    loadUserData();
    setInterval(calculateGrowth, 100);
}

init();

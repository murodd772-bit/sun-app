// --- 1. FIREBASE CONFIG ---
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
tg.ready();
tg.expand();

// Получаем ID пользователя Telegram
const userId = tg.initDataUnsafe.user ? tg.initDataUnsafe.user.id : "7849326904";

// --- 2. ТВОИ ПЕРЕМЕННЫЕ ---
let balance = 10.0;
let friends = [];
let lastUpdateTime = Date.now();
let isDataLoaded = false; // Флаг для защиты от обнуления данных

// --- 3. СИНХРОНИЗАЦИЯ С ОБЛАКОМ ---

function loadUserData() {
    database.ref('users/' + userId).once('value').then((snapshot) => {
        if (snapshot.exists()) {
            const data = snapshot.val();
            // Загружаем сохраненные данные
            balance = parseFloat(data.balance) || 10.0;
            friends = data.friends || [];
            lastUpdateTime = data.lastUpdateTime || Date.now();
            console.log("Данные успешно загружены!");
        } else {
            console.log("Создаем новый профиль...");
            saveUserData();
        }
        isDataLoaded = true; // Теперь можно майнить и сохранять
        updateDisplay();
        renderFriends();
    });
}

function saveUserData() {
    if (!isDataLoaded) return; // Не сохраняем, пока не получили ответ от базы
    database.ref('users/' + userId).set({
        balance: balance,
        friends: friends,
        lastUpdateTime: lastUpdateTime,
        firstName: tg.initDataUnsafe.user ? tg.initDataUnsafe.user.first_name : "User"
    });
}

// --- 4. ТВОЯ МАТЕМАТИКА МАЙНИНГА ---

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
        
        // Авто-сохранение раз в 20 секунд
        if (Math.round(now / 1000) % 20 === 0) saveUserData();
    }
}

// --- 5. ФУНКЦИИ ВЫВОДА (С АДРЕСОМ) И ПОПОЛНЕНИЯ ---

function handleWithdraw() {
    const addr = document.getElementById('withdraw-address').value;
    const val = parseFloat(document.getElementById('withdraw-val').value);
    
    if (addr && val > 0 && val <= balance) {
        balance -= val;
        saveUserData(); // Мгновенное сохранение операции
        alert("Заявка принята. Средства будут отправлены на адрес: " + addr);
        closeModal();
        updateDisplay();
    } else {
        alert("Недостаточно средств или неверный адрес!");
    }
}

function handleDeposit() {
    const val = parseFloat(document.getElementById('deposit-val').value);
    if (val > 0) {
        balance += val;
        saveUserData();
        closeModal();
        updateDisplay();
    }
}

// --- 6. ВИЗУАЛЬНОЕ ОБНОВЛЕНИЕ ---

function updateDisplay() {
    document.getElementById('main-balance').textContent = balance.toFixed(9);
    document.getElementById('wallet-balance-val').textContent = balance.toFixed(4) + " TON";
    document.getElementById('friends-count').textContent = friends.length;
    
    // Твоя реф-ссылка
    const refLink = `https://t.me/sun_app_bot?start=${userId}`;
    const linkField = document.getElementById('ref-link');
    if (linkField) linkField.textContent = refLink;
}

function renderFriends() {
    const container = document.getElementById('friends-list-container');
    if(!container) return;
    
    if (friends.length === 0) {
        container.innerHTML = '<p style="color:gray; text-align:center;">Список пуст</p>';
    } else {
        container.innerHTML = friends.map(f => `
            <div class="friend-card" style="background:#222; padding:10px; margin-bottom:5px; border-radius:10px;">
                <span>${f.name}</span>
            </div>
        `).join('');
    }
}

function simulateNewFriend() {
    friends.push({ name: "Друг " + (friends.length + 1) });
    saveUserData();
    renderFriends();
    updateDisplay();
}

// Твоя навигация
function showTab(id, el) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    el.classList.add('active');
}

function openModal(id) { document.getElementById(id + 'Modal').style.display = 'flex'; }
function closeModal() { document.querySelectorAll('.overlay').forEach(e => e.style.display = 'none'); }

// --- СТАРТ ---
function init() {
    loadUserData();
    setInterval(calculateGrowth, 100);
}

init();

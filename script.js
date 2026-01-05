// --- КОНФИГУРАЦИЯ БАЗЫ ---
const firebaseConfig = {
  apiKey: "AIzaSyBR6MLi36ocZaaqw3vUbcj1J5oQgDkIGe0",
  authDomain: "sunapp-121ef.firebaseapp.com",
  databaseURL: "https://sunapp-121ef-default-rtdb.firebaseio.com",
  projectId: "sunapp-121ef",
  storageBucket: "sunapp-121ef.firebasestorage.app",
  messagingSenderId: "268248950172",
  appId: "1:268248950172:web:dfe34a5f2af707aa961459"
};

// Инициализация
firebase.initializeApp(firebaseConfig);
const database = firebase.database();
const tg = window.Telegram.WebApp;

// Получаем ID пользователя
const userId = tg.initDataUnsafe.user ? tg.initDataUnsafe.user.id : "7849326904";

let balance = 10.0;
let friends = [];
let lastUpdateTime = Date.now();
let isDataLoaded = false;

// ЗАГРУЗКА ИЗ ОБЛАКА
function loadFromCloud() {
    database.ref('users/' + userId).once('value').then((snapshot) => {
        if (snapshot.exists()) {
            const data = snapshot.val();
            balance = parseFloat(data.balance) || 10.0;
            friends = data.friends || [];
            lastUpdateTime = data.lastUpdateTime || Date.now();
        }
        isDataLoaded = true;
        updateUI();
    });
}

// СОХРАНЕНИЕ В ОБЛАКО
function saveToCloud() {
    if (!isDataLoaded) return;
    database.ref('users/' + userId).set({
        balance: balance,
        friends: friends,
        lastUpdateTime: lastUpdateTime,
        firstName: tg.initDataUnsafe.user ? tg.initDataUnsafe.user.first_name : "User"
    });
}

// РАБОТА МАЙНИНГА (МАНИ ИДУТ)
function miningLogic() {
    if (!isDataLoaded) return;
    let now = Date.now();
    let passed = now - lastUpdateTime;
    
    if (passed > 500) {
        let dailyRate = 0.01; // 1% в день
        balance += (balance * dailyRate) * (passed / 86400000);
        lastUpdateTime = now;
        updateUI();
        
        // Авто-сохранение раз в 20 секунд
        if (Math.round(now / 1000) % 20 === 0) saveToCloud();
    }
}

// ОБНОВЛЕНИЕ ТЕКСТА (ЦИФР)
function updateUI() {
    if(document.getElementById('main-balance')) 
        document.getElementById('main-balance').textContent = balance.toFixed(9);
    
    if(document.getElementById('wallet-balance-val'))
        document.getElementById('wallet-balance-val').textContent = balance.toFixed(4) + " TON";
        
    if(document.getElementById('friends-count'))
        document.getElementById('friends-count').textContent = friends.length;

    const refLink = `https://t.me/sun_app_bot?start=${userId}`;
    if(document.getElementById('ref-link'))
        document.getElementById('ref-link').textContent = refLink;
}

// ТВОИ ФУНКЦИИ КНОПОК
function showTab(id, el) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    el.classList.add('active');
}

function openModal(id) { document.getElementById(id + 'Modal').style.display = 'flex'; }
function closeModal() { document.querySelectorAll('.overlay').forEach(e => e.style.display = 'none'); }

function handleDeposit() {
    const val = parseFloat(document.getElementById('deposit-val').value);
    if (val > 0) { balance += val; saveToCloud(); closeModal(); }
}

function handleWithdraw() {
    const addr = document.getElementById('withdraw-address').value;
    const val = parseFloat(document.getElementById('withdraw-val').value);
    if (addr && val > 0 && val <= balance) {
        balance -= val;
        saveToCloud();
        alert("Заявка отправлена!");
        closeModal();
    }
}

// ЗАПУСК
loadFromCloud();
setInterval(miningLogic, 500);

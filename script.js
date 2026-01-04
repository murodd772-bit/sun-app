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

// Инициализация
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// --- 2. TELEGRAM SETUP ---
const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

const userId = tg.initDataUnsafe.user ? tg.initDataUnsafe.user.id : "7849326904";
const botUsername = "sun_app_bot";

// --- 3. APP VARIABLES ---
let balance = 10.0;
let friends = [];
let lastUpdateTime = Date.now();
let transactions = [];

// --- 4. CLOUD FUNCTIONS ---

function loadFromCloud() {
    database.ref('users/' + userId).once('value').then((snapshot) => {
        if (snapshot.exists()) {
            const data = snapshot.val();
            balance = data.balance || 10.0;
            friends = data.friends ? Object.values(data.friends) : [];
            lastUpdateTime = data.lastUpdateTime || Date.now();
            transactions = data.transactions || [];
        } else {
            saveToCloud();
        }
        renderFriends();
        renderHistory();
        updateDisplay();
    });
}

function saveToCloud() {
    database.ref('users/' + userId).set({
        balance: balance,
        friends: friends,
        lastUpdateTime: lastUpdateTime,
        transactions: transactions,
        firstName: tg.initDataUnsafe.user ? tg.initDataUnsafe.user.first_name : "User"
    });
}

// --- 5. MINING LOGIC ---

function calculateGrowth() {
    let now = Date.now();
    let passed = now - lastUpdateTime;
    if (passed > 1000) {
        let baseRate = 0.01;
        let rate = baseRate + (friends.length * 0.001);
        rate = Math.min(rate, 0.02);
        
        balance += (balance * rate) * (passed / 86400000);
        lastUpdateTime = now;
        updateDisplay();
        
        // Фоновое сохранение раз в 10 секунд
        if (Math.random() > 0.95) saveToCloud();
    }
}

function updateDisplay() {
    const mainBal = document.getElementById('main-balance');
    const wallBal = document.getElementById('wallet-balance-val');
    const speedBadge = document.getElementById('speed-badge');
    const friendCount = document.getElementById('friends-count');

    if(mainBal) mainBal.textContent = balance.toFixed(9);
    if(wallBal) wallBal.textContent = balance.toFixed(4) + " TON";
    if(friendCount) friendCount.textContent = friends.length;
    
    if(speedBadge) {
        let rate = 0.01 + (friends.length * 0.001);
        speedBadge.textContent = `+${(Math.min(rate, 0.02)*100).toFixed(1)}% в день`;
    }
}

// --- 6. REFERRAL SYSTEM ---

function checkIncomingReferral() {
    const startParam = tg.initDataUnsafe.start_param;
    if (startParam && startParam != userId && !localStorage.getItem('joined_ref')) {
        // Добавляем друга пригласителю (в реальности нужен бэкенд, тут имитируем)
        const newFriend = { name: "Пригласитель: " + startParam, balance: 0 };
        friends.push(newFriend);
        localStorage.setItem('joined_ref', 'true');
        saveToCloud();
        renderFriends();
    }
}

function updateRefLinkUI() {
    const fullLink = `https://t.me/${botUsername}?start=${userId}`;
    const linkField = document.querySelector('.ref-link-field');
    if (linkField) linkField.textContent = fullLink;
}

function copyLink() {
    const fullLink = `https://t.me/${botUsername}?start=${userId}`;
    navigator.clipboard.writeText(fullLink).then(() => {
        tg.showAlert("Ссылка скопирована!");
    });
}

function shareInvite() {
    const fullLink = `https://t.me/${botUsername}?start=${userId}`;
    const url = `https://t.me/share/url?url=${encodeURIComponent(fullLink)}&text=Майни TON в Sun App! ☀️`;
    tg.openTelegramLink(url);
}

function renderFriends() {
    const container = document.getElementById('friends-list-container');
    if(!container) return;
    container.innerHTML = friends.length === 0 ? '<p style="color:gray;text-align:center;">Друзей пока нет</p>' : 
        friends.map(f => `
        <div class="friend-card">
            <span class="friend-name">${f.name}</span>
            <div class="friend-balance">${f.balance.toFixed(4)} 💎</div>
        </div>`).join('');
}

// --- 7. UI HANDLERS ---

function showTab(id, el) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    el.classList.add('active');
}

function openModal(id) { document.getElementById(id + 'Modal').style.display = 'flex'; }
function closeModal() { document.querySelectorAll('.overlay').forEach(e => e.style.display = 'none'); }

function handleDeposit() {
    let v = parseFloat(document.getElementById('deposit-val').value);
    if(v > 0) { balance += v; addTx('plus', v, 'Пополнение'); closeModal(); saveToCloud(); }
}

function handleWithdraw() {
    let v = parseFloat(document.getElementById('withdraw-val').value);
    if(v > 0 && v <= balance) { balance -= v; addTx('minus', v, 'Вывод'); closeModal(); saveToCloud(); }
}

function addTx(type, amt, label) {
    transactions.unshift({type, amt, label, time: new Date().toLocaleTimeString()});
    renderHistory();
}

function renderHistory() {
    const container = document.getElementById('history-list');
    if(!container) return;
    container.innerHTML = transactions.map(t => `
        <div class="history-item ${t.type}">
            <div><strong>${t.label}</strong><br><small>${t.time}</small></div>
            <div style="color:${t.type==='plus'?'#4cd964':'#ff3b30'}">${t.type==='plus'?'+':'-'}${t.amt.toFixed(2)}</div>
        </div>`).join('');
}

function simulateNewFriend() {
    friends.push({ name: "Тестовый Друг " + (friends.length + 1), balance: Math.random() * 2 });
    renderFriends();
    updateDisplay();
    saveToCloud();
}

// --- START ---
function init() {
    loadFromCloud();
    updateRefLinkUI();
    checkIncomingReferral();
    setInterval(calculateGrowth, 1000);
}

init();

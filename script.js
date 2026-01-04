// --- 1. ИНИЦИАЛИЗАЦИЯ TELEGRAM ---
const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

// Получаем реальный ID пользователя. Если открыто просто в браузере — ставим твой ID для теста.
const userTelegramID = tg.initDataUnsafe.user ? tg.initDataUnsafe.user.id : "7849326904";
const botUsername = "sun_app_bot"; // Твой актуальный бот

// --- 2. ДАННЫЕ ПРИЛОЖЕНИЯ ---
let balance = parseFloat(localStorage.getItem('sun_app_balance')) || 10.0;
let lastUpdateTime = parseInt(localStorage.getItem('sun_app_last_time')) || Date.now();
let transactions = JSON.parse(localStorage.getItem('sun_app_history')) || [];
let friends = JSON.parse(localStorage.getItem('sun_app_friends_list')) || [];

const baseRate = 0.01; 
const maxRate = 0.02;

// Расчет текущей скорости (1% + 0.1% за каждого друга, лимит 2%)
function getCurrentRate() {
    let rate = baseRate + (friends.length * 0.001);
    return Math.min(rate, maxRate);
}

// --- 3. ЛОГИКА МАЙНИНГА ---
function calculateGrowth() {
    let now = Date.now();
    let passed = now - lastUpdateTime;
    if (passed > 0) {
        let rate = getCurrentRate();
        let myEarn = (balance * rate) * (passed / 86400000);
        
        let refEarn = 0;
        friends.forEach(f => {
            let fGain = (f.balance * baseRate) * (passed / 86400000);
            f.balance += fGain;
            refEarn += fGain * 0.10; // 10% от дохода друзей
        });

        balance += (myEarn + refEarn);
        lastUpdateTime = now;
        updateDisplay();
    }
}

function updateDisplay() {
    if(document.getElementById('main-balance'))
        document.getElementById('main-balance').textContent = balance.toFixed(9);
    
    if(document.getElementById('wallet-balance-val'))
        document.getElementById('wallet-balance-val').textContent = balance.toFixed(4) + " TON";
    
    if(document.getElementById('speed-badge'))
        document.getElementById('speed-badge').textContent = `+${(getCurrentRate()*100).toFixed(1)}% в день`;

    localStorage.setItem('sun_app_balance', balance);
    localStorage.setItem('sun_app_last_time', Date.now());
    localStorage.setItem('sun_app_friends_list', JSON.stringify(friends));
}

// --- 4. РЕФЕРАЛЬНАЯ СИСТЕМА (ТВОЙ ЗАПРОС) ---

function updateRefLinkUI() {
    const fullLink = `https://t.me/${botUsername}?start=${userTelegramID}`;
    const linkField = document.querySelector('.ref-link-field');
    if (linkField) {
        linkField.textContent = fullLink;
    }
}

function copyLink() {
    const fullLink = `https://t.me/${botUsername}?start=${userTelegramID}`;
    navigator.clipboard.writeText(fullLink).then(() => {
        tg.showAlert("Ссылка скопирована!"); // Используем нативное уведомление Telegram
    });
}

function shareInvite() {
    const fullLink = `https://t.me/${botUsername}?start=${userTelegramID}`;
    const shareText = "Майни TON вместе со мной в Sun App! ☀️";
    const url = `https://t.me/share/url?url=${encodeURIComponent(fullLink)}&text=${encodeURIComponent(shareText)}`;
    tg.openTelegramLink(url);
}

function renderFriends() {
    const container = document.getElementById('friends-list-container');
    if(!container) return;
    
    // Сортировка по балансу (самые богатые сверху)
    friends.sort((a, b) => b.balance - a.balance);

    container.innerHTML = friends.map(f => `
        <div class="friend-card">
            <span class="friend-name">${f.name}</span>
            <div class="friend-balance">
                ${f.balance.toFixed(4)} 💎
            </div>
        </div>
    `).join('');
}

// --- 5. ТРАНЗАКЦИИ (ТОЛЬКО ДЕНЬГИ) ---
function addTx(type, amt, label) {
    transactions.unshift({type, amt, label, time: new Date().toLocaleTimeString()});
    if(transactions.length > 20) transactions.pop();
    localStorage.setItem('sun_app_history', JSON.stringify(transactions));
    renderHistory();
}

function renderHistory() {
    const container = document.getElementById('history-list');
    if(!container) return;
    container.innerHTML = transactions.map(t => `
        <div class="history-item ${t.type}">
            <div><strong>${t.label}</strong><br><small>${t.time}</small></div>
            <div style="color:${t.type==='plus'?'#4cd964':'#ff3b30'}">
                ${t.type==='plus'?'+':'-'}${t.amt.toFixed(2)}
            </div>
        </div>
    `).join('');
}

// --- 6. УПРАВЛЕНИЕ ОКНАМИ ---
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
    if(v > 0) { balance += v; addTx('plus', v, 'Пополнение'); closeModal(); }
}

function handleWithdraw() {
    let v = parseFloat(document.getElementById('withdraw-val').value);
    if(v > 0 && v <= balance) { balance -= v; addTx('minus', v, 'Вывод'); closeModal(); }
}

// Тестовая функция
function simulateNewFriend() {
    friends.push({ name: "Друг " + (friends.length + 1), balance: Math.random() * 5 });
    renderFriends();
    updateDisplay();
}

// ЗАПУСК
function init() {
    updateRefLinkUI();
    renderFriends();
    renderHistory();
    setInterval(calculateGrowth, 100);
}

init();

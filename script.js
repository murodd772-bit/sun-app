// Инициализация Telegram WebApp
const tg = window.Telegram.WebApp;

// Сообщаем Telegram, что приложение загрузилось и его можно развернуть
tg.ready();
tg.expand();

// Получаем ID пользователя (если открыто в телеграме) или ставим дефолт для теста
const userTelegramID = tg.initDataUnsafe.user ? tg.initDataUnsafe.user.id : "000000000";
const userFirstName = tg.initDataUnsafe.user ? tg.initDataUnsafe.user.first_name : "User";
let balance = parseFloat(localStorage.getItem('sun_app_balance')) || 10.0;
let lastUpdateTime = parseInt(localStorage.getItem('sun_app_last_time')) || Date.now();
let transactions = JSON.parse(localStorage.getItem('sun_app_history')) || [];
let friends = JSON.parse(localStorage.getItem('sun_app_friends_list')) || [];

const baseRate = 0.01; 
const maxRate = 0.02;

function getCurrentRate() {
    let rate = baseRate + (friends.length * 0.001);
    return Math.min(rate, maxRate);
}

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
            refEarn += fGain * 0.10;
        });

        balance += (myEarn + refEarn);
        lastUpdateTime = now;
        updateDisplay();
    }
}

function updateDisplay() {
    document.getElementById('main-balance').textContent = balance.toFixed(9);
    document.getElementById('wallet-balance-val').textContent = balance.toFixed(4) + " TON";
    document.getElementById('speed-badge').textContent = `+${(getCurrentRate()*100).toFixed(1)}% в день`;
    document.getElementById('friends-count').textContent = friends.length;

    localStorage.setItem('sun_app_balance', balance);
    localStorage.setItem('sun_app_last_time', Date.now());
    localStorage.setItem('sun_app_friends_list', JSON.stringify(friends));
}

// --- ИСТОРИЯ (ТОЛЬКО ДЕНЬГИ) ---
function addTx(type, amt, label) {
    transactions.unshift({type, amt, label, time: new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})});
    if(transactions.length > 20) transactions.pop();
    localStorage.setItem('sun_app_history', JSON.stringify(transactions));
    renderHistory();
}

function renderHistory() {
    const container = document.getElementById('history-list');
    if(!container) return;
    container.innerHTML = transactions.map(t => `
        <div class="history-item ${t.type}">
            <div>
                <div style="font-weight:bold">${t.label}</div>
                <div style="font-size:11px; color:gray">${t.time}</div>
            </div>
            <div style="color:${t.type==='plus'?'#4cd964':'#ff3b30'}; font-weight:bold">
                ${t.type==='plus'?'+':'-'}${t.amt.toFixed(2)}
            </div>
        </div>
    `).join('');
}

// --- ДРУЗЬЯ (СОРТИРОВКА ПО БАЛАНСУ) ---
function renderFriends() {
    const container = document.getElementById('friends-list-container');
    if(!container) return;
    
    friends.sort((a, b) => b.balance - a.balance); // Самые богатые сверху

    container.innerHTML = friends.map(f => `
        <div class="friend-card">
            <span class="friend-name">${f.name}</span>
            <div class="friend-balance">
                ${f.balance.toFixed(8)}
                <div class="ton-icon-small">💎</div>
            </div>
        </div>
    `).join('');
}

function simulateNewFriend() {
    const names = ["Tayler", "Wayne Mitchell", "Cacaroto Lopes", "Harold", "Liza"];
    friends.push({
        name: names[Math.floor(Math.random()*names.length)] + " " + (friends.length + 1),
        balance: Math.random() * 2 
    });
    renderFriends();
    updateDisplay();
}

// --- СИСТЕМНОЕ ---
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

function copyLink() {
    const link = "t.me/SunStakingBot?start=7849326904";
    navigator.clipboard.writeText(link);
    alert("Ссылка скопирована!");
}

function shareInvite() {
    const url = "https://t.me/share/url?url=t.me/SunStakingBot?start=7849326904&text=Майни TON со мной!";
    if(window.Telegram && window.Telegram.WebApp) window.Telegram.WebApp.openTelegramLink(url);
    else window.open(url);
}

// Старт
renderHistory();
renderFriends();

setInterval(calculateGrowth, 100);

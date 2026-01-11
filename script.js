const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

let balance = parseFloat(localStorage.getItem('sun_balance')) || 10.000;
let lastUpdateTime = parseInt(localStorage.getItem('sun_last_time')) || Date.now();
let historyData = JSON.parse(localStorage.getItem('sun_history')) || [
    { type: "Пополнение", amount: 2.698, date: "11:40 17 Dec 2025", isPositive: true }
];

function updateDisplay() {
    const mainBal = document.getElementById('main-balance');
    if (mainBal) mainBal.textContent = balance.toFixed(9);
    localStorage.setItem('sun_balance', balance);
    localStorage.setItem('sun_last_time', lastUpdateTime);
    renderHistory();
}

// Майнинг логика
function calculateGrowth() {
    let now = Date.now();
    let passed = now - lastUpdateTime;
    if (passed > 0) {
        let rate = 0.01; // 1% в день
        balance += (balance * rate) * (passed / 86400000);
        lastUpdateTime = now;
        updateDisplay();
    }
}

// Навигация
function showTab(id, el) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    
    if (el) {
        document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
        el.classList.add('active');
    }
}

// Модалки
function openModal(id) { document.getElementById(id).style.display = 'flex'; }
function closeModal() { document.querySelectorAll('.overlay').forEach(m => m.style.display = 'none'); }

// Тестовые операции
function testDeposit() {
    let val = parseFloat(document.getElementById('dep-input').value);
    if (val > 0) {
        balance += val;
        addHistory("Пополнение", val, true);
        document.getElementById('dep-input').value = '';
        closeModal();
        updateDisplay();
    }
}

function testWithdraw() {
    let val = parseFloat(document.getElementById('with-input').value);
    if (val > 0 && val <= balance) {
        balance -= val;
        addHistory("Вывод", -val, false);
        document.getElementById('with-input').value = '';
        closeModal();
        updateDisplay();
    }
}

function addHistory(type, amt, isPos) {
    const now = new Date();
    const dateStr = now.getHours() + ":" + (now.getMinutes()<10?'0':'') + now.getMinutes() + " " + now.getDate() + " " + now.toLocaleString('en-us', { month: 'short' }) + " 2026";
    historyData.unshift({ type: type, amount: amt, date: dateStr, isPositive: isPos });
    localStorage.setItem('sun_history', JSON.stringify(historyData));
}

function renderHistory() {
    const container = document.getElementById('history-list');
    if (!container) return;
    container.innerHTML = historyData.map(item => `
        <div class="history-item ${item.isPositive ? 'positive' : 'negative'}">
            <div style="display:flex; align-items:center; flex: 1;">
                <div class="hist-icon-circle"><i class="fas ${item.isPositive ? 'fa-plus' : 'fa-minus'}"></i></div>
                <div>
                    <div style="font-weight:bold; color: white;">${item.type}</div>
                    <div style="font-size:11px; color:#7a8bb2;">${item.date}</div>
                </div>
            </div>
            <div style="font-weight:bold;">${item.isPositive ? '+' : ''}${Math.abs(item.amount).toFixed(3)}</div>
        </div>
    `).join('');
}

// Копирование и приглашение
function copyLink() {
    const link = "t.me/sun_app_bot?start=" + (tg.initDataUnsafe.user ? tg.initDataUnsafe.user.id : "7849326904");
    navigator.clipboard.writeText(link);
    tg.showAlert("Ссылка скопирована!");
}

function shareInvite() {
    const link = "t.me/sun_app_bot?start=" + (tg.initDataUnsafe.user ? tg.initDataUnsafe.user.id : "7849326904");
    tg.openTelegramLink("https://t.me/share/url?url=" + encodeURIComponent(link));
}

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    const linkText = document.getElementById('ref-link-text');
    if (linkText) linkText.textContent = "t.me/sun_app_bot?start=" + (tg.initDataUnsafe.user ? tg.initDataUnsafe.user.id : "7849326904");
    
    updateDisplay();
    setInterval(calculateGrowth, 1000);
});

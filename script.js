const tg = window.Telegram.WebApp;
tg.ready();

let balance = parseFloat(localStorage.getItem('era_bal')) || 10.0;
let historyData = JSON.parse(localStorage.getItem('era_hist')) || [
    { type: "Пополнение", amount: 2.698, date: "11:40 17 Dec 2025", isPos: true }
];

function updateDisplay() {
    document.getElementById('main-balance').textContent = balance.toFixed(9);
    localStorage.setItem('era_bal', balance);
    renderHistory();
}

// Постоянный майнинг (эмуляция)
setInterval(() => {
    balance += 0.000000012;
    updateDisplay();
}, 1000);

function showTab(tabId, el) {
    // Скрываем все экраны
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    // Показываем нужный
    document.getElementById(tabId).classList.add('active');
    
    // Подсветка кнопок меню
    if (el) {
        document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
        el.classList.add('active');
    }
}

function openModal(id) { document.getElementById(id).style.display = 'flex'; }
function closeModal() { document.querySelectorAll('.modal-overlay').forEach(m => m.style.display = 'none'); }

function testDeposit() {
    let val = parseFloat(document.getElementById('dep-input').value);
    if (val > 0) {
        balance += val;
        addHist("Пополнение", val, true);
        closeModal();
        updateDisplay();
    }
}

function testWithdraw() {
    let val = parseFloat(document.getElementById('with-input').value);
    if (val > 0 && val <= balance) {
        balance -= val;
        addHist("Вывод", val, false);
        closeModal();
        updateDisplay();
    }
}

function addHist(type, amt, isPos) {
    const now = new Date();
    const dateStr = now.getHours() + ":" + (now.getMinutes()<10?'0':'') + now.getMinutes() + " " + now.getDate() + " Jan 2026";
    historyData.unshift({ type: type, amount: amt, date: dateStr, isPos: isPos });
    localStorage.setItem('era_hist', JSON.stringify(historyData));
}

function renderHistory() {
    const container = document.getElementById('history-list');
    if (!container) return;
    container.innerHTML = historyData.map(item => `
        <div class="list-item" style="background:#0a1128; padding:15px; margin-bottom:10px; border-radius:12px; display:flex; justify-content:space-between">
            <div><b>${item.type}</b><br><small style="color:#7a8bb2">${item.date}</small></div>
            <div style="color:${item.isPos ? '#2ecc71' : '#e74c3c'}">${item.isPos ? '+' : '-'}${item.amount.toFixed(3)}</div>
        </div>
    `).join('');
}

function copyLink() {
    const link = "t.me/sun_app_bot?start=user";
    navigator.clipboard.writeText(link);
    tg.showAlert("Ссылка скопирована!");
}

updateDisplay();

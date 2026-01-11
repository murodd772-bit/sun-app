const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

let balance = parseFloat(localStorage.getItem('balance')) || 10.0;
let history = JSON.parse(localStorage.getItem('history')) || [
    { type: "Вход", amount: "+0.000", date: "11 Jan 2026" }
];

function updateUI() {
    document.getElementById('main-balance').textContent = balance.toFixed(9);
    localStorage.setItem('balance', balance);
    renderHistory();
}

// Эмуляция майнинга
setInterval(() => {
    balance += 0.000000021;
    updateUI();
}, 1000);

function showTab(id, el) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    
    if (el) {
        document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
        el.classList.add('active');
    }
}

function openModal(id) { document.getElementById(id).style.display = 'flex'; }
function closeModal() { document.querySelectorAll('.overlay').forEach(o => o.style.display = 'none'); }

function deposit() {
    let val = parseFloat(document.getElementById('dep-input').value);
    if (val > 0) {
        balance += val;
        history.unshift({ type: "Пополнение", amount: "+" + val.toFixed(2), date: "11 Jan" });
        localStorage.setItem('history', JSON.stringify(history));
        updateUI();
        closeModal();
    }
}

function renderHistory() {
    const container = document.getElementById('history-container');
    if (!container) return;
    container.innerHTML = history.map(item => `
        <div class="rating-item">
            <div><b>${item.type}</b><br><small>${item.date}</small></div>
            <div style="color: #2ecc71">${item.amount}</div>
        </div>
    `).join('');
}

function copyLink() {
    const link = "t.me/sun_app_bot?start=" + (tg.initDataUnsafe.user?.id || "user");
    navigator.clipboard.writeText(link);
    tg.showAlert("Ссылка скопирована!");
}

// Загрузка данных
document.addEventListener('DOMContentLoaded', () => {
    const linkText = document.getElementById('ref-link-text');
    if (linkText) linkText.textContent = "t.me/sun_app_bot?start=" + (tg.initDataUnsafe.user?.id || "12345");
    updateUI();
});

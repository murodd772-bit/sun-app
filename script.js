let balance = 10.0;
let historyData = [];

function updateDisplay() {
    document.getElementById('main-balance').textContent = balance.toFixed(9);
    renderHistory();
}

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

function testDeposit() {
    let v = parseFloat(document.getElementById('dep-input').value);
    if (v > 0) {
        balance += v;
        historyData.unshift({ type: "Пополнение", amount: v, date: "11 Jan 2026", isPos: true });
        updateDisplay();
        closeModal();
    }
}

function renderHistory() {
    const container = document.getElementById('history-list');
    if (!container) return;
    container.innerHTML = historyData.map(item => `
        <div style="background:#121218; padding:15px; margin-bottom:10px; border-radius:12px; display:flex; justify-content:space-between">
            <div><b>${item.type}</b><br><small>${item.date}</small></div>
            <div style="color:${item.isPos ? '#2ecc71' : '#ff3b30'}">${item.isPos ? '+' : '-'}${item.amount}</div>
        </div>
    `).join('');
}

function copyLink() { window.Telegram.WebApp.showAlert("Ссылка скопирована!"); }

updateDisplay();

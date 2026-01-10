// --- 1. ИНИЦИАЛИЗАЦИЯ TELEGRAM ---
const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

// Универсальная функция уведомлений, которая не вызывает ошибок в версии 6.0
function showMessage(text) {
    // В старых версиях Telegram (как 6.0) используем обычный alert
    alert(text);
}

// БЕЗОПАСНАЯ ИНИЦИАЛИЗАЦИЯ ADSGRAM
let AdController = null;
function initAds() {
    try {
        if (window.Adsgram) {
            AdController = window.Adsgram.init({ blockId: "20812" });
            console.log("Adsgram initialized");
        }
    } catch (e) {
        console.error("Adsgram init error:", e);
    }
}
initAds();

const userTelegramID = tg.initDataUnsafe.user ? tg.initDataUnsafe.user.id : "7849326904";
const botUsername = "sun_app_bot"; 

// --- 2. ДАННЫЕ ПРИЛОЖЕНИЯ ---
let balance = parseFloat(localStorage.getItem('sun_app_balance')) || 10.0;
let lastUpdateTime = parseInt(localStorage.getItem('sun_app_last_time')) || Date.now();
let transactions = JSON.parse(localStorage.getItem('sun_app_history')) || [];
let friends = JSON.parse(localStorage.getItem('sun_app_friends_list')) || [];
let completedTasks = JSON.parse(localStorage.getItem('sun_tasks_done')) || [];

const baseRate = 0.01; 
const maxRate = 0.02;

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
        
        friends.forEach(f => {
            let fGain = (f.balance * baseRate) * (passed / 86400000);
            f.balance += fGain;
            balance += fGain * 0.10; 
        });

        balance += myEarn;
        lastUpdateTime = now;
        updateDisplay();
    }
}

function updateDisplay() {
    const mainBal = document.getElementById('main-balance');
    const wallBal = document.getElementById('wallet-balance-val');
    const speedB = document.getElementById('speed-badge');

    if(mainBal) mainBal.textContent = balance.toFixed(9);
    if(wallBal) wallBal.textContent = balance.toFixed(4) + " TON";
    if(speedB) speedB.textContent = `+${(getCurrentRate()*100).toFixed(1)}% в день`;

    localStorage.setItem('sun_app_balance', balance);
    localStorage.setItem('sun_app_last_time', lastUpdateTime);
    localStorage.setItem('sun_app_friends_list', JSON.stringify(friends));
    localStorage.setItem('sun_tasks_done', JSON.stringify(completedTasks));
    localStorage.setItem('sun_app_history', JSON.stringify(transactions));
}

// --- 4. ЗАДАНИЯ И РЕКЛАМА ---
async function watchAd() {
    if (!AdController) {
        initAds();
    }

    if (!AdController) {
        showMessage("Рекламный модуль загружается. Нажмите еще раз через 3 секунды.");
        return;
    }

    AdController.show().then(() => {
        balance += 0.05;
        transactions.unshift({
            type: 'plus', 
            amt: 0.05, 
            label: 'Просмотр рекламы', 
            time: new Date().toLocaleTimeString()
        });
        updateDisplay();
        renderHistory();
        showMessage("Бонус +0.05 TON зачислен!");
    }).catch((err) => {
        console.error("Ad error:", err);
        if (err.errorDescription === "No ads") {
            showMessage("Сейчас нет доступной рекламы. Попробуйте позже.");
        } else {
            showMessage("Реклама не загрузилась. Попробуйте еще раз.");
        }
    });
}

function doTask(taskId, link, reward) {
    if (completedTasks.includes(taskId)) {
        showMessage("Задание уже выполнено!");
        return;
    }
    if (link !== "#") {
        tg.openTelegramLink(link);
    }
    
    // Используем стандартный confirm, так как Telegram 6.0 не поддерживает showConfirm
    if (confirm("Вы выполнили задание?")) {
        balance += reward;
        completedTasks.push(taskId);
        transactions.unshift({
            type: 'plus', 
            amt: reward, 
            label: 'Задание выполнено', 
            time: new Date().toLocaleTimeString()
        });
        updateDisplay();
        renderTasks();
        renderHistory();
    }
}

function renderTasks() {
    completedTasks.forEach(id => {
        const card = document.getElementById(`task-${id}`);
        if (card) {
            const btn = card.querySelector('.task-btn');
            if (btn) {
                btn.textContent = "Готово";
                btn.classList.add('task-done');
                btn.onclick = null;
            }
        }
    });
}

// --- 5. НАВИГАЦИЯ И ИНТЕРФЕЙС ---
function updateRefLinkUI() {
    const fullLink = `https://t.me/${botUsername}?start=${userTelegramID}`;
    const linkField = document.getElementById('ref-link-text');
    if (linkField) { linkField.textContent = fullLink; }
}

function copyLink() {
    const fullLink = `https://t.me/${botUsername}?start=${userTelegramID}`;
    navigator.clipboard.writeText(fullLink).then(() => { showMessage("Ссылка скопирована!"); });
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
    document.getElementById('friends-count').textContent = friends.length;
    container.innerHTML = friends.map(f => `
        <div class="friend-card">
            <span class="friend-name">${f.name}</span>
            <div class="friend-balance">${f.balance.toFixed(4)} 💎</div>
        </div>
    `).join('');
}

function renderHistory() {
    const container = document.getElementById('history-list');
    if(!container) return;
    container.innerHTML = transactions.map(t => `
        <div class="history-item ${t.type}">
            <div><strong>${t.label}</strong><br><small>${t.time}</small></div>
            <div style="color:${t.type==='plus'?'#4cd964':'#ff3b30'}">${t.type==='plus'?'+':'-'}${t.amt.toFixed(2)}</div>
        </div>
    `).join('');
}

function showTab(id, el) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    const target = document.getElementById(id);
    if(target) target.classList.add('active');
    if(el) el.classList.add('active');
}

function openModal(id) { 
    const modal = document.getElementById(id + 'Modal');
    if(modal) modal.style.display = 'flex'; 
}

function closeModal() { 
    document.querySelectorAll('.overlay').forEach(e => e.style.display = 'none'); 
}

function handleDeposit() {
    const inp = document.getElementById('deposit-val');
    const v = parseFloat(inp.value);
    if(v > 0) { 
        balance += v; 
        transactions.unshift({type:'plus', amt:v, label:'Пополнение', time: new Date().toLocaleTimeString()});
        inp.value = "";
        closeModal(); renderHistory(); updateDisplay();
    }
}

function handleWithdraw() {
    const inp = document.getElementById('withdraw-val');
    const v = parseFloat(inp.value);
    if(v > 0 && v <= balance) { 
        balance -= v; 
        transactions.unshift({type:'minus', amt:v, label:'Вывод', time: new Date().toLocaleTimeString()});
        inp.value = "";
        closeModal(); renderHistory(); updateDisplay();
    }
}

function init() {
    updateRefLinkUI();
    renderFriends();
    renderHistory();
    renderTasks();
    setInterval(calculateGrowth, 100);
}

document.addEventListener('DOMContentLoaded', init);

function showTab(id, el) {
    // Скрываем все экраны
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    // Убираем подсветку со всех кнопок меню
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    
    // Показываем нужный экран
    const target = document.getElementById(id);
    if(target) target.classList.add('active');
    
    // Если нажали на элемент меню — подсвечиваем его
    if(el && el.classList.contains('nav-item')) {
        el.classList.add('active');
    }
}

function getBonus(rank) {
    if (rank === 1) return "+0.5%";
    if (rank === 2) return "+0.4%";
    if (rank === 3) return "+0.3%";
    if (rank >= 4 && rank <= 8) return "+0.2%";
    if (rank >= 9 && rank <= 15) return "+0.1%";
    return null;
}

function renderRating() {
    const container = document.getElementById('rating-list-container');
    let html = '';
    for (let i = 1; i <= 50; i++) {
        const bonus = getBonus(i);
        const bonusHtml = bonus ? `<span class="bonus-badge">${bonus} Bonus</span>` : '';
        let cls = i <= 3 ? `top-${i}` : '';
        let icon = i <= 3 ? (i===1 ? '<i class="fas fa-crown"></i>' : '<i class="fas fa-medal"></i>') : i;
        
        html += `<div class="rating-card ${cls}">
            <div class="rank-icon">${icon}</div>
            <div class="user-avatar-small"><img src="https://via.placeholder.com/35"></div>
            <div class="user-name-box">Player_${i*17}</div>
            <div class="user-points-box">${bonusHtml}<div class="points-val">${(500/i).toFixed(2)} <i class="fas fa-gem"></i></div></div>
        </div>`;
    }
    container.innerHTML = html;
}

// Запускай при старте
renderRating();

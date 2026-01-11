const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

let balance = Number(localStorage.getItem("sun_balance")) || 10;
let lastTime = Number(localStorage.getItem("sun_time")) || Date.now();
const COMMISSION = 0.10;

function updateDisplay() {
    if(balance < 0) balance = 0;

    const main = document.getElementById("main-balance");
    const footer = document.getElementById("my-footer-balance");
    const badge = document.querySelector(".promo-badge");

    main.textContent = balance.toFixed(9);
    footer.textContent = balance.toFixed(2);
    badge.textContent = "+1.00% в день";

    main.classList.add("grow");
    setTimeout(()=>main.classList.remove("grow"),250);

    localStorage.setItem("sun_balance", balance);
    localStorage.setItem("sun_time", lastTime);
}

function calculateGrowth() {
    const now = Date.now();
    const diff = now - lastTime;
    balance += balance * 0.01 * (diff / 86400000);
    lastTime = now;
    updateDisplay();
}

function playCoinFlip() {
    if(balance < 0.1) return alert("Минимум 0.1");
    balance -= 0.1;
    if(Math.random() > 0.5) balance += 0.2 * (1 - COMMISSION);
    updateDisplay();
}

let heroTime = 300;
let heroBank = 0;
let heroInt;

function joinHeroGame() {
    if(balance < 0.1) return alert("Нужно 0.1");
    balance -= 0.1;
    heroBank += 0.1;

    document.getElementById("hero-timer").style.display = "block";
    document.getElementById("hero-bank").style.display = "block";

    clearInterval(heroInt);
    heroInt = setInterval(()=>{
        heroTime--;
        document.getElementById("hero-timer").textContent =
            Math.floor(heroTime/60)+":"+String(heroTime%60).padStart(2,"0");
        document.getElementById("hero-bank").textContent =
            "Банк: "+heroBank.toFixed(2)+" TON";

        if(heroTime<=0){
            clearInterval(heroInt);
            balance += heroBank*(1-COMMISSION);
            heroTime=300;
            heroBank=0;
            updateDisplay();
        }
    },1000);

    updateDisplay();
}

function showTab(id, el){
    document.querySelectorAll(".screen").forEach(s=>s.classList.remove("active"));
    document.getElementById(id).classList.add("active");
    document.querySelectorAll(".nav-item").forEach(n=>n.classList.remove("active"));
    if(el) el.classList.add("active");
}

function openModal(id){ document.getElementById(id).style.display="flex"; }
function closeModal(){ document.querySelectorAll(".overlay").forEach(m=>m.style.display="none"); }

setInterval(calculateGrowth,1000);
updateDisplay();

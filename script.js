let currentScore = 0;
let answered = 0;
const ADMIN_PIN = "174506";
let metroInterval, timerInterval;

// 1. Navegación
function changeView(id) {
    document.querySelectorAll('.view').forEach(v => v.classList.add('hidden'));
    document.getElementById(id).classList.remove('hidden');
    if(id === 'guia') renderAlgo();
    if(id === 'quiz') startQuiz();
}

// 2. Renderizar Algoritmo
function renderAlgo() {
    const list = document.getElementById('algo-list');
    list.innerHTML = rcpData.algoritmo.map(a => `
        <div class="card"><strong>${a.paso}. ${a.titulo}</strong><br>${a.desc}</div>
    `).join('');
}

// 3. Simulador (110 LPM)
function startSimulation() {
    let timeLeft = 120; // 2 minutos [12]
    document.getElementById('start-rcp').classList.add('hidden');
    document.getElementById('stop-rcp').classList.remove('hidden');

    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    metroInterval = setInterval(() => {
        const osc = audioCtx.createOscillator();
        osc.connect(audioCtx.destination);
        osc.start(); osc.stop(audioCtx.currentTime + 0.1);
        const h = document.getElementById('pulse');
        h.style.transform = "scale(1.3)";
        setTimeout(() => h.style.transform = "scale(1)", 100);
    }, 60000 / 110); // 110 LPM solicitado

    timerInterval = setInterval(() => {
        timeLeft--;
        const m = Math.floor(timeLeft / 60);
        const s = timeLeft % 60;
        document.getElementById('cycle-timer').innerText = `${m}:${s.toString().padStart(2,'0')}`;
        if(timeLeft <= 0) {
            alert("¡TIEMPO! Cambio de reanimador [12]");
            timeLeft = 120;
        }
    }, 1000);
}

// 4. Examen y Validación
function startQuiz() {
    const qList = rcpData.examen.sort(() => 0.5 - Math.random()).slice(0, 10);
    const container = document.getElementById('quiz-container');
    container.innerHTML = qList.map((q, i) => `
        <div class="card">
            <p>${i+1}. ${q.p}</p>
            ${q.ops.map((o, j) => `<button onclick="check(${j}, ${q.corr}, this)">${o}</button>`).join('')}
        </div>
    `).join('');
}

function check(sel, corr, btn) {
    if(sel === corr) { currentScore++; btn.style.background = "#c8e6c9"; }
    else { btn.style.background = "#ffcdd2"; }
    answered++;
    btn.parentElement.querySelectorAll('button').forEach(b => b.disabled = true);
    if(answered === 10) document.getElementById('status-overlay').classList.remove('hidden');
}

function verifyAdmin() {
    if(document.getElementById('pin').value === ADMIN_PIN) {
        document.getElementById('admin-login').classList.add('hidden');
        document.getElementById('status-overlay').classList.add('hidden');
        document.getElementById('final-score').classList.remove('hidden');
        document.getElementById('score-val').innerText = `${currentScore}/10`;
    } else { alert("PIN Incorrecto"); }
}

function showAdminLogin() { document.getElementById('admin-login').classList.remove('hidden'); }
document.getElementById('start-rcp').onclick = startSimulation;
document.getElementById('stop-rcp').onclick = () => location.reload();
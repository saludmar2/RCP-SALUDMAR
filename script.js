let metroInterval, timerInterval, rcpActive = false;
let currentQuestions = [], aciertos = 0, questionIndex = 0;
const ADMIN_PIN = "174506";

// NAVEGACIÓN
function showView(id) {
    document.querySelectorAll('.view').forEach(v => v.classList.add('hidden'));
    document.getElementById(id).classList.remove('hidden');
    if(id === 'guia') renderGuia();
}

function renderGuia() {
    const container = document.getElementById('algo-container');
    container.innerHTML = RCP_DATA.algoritmo.map(a => `
        <div class="card"><strong>${a.paso}. ${a.titulo}</strong><br>${a.desc}</div>
    `).join('');
}

// SIMULADOR (110 LPM)
function toggleRCP() {
    if(!rcpActive) {
        rcpActive = true;
        document.getElementById('start-btn').innerText = "DETENER";
        document.getElementById('start-btn').style.background = "var(--red)";
        
        let timeLeft = 120; // 2 minutos
        timerInterval = setInterval(() => {
            timeLeft--;
            let m = Math.floor(timeLeft / 60).toString().padStart(2, '0');
            let s = (timeLeft % 60).toString().padStart(2, '0');
            document.getElementById('timer').innerText = `${m}:${s}`;
            if(timeLeft <= 0) { alert("¡TIEMPO! Cambio de reanimador [1, 2]."); timeLeft = 120; }
        }, 1000);

        metroInterval = setInterval(() => {
            const h = document.getElementById('beat');
            h.style.transform = "scale(1.3)";
            setTimeout(() => h.style.transform = "scale(1)", 100);
            // Audio opcional: new Audio('click.mp3').play();
        }, 60000 / 110);
    } else {
        location.reload();
    }
}

// EXAMEN (10 PREGUNTAS SIN REPETIR)
function startTest() {
    currentQuestions = [...RCP_DATA.banco_preguntas].sort(() => 0.5 - Math.random());
    questionIndex = 0; aciertos = 0;
    document.getElementById('quiz-intro').classList.add('hidden');
    document.getElementById('quiz-box').classList.remove('hidden');
    showQuestion();
}

function showQuestion() {
    if(questionIndex >= 10) { 
        document.getElementById('pending-screen').classList.remove('hidden');
        return; 
    }
    const q = currentQuestions[questionIndex];
    document.getElementById('question-content').innerHTML = `
        <div class="card">
            <h3>Pregunta ${questionIndex+1} de 10</h3>
            <p>${q.p}</p>
            ${q.ops.map((o, i) => `<button onclick="checkAns(${i}, ${q.corr})" class="btn-main" style="margin-bottom:10px; background:#e3f2fd; color:black;">${o}</button>`).join('')}
        </div>
    `;
}

function checkAns(idx, corr) {
    if(idx === corr) aciertos++;
    questionIndex++;
    showQuestion();
}

// SISTEMA ADMINISTRADOR
function showAdmin() { document.getElementById('admin-login').classList.remove('hidden'); }
function hideAdmin() { document.getElementById('admin-login').classList.add('hidden'); }

function unlockResults() {
    if(document.getElementById('pin-input').value === ADMIN_PIN) {
        document.getElementById('admin-login').classList.add('hidden');
        document.getElementById('pending-screen').classList.add('hidden');
        document.getElementById('quiz-box').classList.add('hidden');
        document.getElementById('results').classList.remove('hidden');
        document.getElementById('score-circle').innerText = `${aciertos}/10`;
        document.getElementById('final-feedback').innerText = aciertos >= 8 ? "¡Excelente! Aprobado." : "Repase los protocolos [3, 11].";
    } else { alert("PIN INCORRECTO"); }
}

// INICIALIZACIÓN
window.onload = () => showView('guia');
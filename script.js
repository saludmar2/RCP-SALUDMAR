// --- DATOS (Copiados del JSON para funcionamiento standalone) ---
const DATA = {
    algoritmo: [
        { t: "1. Seguridad y Respuesta", d: "Escena segura. ¿Responde? Si no, activa el sistema de emergencias.", c: "[7]" },
        { t: "2. Llamada Manos Libres", d: "Llama al 112/911. Activa ALTAVOZ. No cuelgues. Pide un DEA.", c: "[1]" },
        { t: "3. Comprobar (<10s)", d: "Mira el pecho. ¿Respira? Si no (o solo boquea), inicia RCP.", c: "[7]" },
        { t: "4. Compresiones", d: "Centro del pecho. 100-120 lpm. 5-6 cm profundidad.", c: "[2]" },
        { t: "5. Ventilaciones", d: "30 compresiones / 2 ventilaciones (si estás entrenado).", c: "[6]" }
    ],
    // Aquí pegamos el array "banco_preguntas" del paso 1 completo
    examen: [
       { id: 1, p: "¿Secuencia para atragantamiento severo en adultos (2025)?", ops: ["Solo compresiones", "5 espalda + 5 abdominales", "Intubación", "Esperar"], corr: 1, info: "5 golpes espalda + 5 compresiones abdominales [5]." },
       { id: 2, p: "¿Qué hacer con el teléfono al hallar un paro?", ops: ["Colgar", "Buscar fijo", "Manos libres (Altavoz)", "No llamar"], corr: 2, info: "Usar manos libres para recibir instrucciones [1]." },
       { id: 3, p: "Frecuencia de compresiones recomendada", ops: ["60-80", "100-120 lpm", "140+", "80-100"], corr: 1, info: "Entre 100 y 120 cpm [2]." },
       { id: 4, p: "¿Manejo del sostén con el DEA?", ops: ["Quitar siempre", "Cortar", "Desplazar/Ajustar", "Nada"], corr: 2, info: "Desplazar para no retrasar la descarga [3]." },
       { id: 5, p: "¿Tiempo para cambio de reanimador?", ops: ["5 min", "2 min", "10 min", "Nunca"], corr: 1, info: "Cada 2 minutos para evitar fatiga [2]." },
       { id: 6, p: "¿Fármaco para sospecha de opioides?", ops: ["Adrenalina", "Aspirina", "Naloxona", "Glucosa"], corr: 2, info: "Administrar Naloxona [4]." },
       { id: 7, p: "Relación C:V (Entrenado/Adulto)", ops: ["30:2", "15:2", "50:2", "Solo aire"], corr: 0, info: "30 compresiones por 2 ventilaciones [6]." },
       { id: 8, p: "Tiempo máximo para comprobar respiración", ops: ["30s", "10s", "5s", "1 min"], corr: 1, info: "Máximo 10 segundos [7]." },
       { id: 9, p: "Atragantamiento en lactantes", ops: ["Heimlich", "5 espalda + 5 pecho", "Solo abdominal", "Agua"], corr: 1, info: "5 golpes espalda + 5 compresiones torácicas [8]." },
       { id: 10, p: "Ventilación con vía aérea avanzada", ops: ["1 cada 6s", "1 cada 3s", "1 cada 10s", "Continua"], corr: 0, info: "Una ventilación cada 6 segundos (10/min) [9]." }
    ]
};

// --- VARIABLES DE ESTADO ---
let metroInterval, timerInterval;
let bpm = 110;
let cycleTime = 120; // 2 minutos
let audioCtx;
let currentQuiz = [];
let questionIndex = 0;
let score = 0;
const TEACHER_PIN = "174506";

// --- INICIALIZACIÓN ---
document.addEventListener('DOMContentLoaded', () => {
    loadAlgorithm();
});

function navTo(sectionId) {
    document.querySelectorAll('main section').forEach(s => {
        s.classList.remove('active');
        s.classList.add('hidden');
    });
    document.getElementById(sectionId).classList.remove('hidden');
    document.getElementById(sectionId).classList.add('active');
}

// --- 1. ALGORITMO ---
function loadAlgorithm() {
    const container = document.getElementById('algoritmo-container');
    DATA.algoritmo.forEach(step => {
        const div = document.createElement('div');
        div.className = 'card';
        div.innerHTML = `<h4>${step.t}</h4><p>${step.d} <small>${step.c}</small></p>`;
        container.appendChild(div);
    });
}

// --- 2. SIMULADOR (AUDIO & TIMER) ---
function startSimulation() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    
    // UI Updates
    document.getElementById('btn-start').disabled = true;
    document.getElementById('btn-stop').disabled = false;
    
    // Metrónomo 110 LPM
    let intervalMs = 60000 / bpm;
    const visualHeart = document.getElementById('visual-beat');
    
    metroInterval = setInterval(() => {
        playTone();
        visualHeart.classList.add('pulse-anim');
        setTimeout(() => visualHeart.classList.remove('pulse-anim'), 100);
    }, intervalMs);

    // Cronómetro 2 Minutos
    let timeLeft = cycleTime;
    updateTimerUI(timeLeft);
    
    timerInterval = setInterval(() => {
        timeLeft--;
        updateTimerUI(timeLeft);
        if(timeLeft <= 0) {
            playAlert();
            timeLeft = cycleTime; // Reinicia ciclo
            alert("¡TIEMPO! CAMBIO DE REANIMADOR");
        }
    }, 1000);
}

function stopSimulation() {
    clearInterval(metroInterval);
    clearInterval(timerInterval);
    document.getElementById('btn-start').disabled = false;
    document.getElementById('btn-stop').disabled = true;
    updateTimerUI(cycleTime);
}

function playTone() {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.frequency.value = 1000;
    gain.gain.value = 0.1;
    osc.start();
    osc.stop(audioCtx.currentTime + 0.05);
}

function playAlert() {
    // Tono largo para cambio de reanimador
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.frequency.value = 600;
    osc.type = 'sawtooth';
    gain.gain.value = 0.2;
    osc.start();
    osc.stop(audioCtx.currentTime + 1);
}

function updateTimerUI(seconds) {
    const m = Math.floor(seconds / 60).toString().padStart(2,'0');
    const s = (seconds % 60).toString().padStart(2,'0');
    document.getElementById('timer-display').innerText = `${m}:${s}`;
}

// --- 3. EXAMEN & VALIDACIÓN ---
function startQuiz() {
    // Fisher-Yates Shuffle para orden aleatorio
    currentQuiz = [...DATA.examen];
    for (let i = currentQuiz.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [currentQuiz[i], currentQuiz[j]] = [currentQuiz[j], currentQuiz[i]];
    }
    
    questionIndex = 0;
    score = 0;
    document.getElementById('quiz-intro').classList.add('hidden');
    document.getElementById('quiz-content').classList.remove('hidden');
    document.getElementById('quiz-results').classList.add('hidden');
    showQuestion();
}

function showQuestion() {
    if (questionIndex >= currentQuiz.length) {
        finishQuiz();
        return;
    }
    
    const qData = currentQuiz[questionIndex];
    document.getElementById('q-current').innerText = questionIndex + 1;
    
    const container = document.getElementById('question-container');
    container.innerHTML = `<div class="question-text">${qData.p}</div>`;
    
    // Aleatorizar opciones también
    let options = qData.ops.map((txt, idx) => ({ txt, idx }));
    options.sort(() => Math.random() - 0.5);

    options.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.innerText = opt.txt;
        btn.onclick = () => checkAnswer(btn, opt.idx, qData.corr, qData.info);
        container.appendChild(btn);
    });
}

function checkAnswer(btn, selectedIdx, correctIdx, info) {
    const allBtns = document.querySelectorAll('.option-btn');
    allBtns.forEach(b => b.disabled = true);
    
    if (selectedIdx === correctIdx) {
        btn.classList.add('correct');
        score++;
    } else {
        btn.classList.add('incorrect');
        alert(`Incorrecto. ${info}`);
    }
    
    setTimeout(() => {
        questionIndex++;
        showQuestion();
    }, 1500);
}

function finishQuiz() {
    document.getElementById('quiz-content').classList.add('hidden');
    document.getElementById('quiz-results').classList.remove('hidden');
    document.getElementById('score-circle').innerText = `${score}/10`;
    
    const msg = score >= 8 ? "¡Excelente! Nivel Experto." : "Necesitas repasar.";
    document.getElementById('feedback-msg').innerText = msg;
    
    // Resetear formulario docente
    document.getElementById('teacher-pin').value = "";
    document.getElementById('teacher-pin').disabled = false;
    document.getElementById('verification-msg').innerHTML = "";
}

function verifyTeacher() {
    const input = document.getElementById('teacher-pin').value;
    const msgDiv = document.getElementById('verification-msg');
    
    if (input === TEACHER_PIN) {
        const fecha = new Date().toLocaleString();
        msgDiv.innerHTML = `<div class="verified">✅ NOTA VERIFICADA<br>Fecha: ${fecha}<br>Instructor: Aprobado</div>`;
        document.getElementById('teacher-pin').disabled = true;
    } else {
        alert("PIN INCORRECTO");
        document.getElementById('teacher-pin').value = "";
    }
}

function resetQuiz() {
    startQuiz();
}

// SIMULACIÓN DE DATOS JSON (En producción, cargar con fetch())
const appData = {
    algoritmo: [
        { t: "1. Seguridad", d: "Asegura la escena. Comprueba respuesta." },
        { t: "2. Activar 112", d: "Usa MANOS LIBRES. Pide un DEA [1]." },
        { t: "3. Comprobar", d: "¿Respira? ¿Tiene pulso? (<10 seg) [2]." },
        { t: "4. Compresiones", d: "30 compresiones fuertes y rápidas [3]." },
        { t: "5. Ventilaciones", d: "2 ventilaciones si estás entrenado [5]." }
    ],
    examen: [
        {
            p: "¿Frecuencia de compresiones recomendada?",
            ops: ["80-90 lpm", "100-120 lpm", "130-140 lpm"],
            correcta: 1,
            info: "La frecuencia debe ser de 100-120 lpm [11]."
        },
        {
            p: "¿Acción con el sostén femenino al usar DEA?",
            ops: ["Retirarlo siempre", "Cortarlo", "Desplazarlo/Ajustarlo"],
            correcta: 2,
            info: "Se recomienda desplazar el sostén en lugar de perder tiempo retirándolo [4]."
        },
        {
            p: "¿Tiempo de ciclo para cambio de reanimador?",
            ops: ["1 minuto", "2 minutos", "5 minutos"],
            correcta: 1,
            info: "Se debe rotar cada 2 minutos para evitar fatiga y mantener calidad [11]."
        }
    ]
};

// --- VARIABLES GLOBALES ---
let metronomeInterval;
let timerInterval;
let isRunning = false;
const BPM = 110; // Solicitado por usuario (Rango válido 100-120 [11])
const CYCLE_TIME = 120; // 2 minutos en segundos
let timeLeft = CYCLE_TIME;

// --- INICIALIZACIÓN ---
document.addEventListener('DOMContentLoaded', () => {
    loadAlgorithm();
    loadQuiz();
    
    // Event Listeners Metrónomo
    document.getElementById('btn-start').addEventListener('click', startSimulation);
    document.getElementById('btn-stop').addEventListener('click', stopSimulation);
});

// --- NAVEGACIÓN ---
window.showSection = (id) => {
    document.querySelectorAll('main section').forEach(s => {
        s.classList.remove('active-section');
        s.classList.add('hidden-section');
    });
    document.getElementById(id).classList.remove('hidden-section');
    document.getElementById(id).classList.add('active-section');
};

// --- CARGA DE CONTENIDO ---
function loadAlgorithm() {
    const container = document.getElementById('steps-container');
    appData.algoritmo.forEach(step => {
        const div = document.createElement('div');
        div.className = 'step-card';
        div.innerHTML = `<h3>${step.t}</h3><p>${step.d}</p>`;
        container.appendChild(div);
    });
}

// --- LÓGICA METRÓNOMO & CRONÓMETRO ---
function startSimulation() {
    if (isRunning) return;
    isRunning = true;
    
    document.getElementById('btn-start').disabled = true;
    document.getElementById('btn-stop').disabled = false;
    
    // Metrónomo (110 LPM = 1 beat cada 545.45 ms)
    const msPerBeat = 60000 / BPM;
    const visual = document.getElementById('visual-indicator');
    
    // Audio simple (Oscilador)
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const audioCtx = new AudioContext();

    function playTone() {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.frequency.value = 800; // Tono alto para cortar el estrés
        gain.gain.value = 0.1;
        osc.start();
        osc.stop(audioCtx.currentTime + 0.1);
    }

    metronomeInterval = setInterval(() => {
        // Efecto visual
        visual.classList.add('pulse');
        playTone();
        setTimeout(() => visual.classList.remove('pulse'), 150);
    }, msPerBeat);

    // Cronómetro de Ciclo (2 Minutos)
    startTimer();
}

function stopSimulation() {
    clearInterval(metronomeInterval);
    clearInterval(timerInterval);
    isRunning = false;
    timeLeft = CYCLE_TIME;
    updateTimerDisplay();
    document.getElementById('btn-start').disabled = false;
    document.getElementById('btn-stop').disabled = true;
}

function startTimer() {
    updateTimerDisplay();
    timerInterval = setInterval(() => {
        timeLeft--;
        updateTimerDisplay();
        
        if (timeLeft <= 0) {
            // Alerta de cambio de reanimador
            alert("¡TIEMPO! CAMBIO DE REANIMADOR [10]");
            timeLeft = CYCLE_TIME; // Reinicia ciclo
        }
    }, 1000);
}

function updateTimerDisplay() {
    const m = Math.floor(timeLeft / 60).toString().padStart(2, '0');
    const s = (timeLeft % 60).toString().padStart(2, '0');
    document.getElementById('cycle-timer').innerText = `${m}:${s}`;
}

// --- LÓGICA QUIZ ---
function loadQuiz() {
    const container = document.getElementById('quiz-container');
    appData.examen.forEach((q, index) => {
        const qDiv = document.createElement('div');
        qDiv.innerHTML = `<p><strong>${index + 1}. ${q.p}</strong></p>`;
        
        q.ops.forEach((op, i) => {
            const btn = document.createElement('button');
            btn.className = 'quiz-option';
            btn.innerText = op;
            btn.onclick = () => validateAnswer(btn, i, q.correcta, q.info);
            qDiv.appendChild(btn);
        });
        container.appendChild(qDiv);
    });
}

function validateAnswer(btn, selected, correct, info) {
    const parent = btn.parentElement;
    const buttons = parent.querySelectorAll('button');
    buttons.forEach(b => b.disabled = true); // Bloquear respuestas

    if (selected === correct) {
        btn.classList.add('correct');
        alert("¡Correcto!");
    } else {
        btn.classList.add('incorrect');
        buttons[correct].classList.add('correct'); // Mostrar la correcta
        alert(`Incorrecto. ${info}`);
    }
}
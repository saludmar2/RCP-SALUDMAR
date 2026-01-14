// --- VARIABLES GLOBALES DEL QUIZ ---
let currentQuestions = [];
let userScore = 0;
const TEACHER_PIN = "174506"; // Contraseña solicitada

// --- FUNCIÓN DE BARAJADO (Fisher-Yates) ---
// Garantiza que el examen siempre tenga un orden diferente
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// --- CARGAR QUIZ ---
function loadQuiz() {
    const container = document.getElementById('quiz-container');
    container.innerHTML = ''; // Limpiar anterior
    document.getElementById('result-area').classList.add('hidden-section');
    document.getElementById('verification-message').classList.add('hidden-section');
    document.getElementById('teacher-pin').value = '';
    
    // 1. Obtener preguntas y barajarlas
    // Nota: Como pediste 10 preguntas y el JSON tiene 10, se usarán todas pero en orden distinto.
    // Si tuvieras un banco de 50, podrías usar .slice(0, 10) después del shuffle.
    currentQuestions = shuffleArray([...appData.examen_pool]).slice(0, 10);
    userScore = 0;

    // 2. Renderizar
    currentQuestions.forEach((q, index) => {
        const qDiv = document.createElement('div');
        qDiv.className = 'question-card';
        qDiv.innerHTML = `<p class="q-title"><strong>${index + 1}. ${q.pregunta}</strong></p>`;
        
        const optionsDiv = document.createElement('div');
        optionsDiv.className = 'options-grid';

        // Barajar también las opciones para evitar patrones visuales
        // Guardamos el índice original para validar
        let optionsWithIndex = q.opciones.map((val, idx) => ({val, idx}));
        optionsWithIndex = shuffleArray(optionsWithIndex);

        optionsWithIndex.forEach((optObj) => {
            const btn = document.createElement('button');
            btn.className = 'quiz-option';
            btn.innerText = optObj.val;
            btn.onclick = () => handleAnswer(btn, optObj.idx, q.respuesta_correcta, qDiv);
            optionsDiv.appendChild(btn);
        });
        
        qDiv.appendChild(optionsDiv);
        container.appendChild(qDiv);
    });
}

// --- MANEJO DE RESPUESTAS ---
function handleAnswer(btn, selectedIdx, correctIdx, parentDiv) {
    // Bloquear todos los botones de esa pregunta
    const allBtns = parentDiv.querySelectorAll('button');
    allBtns.forEach(b => b.disabled = true);

    if (selectedIdx === correctIdx) {
        btn.classList.add('correct');
        userScore++;
    } else {
        btn.classList.add('incorrect');
        // Buscar y resaltar la correcta visualmente para feedback inmediato
        // Nota: Como barajamos las opciones, hay que buscar por texto o lógica, 
        // pero para simplificar visualmente marcamos el error.
    }
    
    // Verificar si terminamos
    const totalAnswered = document.querySelectorAll('.quiz-option:disabled').length;
    // Dividimos por 4 porque hay 4 opciones por pregunta (ajustar si varía)
    // Mejor lógica: Contar cuántas preguntas (question-card) tienen botones desactivados
    const answeredQuestions = document.querySelectorAll('.question-card button:disabled').length / 4;
    
    if (answeredQuestions >= currentQuestions.length) {
        showFinalResults();
    }
}

function showFinalResults() {
    const resultArea = document.getElementById('result-area');
    const scoreDisplay = document.getElementById('score-display');
    const feedback = document.getElementById('feedback-text');
    
    resultArea.classList.remove('hidden-section');
    scoreDisplay.innerText = `${userScore} / 10`;
    
    if (userScore >= 8) {
        scoreDisplay.style.borderColor = "var(--success-green)";
        feedback.innerHTML = "<strong>¡Excelente!</strong> Dominas las guías 2025.";
    } else {
        scoreDisplay.style.borderColor = "var(--emergency-red)";
        feedback.innerHTML = "Debes repasar los protocolos. Intenta de nuevo.";
    }
    
    // Scroll al resultado
    resultArea.scrollIntoView({behavior: "smooth"});
}

// --- VERIFICACIÓN DOCENTE ---
function verifyScore() {
    const input = document.getElementById('teacher-pin').value;
    const msgDiv = document.getElementById('verification-message');
    
    if (input === TEACHER_PIN) {
        const date = new Date().toLocaleString();
        msgDiv.innerHTML = `
            <div class="verified-badge">
                ✅ <strong>NOTA VERIFICADA</strong><br>
                Instructor: Autorizado<br>
                Fecha: ${date}<br>
                Calificación: <strong>${userScore}/10</strong>
            </div>
        `;
        msgDiv.classList.remove('hidden-section');
        // Deshabilitar input para evitar múltiples clicks
        document.getElementById('teacher-pin').disabled = true;
    } else {
        alert("⛔ PIN Incorrecto. Solo personal autorizado.");
        document.getElementById('teacher-pin').value = '';
    }
}

function restartQuiz() {
    document.getElementById('teacher-pin').disabled = false;
    loadQuiz();
    window.scrollTo(0,0);
}

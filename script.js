document.addEventListener('DOMContentLoaded', () => {
    const firebaseConfig = {
        apiKey: "AIzaSyDDDcWF_CSaakQi-IYPLYAEyTyCyyxyV4E",
        authDomain: "uteropop-9294a.firebaseapp.com",
        projectId: "uteropop-9294a",
        storageBucket: "uteropop-9294a.firebasestorage.app",
        messagingSenderId: "255344646647",
        appId: "1:255344646647:web:9f1bf99f272d6dfa7836f2"
      };

    // Inicializa o Firebase
    firebase.initializeApp(firebaseConfig);
    const auth = firebase.auth();
    const provider = new firebase.auth.GoogleAuthProvider();

    // Elementos do DOM
    const loginScreen = document.getElementById('login-screen');
    const pamphletScreen = document.getElementById('pamphlet-screen');
    const quizScreen = document.getElementById('quiz-screen');
    
    const loginBtn = document.getElementById('login-btn');
    const startQuizBtn = document.getElementById('start-quiz-btn');
    const pamphletContainer = document.querySelector('.pamphlet-container');

    const questionContainer = document.getElementById('question-container');
    const questionText = document.getElementById('question-text');
    const answerButtons = document.getElementById('answer-buttons');
    const quizResults = document.getElementById('quiz-results');
    const scoreText = document.getElementById('score-text');
    const restartQuizBtn = document.getElementById('restart-quiz-btn');

    // === LÓGICA DE AUTENTICAÇÃO ===
    loginBtn.addEventListener('click', () => {
        auth.signInWithPopup(provider).catch(error => {
            console.error("Erro no login com Google:", error);
            alert("Não foi possível fazer o login. Tente novamente.");
        });
    });

    auth.onAuthStateChanged(user => {
        if (user) {
            // Usuário está logado
            showScreen('pamphlet');
            initPamphlet();
        } else {
            // Usuário não está logado
            showScreen('login');
        }
    });

    function showScreen(screenName) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        document.getElementById(`${screenName}-screen`).classList.add('active');
    }
    
    // === LÓGICA DA CARTILHA INTERATIVA ===
    const pamphletSections = [
        { id: 'cover', img: 'capa_menarca.jpeg', fold: true },
        { id: 'wordsearch', img: 'caca_palavras.jpeg', fold: true },
        { id: 'anatomy', img: 'anatomia_vulva.jpeg', fold: true },
        { id: 'cycle', img: 'como_funciona_ciclo.jpeg', fold: true },
        { id: 'hygiene', img: 'dicas_higiene.jpeg', fold: true },
        { id: 'myths', img: 'mitos_e_verdades.jpeg', fold: true },
        { id: 'pain-relief', img: 'alivio_da_dor.jpeg', fold: true }
    ];
    let currentFold = 0;

    function initPamphlet() {
        pamphletContainer.innerHTML = '';
        pamphletSections.forEach(section => {
            const sectionEl = document.createElement('div');
            sectionEl.id = `section-${section.id}`;
            sectionEl.classList.add('pamphlet-section', 'folded');
            sectionEl.innerHTML = `<img src="images/${section.img}" alt="Seção ${section.id}">`;
            pamphletContainer.appendChild(sectionEl);
        });
        
        unfoldNext();
    }
    
    function unfoldNext() {
        if (currentFold < pamphletSections.length) {
            const sectionToUnfold = document.getElementById(`section-${pamphletSections[currentFold].id}`);
            if (sectionToUnfold) {
                setTimeout(() => {
                    sectionToUnfold.classList.remove('folded');
                    sectionToUnfold.classList.add('is-opening');
                    sectionToUnfold.addEventListener('click', unfoldNext, { once: true });
                }, 100);
                 currentFold++;
            }
        } else {
            // Todas as seções foram abertas
            pamphletContainer.querySelectorAll('.pamphlet-section').forEach(el => el.style.cursor = 'default');
            startQuizBtn.classList.remove('hidden');
        }
    }


    // === LÓGICA DO QUIZ ===
    startQuizBtn.addEventListener('click', startQuiz);
    restartQuizBtn.addEventListener('click', startQuiz);

    const quizQuestions = [
        {
            question: "A menarca (primeira menstruação) geralmente acontece entre qual idade?",
            answers: [
                { text: "6 e 10 anos", correct: false },
                { text: "8 e 14 anos", correct: true },
                { text: "15 e 18 anos", correct: false },
                { text: "Apenas aos 12 anos", correct: false }
            ]
        },
        {
            question: "O que é recomendado na cartilha para aliviar cólicas menstruais?",
            answers: [
                { text: "Tomar banho gelado", correct: false },
                { text: "Evitar qualquer atividade física", correct: false },
                { text: "Usar bolsa de água morna e fazer massagens", correct: true },
                { text: "Comer muito chocolate", correct: false }
            ]
        },
        {
            question: "Segundo a cartilha, é verdade que não se pode lavar o cabelo menstruada?",
            answers: [
                { text: "Sim, é muito perigoso para a saúde.", correct: false },
                { text: "Não, isso é um mito. A higiene deve ser mantida normalmente.", correct: true },
                { text: "Depende da fase da lua.", correct: false }
            ]
        },
        {
            question: "Qual o nome da parte EXTERNA do sistema reprodutor feminino, mostrado na cartilha?",
            answers: [
                { text: "Útero", correct: false },
                { text: "Vagina", correct: false },
                { text: "Ovário", correct: false },
                { text: "Vulva", correct: true }
            ]
        }
    ];

    let currentQuestionIndex;
    let score;

    function startQuiz() {
        showScreen('quiz');
        quizResults.classList.add('hidden');
        questionContainer.classList.remove('hidden');
        currentQuestionIndex = 0;
        score = 0;
        showQuestion(quizQuestions[currentQuestionIndex]);
    }

    function showQuestion(question) {
        questionText.innerText = question.question;
        answerButtons.innerHTML = '';
        question.answers.forEach(answer => {
            const button = document.createElement('button');
            button.innerText = answer.text;
            button.classList.add('btn-answer');
            if (answer.correct) {
                button.dataset.correct = answer.correct;
            }
            button.addEventListener('click', selectAnswer);
            answerButtons.appendChild(button);
        });
    }

    function selectAnswer(e) {
        const selectedBtn = e.target;
        const correct = selectedBtn.dataset.correct === "true";
        
        if (correct) {
            score++;
        }

        Array.from(answerButtons.children).forEach(button => {
            setStatusClass(button, button.dataset.correct === "true");
        });

        setTimeout(() => {
            currentQuestionIndex++;
            if (currentQuestionIndex < quizQuestions.length) {
                showQuestion(quizQuestions[currentQuestionIndex]);
            } else {
                showResults();
            }
        }, 1500); // Espera 1.5s antes de ir para a próxima pergunta
    }

    function setStatusClass(element, correct) {
        clearStatusClass(element);
        if (correct) {
            element.classList.add('correct');
        } else {
            element.classList.add('wrong');
        }
    }

    function clearStatusClass(element) {
        element.classList.remove('correct');
        element.classList.remove('wrong');
    }

    function showResults() {
        questionContainer.classList.add('hidden');
        quizResults.classList.remove('hidden');
        scoreText.innerText = `Você acertou ${score} de ${quizQuestions.length} perguntas! Parabéns por buscar conhecimento!`;
    }
});
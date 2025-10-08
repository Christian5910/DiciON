// javinhas.js - CORRIGIDO E OTIMIZADO

// Estado do jogo
let palavraSecreta = "";
let tentativas = [];
let tentativaAtual = "";
let jogoAcabou = false;
let PALAVRAS = []; // Será carregada do JSON

// Elementos DOM
const grid = document.getElementById("grid");
const keyboard = document.getElementById("keyboard");
const messageArea = document.getElementById("message-area");
const restartBtn = document.getElementById("restart-btn");

// Carregar palavras do JSON
async function carregarPalavras() {
    try {
        const response = await fetch('palavras.json');
        PALAVRAS = await response.json();
        // Converter para maiúsculas
        PALAVRAS = PALAVRAS.map(palavra => palavra.toUpperCase());
        console.log(`Carregadas ${PALAVRAS.length} palavras`);
        init(); // Inicializar jogo depois de carregar as palavras
    } catch (error) {
        console.error('Erro ao carregar palavras:', error);
        // Lista de fallback caso o JSON não carregue
        PALAVRAS = ["ABRIR", "AMIGO", "BANCO", "CASAL", "DIZER", "ESTAR", "FALAR", "GRITO"];
        init();
    }
}

// Inicialização
function init() {
    // Selecionar palavra secreta aleatória
    if (PALAVRAS.length === 0) {
        console.error("Nenhuma palavra disponível!");
        return;
    }
    
    palavraSecreta = PALAVRAS[Math.floor(Math.random() * PALAVRAS.length)];
    console.log("Palavra secreta:", palavraSecreta); // Para debug
    
    criarGrid();
    criarTeclado();
    adicionarEventListeners();
    
    // Resetar estado
    tentativas = [];
    tentativaAtual = "";
    jogoAcabou = false;
    messageArea.textContent = "";
    messageArea.className = "";
    
    // Resetar cores do teclado
    document.querySelectorAll('.key').forEach(tecla => {
        tecla.classList.remove('correta', 'semi-correta', 'errada');
    });
}

// Criar grade do jogo
function criarGrid() {
    grid.innerHTML = "";
    for (let i = 0; i < 6; i++) {
        const linha = document.createElement("div");
        linha.className = "linha";
        for (let j = 0; j < 5; j++) {
            const celula = document.createElement("div");
            celula.className = "celula";
            celula.dataset.linha = i;
            celula.dataset.coluna = j;
            linha.appendChild(celula);
        }
        grid.appendChild(linha);
    }
}

// Criar teclado virtual BONITINHO E RESPONSIVO - CORRIGIDO
function criarTeclado() {
    const teclas = [
        ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
        ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
        ["BACKSPACE", "Z", "X", "C", "V", "B", "N", "M", "ENTER"]   
        ];

    keyboard.innerHTML = "";
    
    teclas.forEach((linhaTeclas, index) => {
        const linhaDiv = document.createElement("div");
        linhaDiv.className = "teclado-linha";
        
        // 💬 REMOVIDO TODO CSS INLINE - Agora só classes CSS responsivas
        
        linhaTeclas.forEach(tecla => {
            const botao = document.createElement("button");
            botao.className = "key";
            botao.textContent = tecla;
            botao.dataset.key = tecla;
            
            if (tecla === "ENTER" || tecla === "BACKSPACE") {
                botao.classList.add(tecla.toLowerCase());
                if (tecla === "BACKSPACE") {
                    botao.innerHTML = "⌫";
                }
            }
            // 💬 REMOVIDO: botao.style.flex, botao.style.maxWidth, botao.style.fontSize
            // Agora o CSS controla totalmente a responsividade
            
            botao.addEventListener("click", () => handleTeclaPress(tecla));
            linhaDiv.appendChild(botao);
        });
        
        keyboard.appendChild(linhaDiv);
    });
}

// Adicionar event listeners
function adicionarEventListeners() {
    document.addEventListener("keydown", handleKeyDown);
    restartBtn.addEventListener("click", init);
}

// Manipular teclado físico
function handleKeyDown(e) {
    if (jogoAcabou) return;
    
    const key = e.key.toUpperCase();
    
    if (key === "ENTER") {
        submeterTentativa();
    } else if (key === "BACKSPACE") {
        apagarLetra();
    } else if (/^[A-ZÀ-Ü]$/.test(key) && key.length === 1) {
        adicionarLetra(key);
    }
}

// Manipular teclado virtual
function handleTeclaPress(tecla) {
    if (jogoAcabou) return;
    
    if (tecla === "ENTER") {
        submeterTentativa();
    } else if (tecla === "BACKSPACE") {
        apagarLetra();
    } else if (tecla.length === 1) {
        adicionarLetra(tecla);
    }
}

// Adicionar letra à tentativa atual
function adicionarLetra(letra) {
    if (tentativaAtual.length < 5) {
        tentativaAtual += letra;
        atualizarGrid();
    }
}

// Apagar letra
function apagarLetra() {
    if (tentativaAtual.length > 0) {
        tentativaAtual = tentativaAtual.slice(0, -1);
        atualizarGrid();
    }
}

// Atualizar visual da grade
function atualizarGrid() {
    const linhas = document.querySelectorAll(".linha");
    const linhaAtual = linhas[tentativas.length];
    
    if (linhaAtual) {
        const celulas = linhaAtual.querySelectorAll(".celula");
        celulas.forEach((celula, index) => {
            celula.textContent = tentativaAtual[index] || "";
            
            // 💬 CORREÇÃO: Resetar animações ao atualizar
            celula.style.animation = 'none';
            setTimeout(() => {
                celula.style.animation = '';
            }, 10);
        });
    }
}

// Submeter tentativa
function submeterTentativa() {
    if (tentativaAtual.length !== 5) {
        mostrarMensagem("Preencha todas as 5 letras!", "error");
        animarShake();
        return;
    }
    
    if (!PALAVRAS.includes(tentativaAtual)) {
        mostrarMensagem("Palavra não encontrada no dicionário!", "error");
        animarShake();
        return;
    }
    
    // Processar tentativa
    tentativas.push(tentativaAtual);
    processarFeedback();
    
    // Verificar fim de jogo
    if (tentativaAtual === palavraSecreta) {
        jogoAcabou = true;
        mostrarMensagem(`🎉 Parabéns! Você acertou em ${tentativas.length} tentativa${tentativas.length > 1 ? 's' : ''}!`, "victory");
        animarVitoria();
    } else if (tentativas.length >= 6) {
        jogoAcabou = true;
        mostrarMensagem(`Fim de jogo! A palavra era: ${palavraSecreta}`, "defeat");
    }
    
    tentativaAtual = "";
}

// Processar feedback de cores
function processarFeedback() {
    const tentativa = tentativas[tentativas.length - 1];
    const linhaIndex = tentativas.length - 1;
    const linha = document.querySelectorAll(".linha")[linhaIndex];
    const celulas = linha.querySelectorAll(".celula");
    
    // Arrays para controlar letras já processadas
    const letrasProcessadas = Array(5).fill(false);
    const letrasSecretas = Array(5).fill(false);
    
    // Primeira passada: marcar verdes (posição correta)
    for (let i = 0; i < 5; i++) {
        if (tentativa[i] === palavraSecreta[i]) {
            celulas[i].classList.add("correta");
            letrasProcessadas[i] = true;
            letrasSecretas[i] = true;
            atualizarTecla(tentativa[i], "correta");
        }
    }
    
    // Segunda passada: marcar amarelos (letra existe mas posição errada)
    for (let i = 0; i < 5; i++) {
        if (!letrasProcessadas[i]) {
            const letra = tentativa[i];
            let encontrou = false;
            
            // Procurar a letra em posições não marcadas como verdes
            for (let j = 0; j < 5; j++) {
                if (!letrasSecretas[j] && palavraSecreta[j] === letra) {
                    encontrou = true;
                    letrasSecretas[j] = true;
                    break;
                }
            }
            
            if (encontrou) {
                celulas[i].classList.add("semi-correta");
                atualizarTecla(letra, "semi-correta");
            } else {
                celulas[i].classList.add("errada");
                atualizarTecla(letra, "errada");
            }
            
            letrasProcessadas[i] = true;
        }
    }
}

// Atualizar cor da tecla no teclado virtual
function atualizarTecla(letra, estado) {
    const teclas = document.querySelectorAll(`.key[data-key="${letra}"]`);
    
    teclas.forEach(tecla => {
        // Só atualiza se não for um estado melhor
        if (tecla.classList.contains("correta")) return;
        if (estado === "correta" || (estado === "semi-correta" && !tecla.classList.contains("correta"))) {
            tecla.classList.remove("semi-correta", "errada");
            tecla.classList.add(estado);
        } else if (estado === "errada" && !tecla.classList.contains("correta") && !tecla.classList.contains("semi-correta")) {
            tecla.classList.remove("semi-correta");
            tecla.classList.add("errada");
        }
    });
}

// Animação de shake para erro
function animarShake() {
    const linhaAtual = document.querySelectorAll(".linha")[tentativas.length];
    if (linhaAtual) {
        linhaAtual.classList.add("shake");
        setTimeout(() => {
            linhaAtual.classList.remove("shake");
        }, 320);
    }
}

// Animação de vitória
function animarVitoria() {
    const linhaAtual = document.querySelectorAll(".linha")[tentativas.length - 1];
    if (linhaAtual) {
        const celulas = linhaAtual.querySelectorAll(".celula");
        celulas.forEach((celula, index) => {
            setTimeout(() => {
                celula.style.transform = "scale(1.1)";
                setTimeout(() => {
                    celula.style.transform = "scale(1)";
                }, 150);
            }, index * 100);
        });
    }
}

// Mostrar mensagens
function mostrarMensagem(mensagem, tipo = "") {
    messageArea.textContent = mensagem;
    messageArea.className = tipo;
    
    if (tipo === "error") {
        setTimeout(() => {
            messageArea.textContent = "";
            messageArea.className = "";
        }, 2000);
    }
}

// Drawer e Modal
document.addEventListener('DOMContentLoaded', () => {
    // Carregar palavras e inicializar jogo
    carregarPalavras();
    
    // Drawer lateral
    const menuBtn = document.getElementById('menu-btn');
    const closeDrawer = document.getElementById('close-drawer');
    const drawer = document.getElementById('drawer');
    const overlay = document.getElementById('overlay');

    function openDrawer() {
        drawer.classList.add('open');
        drawer.setAttribute('aria-hidden', 'false');
        overlay.hidden = false;
        document.body.style.overflow = 'hidden';
    }

    function closeDrawerFunc() {
        drawer.classList.remove('open');
        drawer.setAttribute('aria-hidden', 'true');
        overlay.hidden = true;
        document.body.style.overflow = '';
    }

    menuBtn.addEventListener('click', openDrawer);
    closeDrawer.addEventListener('click', closeDrawerFunc);
    overlay.addEventListener('click', closeDrawerFunc);

    // Modal Como Jogar
    const howtoBtn = document.getElementById('howto-btn');
    const closeHowto = document.getElementById('close-howto');
    const howtoModal = document.getElementById('howto-modal');

    howtoBtn.addEventListener('click', () => {
        howtoModal.setAttribute('aria-hidden', 'false');
        overlay.hidden = false;
        document.body.style.overflow = 'hidden';
    });

    closeHowto.addEventListener('click', () => {
        howtoModal.setAttribute('aria-hidden', 'true');
        overlay.hidden = true;
        document.body.style.overflow = '';
    });

    overlay.addEventListener('click', () => {
        howtoModal.setAttribute('aria-hidden', 'true');
        overlay.hidden = true;
        document.body.style.overflow = '';
    });
});

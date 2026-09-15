const canvas = document.getElementById("jogo");
const ctx = canvas.getContext("2d");

const pontosTexto = document.getElementById("pontos");
const vidasTexto = document.getElementById("vidas");
const faseTexto = document.getElementById("fase");
const mensagem = document.getElementById("mensagem");

let pontos = 0;
let vidas = 3;
let fase = 1;
const pontuacaoMaxima = 100;
let jogoAtivo = true;

const nave = { x: 375, y: 520, largura: 60, altura: 60, velocidade: 5 };

const naveImg = new Image();
naveImg.src = "nave_transparente_final.png";

const teclas = {};
const tiros = [];
const inimigos = [];

let ultimoTiro = 0;
let ultimoInimigo = 0;

document.addEventListener("keydown", (e) => {
    teclas[e.key] = true;
    teclas[e.code] = true;
    if (e.code === "Space") {
        e.preventDefault();
    }
});
document.addEventListener("keyup", (e) => {
    teclas[e.key] = false;
    teclas[e.code] = false;
});

function desenharNave() {
    if (naveImg.complete && naveImg.naturalWidth!== 0) {
        ctx.drawImage(naveImg, nave.x, nave.y, nave.largura, nave.altura);
    }
}

function moverNave() {
    if (teclas["ArrowLeft"] || teclas["a"] || teclas["A"]) nave.x -= nave.velocidade;
    if (teclas["ArrowRight"] || teclas["d"] || teclas["D"]) nave.x += nave.velocidade;
    if (teclas["ArrowUp"] || teclas["w"] || teclas["W"]) nave.y -= nave.velocidade;
    if (teclas["ArrowDown"] || teclas["s"] || teclas["S"]) nave.y += nave.velocidade;
    nave.x = Math.max(0, Math.min(canvas.width - nave.largura, nave.x));
    nave.y = Math.max(0, Math.min(canvas.height - nave.altura, nave.y));
}

function atirar() {
    if (!jogoAtivo) return;
    tiros.push({
        x: nave.x + nave.largura / 2 - 3,
        y: nave.y,
        largura: 6, altura: 15,
        velocidade: 8
    });
}

function atualizarTiros() {
    for (let i = tiros.length - 1; i >= 0; i--) {
        tiros[i].y -= tiros[i].velocidade;
        if (tiros[i].y + tiros[i].altura < 0) tiros.splice(i, 1);
    }
}

function desenharTiros() {
    ctx.fillStyle = "#66ff66";
    tiros.forEach(tiro => ctx.fillRect(tiro.x, tiro.y, tiro.largura, tiro.altura));
}

function criarInimigo() {
    inimigos.push({
        x: Math.random() * (canvas.width - 50),
        y: -50, largura: 50, altura: 50,
        velocidade: 2 + fase * 0.5
    });
}

function atualizarInimigos() {
    for (let i = inimigos.length - 1; i >= 0; i--) {
        inimigos[i].y += inimigos[i].velocidade;
        
        if (inimigos[i].y > canvas.height) {
            inimigos.splice(i, 1);
        }
    }
}

function desenharInimigos() {
    ctx.font = "45px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    inimigos.forEach(inimigo => {
        ctx.fillText("👾", inimigo.x + inimigo.largura / 2, inimigo.y + inimigo.altura / 2);
    });
}

function colidiu(a, b) {
    return a.x < b.x + b.largura && a.x + a.largura > b.x &&
           a.y < b.y + b.altura && a.y + a.altura > b.y;
}

function verificarColisoes() {
    for (let i = tiros.length - 1; i >= 0; i--) {
        for (let j = inimigos.length - 1; j >= 0; j--) {
            if (colidiu(tiros[i], inimigos[j])) {
                tiros.splice(i, 1);
                inimigos.splice(j, 1);
                pontos++;
                if (pontosTexto) pontosTexto.textContent = pontos;
                verificarFase();
                if (pontos >= pontuacaoMaxima) vencerJogo();
                break;
            }
        }
    }
}

function verificarColisaoNave() {
    for (let i = inimigos.length - 1; i >= 0; i--) {
        if (colidiu(nave, inimigos[i])) {
            inimigos.splice(i, 1);
            perderVida();
        }
    }
}

function verificarFase() {
    if (pontos >= 75) fase = 4;
    else if (pontos >= 50) fase = 3;
    else if (pontos >= 25) fase = 2;
    else fase = 1;
    if (faseTexto) faseTexto.textContent = fase;
}

function perderVida() {
    if (!jogoAtivo) return;
    vidas--;
    if (vidasTexto) vidasTexto.textContent = vidas;
    if (vidas <= 0) gameOver();
}

function gameOver() {
    jogoAtivo = false;
    if (mensagem) mensagem.textContent = "GAME OVER";
}

function vencerJogo() {
    jogoAtivo = false;
    if (mensagem) mensagem.textContent = "VOCÊ VENCEU!";
}

function controlarInimigos() {
    const agora = Date.now();
    const intervalos = { 1: 1000, 2: 850, 3: 700, 4: 550 };
    if (agora - ultimoInimigo >= intervalos[fase]) {
        criarInimigo();
        ultimoInimigo = agora;
    }
}

function atualizar() {
    if (!jogoAtivo) return;
    moverNave();

    const agora = Date.now();
    if ((teclas[" "] || teclas["Space"] || teclas["Spacebar"]) && agora - ultimoTiro >= 150) {
        atirar();
        ultimoTiro = agora;
    }

    atualizarTiros();
    atualizarInimigos();
    verificarColisoes();
    verificarColisaoNave();
    controlarInimigos();
}

function desenhar() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    desenharNave();
    desenharTiros();
    desenharInimigos();
}

function loop() {
    atualizar();
    desenhar();
    requestAnimationFrame(loop);
}

loop();

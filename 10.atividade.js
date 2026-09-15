const canvas = document.getElementById("jogo");
const ctx = canvas.getContext("2d");

const pontosTexto = document.getElementById("pontos");
const vidasTexto = document.getElementById("vidas");
const faseTexto = document.getElementById("fase");
const mensagem = document.getElementById("mensagem");

const imgNave = new Image();
imgNave.src = "img/nave.png";

const imgInimigo = new Image();
imgInimigo.src = "img/inimigo.png";

const nave = {
    x: 375,
    y: 520,
    largura: 50,
    altura: 50,
    velocidade: 5
};

const teclas = {};
const tiros = [];
const inimigos = [];
const explosoes = [];

let pontos = 0;
let vidas = 3;
let fase = 1;
let jogoAtivo = true;

let ultimoTiro = 0;
let ultimoInimigo = 0;

const pontuacaoMaxima = 100;

const intervaloInimigos = {
    1: 1000,
    2: 850,
    3: 700,
    4: 550
};

document.addEventListener("keydown", (e) => {
    teclas[e.key] = true;

    if (e.code === "Space") {
        e.preventDefault();
    }

    if ((e.key === "r" || e.key === "R") && !jogoAtivo) {
        reiniciarJogo();
    }
});

document.addEventListener("keyup", (e) => {
    teclas[e.key] = false;
});

function moverNave() {
    if (teclas.ArrowLeft || teclas.a || teclas.A) {
        nave.x -= nave.velocidade;
    }

    if (teclas.ArrowRight || teclas.d || teclas.D) {
        nave.x += nave.velocidade;
    }

    if (teclas.ArrowUp || teclas.w || teclas.W) {
        nave.y -= nave.velocidade;
    }

    if (teclas.ArrowDown || teclas.s || teclas.S) {
        nave.y += nave.velocidade;
    }

    nave.x = Math.max(
        0,
        Math.min(canvas.width - nave.largura, nave.x)
    );

    nave.y = Math.max(
        0,
        Math.min(canvas.height - nave.altura, nave.y)
    );
}

function atirar() {
    tiros.push({
        x: nave.x + nave.largura / 2 - 3,
        y: nave.y,
        largura: 6,
        altura: 15,
        velocidade: 8
    });
}

function atualizarTiros() {
    for (let i = tiros.length - 1; i >= 0; i--) {
        const tiro = tiros[i];

        tiro.y -= tiro.velocidade;

        if (tiro.y + tiro.altura < 0) {
            tiros.splice(i, 1);
        }
    }
}

function desenharTiros() {
    ctx.fillStyle = "#66ff66";

    tiros.forEach((tiro) => {
        ctx.fillRect(
            tiro.x,
            tiro.y,
            tiro.largura,
            tiro.altura
        );
    });
}

function criarInimigo() {
    inimigos.push({
        x: Math.random() * (canvas.width - 50),
        y: -50,
        largura: 50,
        altura: 50,
        velocidade: 2 + fase * 0.5
    });
}

function atualizarInimigos() {
    for (let i = inimigos.length - 1; i >= 0; i--) {
        const inimigo = inimigos[i];

        inimigo.y += inimigo.velocidade;

        if (inimigo.y > canvas.height) {
            inimigos.splice(i, 1);
        }
    }
}

function criarExplosao(x, y) {
    explosoes.push({
        x,
        y,
        tempo: 0,
        duracao: 25
    });
}

function atualizarExplosoes() {
    for (let i = explosoes.length - 1; i >= 0; i--) {
        const explosao = explosoes[i];

        explosao.tempo++;

        if (explosao.tempo >= explosao.duracao) {
            explosoes.splice(i, 1);
        }
    }
}

function verificarColisao(a, b) {
    return (
        a.x < b.x + b.largura &&
        a.x + a.largura > b.x &&
        a.y < b.y + b.altura &&
        a.y + a.altura > b.y
    );
}

function verificarColisoes() {
    for (let i = tiros.length - 1; i >= 0; i--) {
        for (let j = inimigos.length - 1; j >= 0; j--) {

            if (!verificarColisao(tiros[i], inimigos[j])) {
                continue;
            }

            criarExplosao(
                inimigos[j].x,
                inimigos[j].y
            );

            tiros.splice(i, 1);
            inimigos.splice(j, 1);

            pontos++;
            pontosTexto.textContent = pontos;

            atualizarFase();

            if (pontos >= pontuacaoMaxima) {
                vencerJogo();
            }

            break;
        }
    }

    for (let i = inimigos.length - 1; i >= 0; i--) {
        if (!verificarColisao(nave, inimigos[i])) {
            continue;
        }

        criarExplosao(
            inimigos[i].x,
            inimigos[i].y
        );

        inimigos.splice(i, 1);

        perderVida();
    }
}

function atualizarFase() {
    if (pontos >= 75) {
        fase = 4;
    } else if (pontos >= 50) {
        fase = 3;
    } else if (pontos >= 25) {
        fase = 2;
    } else {
        fase = 1;
    }

    faseTexto.textContent = fase;
}

function perderVida() {
    if (!jogoAtivo) {
        return;
    }

    vidas--;
    vidasTexto.textContent = vidas;

    if (vidas <= 0) {
        gameOver();
    }
}

function gameOver() {
    jogoAtivo = false;
    mensagem.textContent = "GAME OVER - Aperte R";
}

function vencerJogo() {
    jogoAtivo = false;
    mensagem.textContent = "VOCÊ VENCEU! - Aperte R";
}

function reiniciarJogo() {
    pontos = 0;
    vidas = 3;
    fase = 1;
    jogoAtivo = true;

    tiros.length = 0;
    inimigos.length = 0;
    explosoes.length = 0;

    nave.x = 375;
    nave.y = 520;

    ultimoTiro = 0;
    ultimoInimigo = Date.now();

    pontosTexto.textContent = "0";
    vidasTexto.textContent = "3";
    faseTexto.textContent = "1";
    mensagem.textContent = "";
}

function controlarTiros() {
    if (!teclas[" "]) {
        return;
    }

    const agora = Date.now();

    if (agora - ultimoTiro >= 120) {
        atirar();
        ultimoTiro = agora;
    }
}

function controlarInimigos() {
    const agora = Date.now();

    if (
        agora - ultimoInimigo >= intervaloInimigos[fase]
    ) {
        criarInimigo();
        ultimoInimigo = agora;
    }
}

function atualizar() {
    if (!jogoAtivo) {
        return;
    }

    moverNave();
    controlarTiros();
    atualizarTiros();
    atualizarInimigos();
    atualizarExplosoes();
    verificarColisoes();
    controlarInimigos();
}

function desenharNave() {
    ctx.drawImage(
        imgNave,
        nave.x,
        nave.y,
        nave.largura,
        nave.altura
    );
}

function desenharInimigos() {
    inimigos.forEach((inimigo) => {
        ctx.drawImage(
            imgInimigo,
            inimigo.x,
            inimigo.y,
            inimigo.largura,
            inimigo.altura
        );
    });
}

function desenharExplosoes() {
    ctx.font = "35px Arial";
    ctx.textAlign = "center";

    explosoes.forEach((explosao) => {
        ctx.fillText(
            "💥",
            explosao.x + 25,
            explosao.y + 30
        );
    });
}

function desenhar() {
    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    desenharNave();
    desenharTiros();
    desenharInimigos();
    desenharExplosoes();
}

function loop() {
    atualizar();
    desenhar();

    requestAnimationFrame(loop);
}

loop();

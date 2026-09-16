const canvas = document.getElementById("canvas");

if (!canvas) {
    console.error("Erro: o elemento #canvas não foi encontrado no HTML.");
} else {

    const ctx = canvas.getContext("2d");

    const pontosTexto = document.getElementById("pontos");
    const vidasTexto = document.getElementById("vidas");
    const faseTexto = document.getElementById("fase");
    const mensagem = document.getElementById("mensagem");
    const botaoReset = document.getElementById("reset");

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
    const tirosInimigos = [];
    const inimigos = [];
    const explosoes = [];

    let pontos = 0;
    let vidas = 3;
    let fase = 1;
    let jogoAtivo = true;

    let ultimoTiro = 0;
    let ultimoInimigo = 0;
    let ultimoTiroInimigo = 0;

    const pontuacaoMaxima = 100;

    const intervaloInimigos = {
        1: 1000,
        2: 850,
        3: 700,
        4: 550
    };

    const intervaloTirosInimigos = {
        1: 1800,
        2: 1500,
        3: 1200,
        4: 900
    };

    function atualizarTexto(elemento, valor) {
        if (elemento) {
            elemento.textContent = valor;
        }
    }

    document.addEventListener("keydown", (e) => {
        teclas[e.key] = true;

        if (e.code === "Space") {
            e.preventDefault();
        }
    });

    document.addEventListener("keyup", (e) => {
        teclas[e.key] = false;
    });

    function controlarBotao(botao, tecla) {

        if (!botao) {
            return;
        }

        botao.addEventListener("pointerdown", (e) => {
            e.preventDefault();
            teclas[tecla] = true;
        });

        botao.addEventListener("pointerup", (e) => {
            e.preventDefault();
            teclas[tecla] = false;
        });

        botao.addEventListener("pointerleave", () => {
            teclas[tecla] = false;
        });

        botao.addEventListener("pointercancel", () => {
            teclas[tecla] = false;
        });
    }

    controlarBotao(
        document.getElementById("cima"),
        "ArrowUp"
    );

    controlarBotao(
        document.getElementById("baixo"),
        "ArrowDown"
    );

    controlarBotao(
        document.getElementById("esquerda"),
        "ArrowLeft"
    );

    controlarBotao(
        document.getElementById("direita"),
        "ArrowRight"
    );

    controlarBotao(
        document.getElementById("atirar"),
        " "
    );

    if (botaoReset) {
        botaoReset.addEventListener("click", () => {
            reiniciarJogo();
        });
    }

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
            Math.min(
                canvas.width - nave.largura,
                nave.x
            )
        );

        nave.y = Math.max(
            0,
            Math.min(
                canvas.height - nave.altura,
                nave.y
            )
        );
    }

    function atirar() {

        if (!jogoAtivo) {
            return;
        }

        tiros.push({
            x: nave.x + nave.largura / 2 - 3,
            y: nave.y,
            largura: 6,
            altura: 15,
            velocidade: 8
        });
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

    function controlarInimigos() {

        const agora = Date.now();

        if (
            agora - ultimoInimigo >=
            intervaloInimigos[fase]
        ) {
            criarInimigo();
            ultimoInimigo = agora;
        }
    }

    function atirarInimigo(inimigo) {

        tirosInimigos.push({
            x: inimigo.x + inimigo.largura / 2 - 3,
            y: inimigo.y + inimigo.altura,
            largura: 6,
            altura: 15,
            velocidade: 5
        });
    }

    function controlarTirosInimigos() {

        if (inimigos.length === 0) {
            return;
        }

        const agora = Date.now();

        if (
            agora - ultimoTiroInimigo >=
            intervaloTirosInimigos[fase]
        ) {

            const inimigo =
                inimigos[
                    Math.floor(
                        Math.random() * inimigos.length
                    )
                ];

            if (inimigo) {
                atirarInimigo(inimigo);
                ultimoTiroInimigo = agora;
            }
        }
    }

    function atualizarTirosInimigos() {

        for (
            let i = tirosInimigos.length - 1;
            i >= 0;
            i--
        ) {

            const tiro = tirosInimigos[i];

            tiro.y += tiro.velocidade;

            if (tiro.y > canvas.height) {
                tirosInimigos.splice(i, 1);
            }
        }
    }

    function desenharTirosInimigos() {

        ctx.fillStyle = "#ff3333";

        tirosInimigos.forEach((tiro) => {

            ctx.fillRect(
                tiro.x,
                tiro.y,
                tiro.largura,
                tiro.altura
            );
        });
    }

    function criarExplosao(x, y) {

        explosoes.push({
            x: x,
            y: y,
            tempo: 0,
            duracao: 25
        });
    }

    function atualizarExplosoes() {

        for (
            let i = explosoes.length - 1;
            i >= 0;
            i--
        ) {

            explosoes[i].tempo++;

            if (
                explosoes[i].tempo >=
                explosoes[i].duracao
            ) {
                explosoes.splice(i, 1);
            }
        }
    }

    function verificarColisao(a, b) {

        if (!a || !b) {
            return false;
        }

        return (
            a.x < b.x + b.largura &&
            a.x + a.largura > b.x &&
            a.y < b.y + b.altura &&
            a.y + a.altura > b.y
        );
    }

    function verificarColisoes() {

        for (let i = tiros.length - 1; i >= 0; i--) {

            const tiro = tiros[i];

            if (!tiro) {
                continue;
            }

            for (
                let j = inimigos.length - 1;
                j >= 0;
                j--
            ) {

                const inimigo = inimigos[j];

                if (!inimigo) {
                    continue;
                }

                if (
                    !verificarColisao(
                        tiro,
                        inimigo
                    )
                ) {
                    continue;
                }

                criarExplosao(
                    inimigo.x,
                    inimigo.y
                );

                tiros.splice(i, 1);
                inimigos.splice(j, 1);

                pontos++;

                atualizarTexto(
                    pontosTexto,
                    pontos
                );

                atualizarFase();

                if (pontos >= pontuacaoMaxima) {
                    vencerJogo();
                }

                break;
            }
        }

        for (
            let i = tirosInimigos.length - 1;
            i >= 0;
            i--
        ) {

            const tiroInimigo =
                tirosInimigos[i];

            if (!tiroInimigo) {
                continue;
            }

            if (
                verificarColisao(
                    nave,
                    tiroInimigo
                )
            ) {

                tirosInimigos.splice(i, 1);

                perderVida();

                if (!jogoAtivo) {
                    break;
                }
            }
        }

        for (
            let i = inimigos.length - 1;
            i >= 0;
            i--
        ) {

            const inimigo = inimigos[i];

            if (!inimigo) {
                continue;
            }

            if (
                !verificarColisao(
                    nave,
                    inimigo
                )
            ) {
                continue;
            }

            criarExplosao(
                inimigo.x,
                inimigo.y
            );

            inimigos.splice(i, 1);

            perderVida();

            if (!jogoAtivo) {
                break;
            }
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

        atualizarTexto(
            faseTexto,
            fase
        );
    }

    function perderVida() {

        if (!jogoAtivo) {
            return;
        }

        vidas--;

        atualizarTexto(
            vidasTexto,
            vidas
        );

        if (vidas <= 0) {
            gameOver();
        }
    }

    function gameOver() {

        jogoAtivo = false;

        atualizarTexto(
            mensagem,
            "GAME OVER"
        );

        if (botaoReset) {
            botaoReset.style.display = "block";
        }
    }

    function vencerJogo() {

        jogoAtivo = false;

        atualizarTexto(
            mensagem,
            "VOCÊ VENCEU!"
        );

        if (botaoReset) {
            botaoReset.style.display = "block";
        }
    }

    function reiniciarJogo() {

        pontos = 0;
        vidas = 3;
        fase = 1;
        jogoAtivo = true;

        tiros.length = 0;
        tirosInimigos.length = 0;
        inimigos.length = 0;
        explosoes.length = 0;

        nave.x =
            canvas.width / 2 -
            nave.largura / 2;

        nave.y =
            canvas.height - 80;

        ultimoTiro = 0;
        ultimoInimigo = Date.now();
        ultimoTiroInimigo = Date.now();

        Object.keys(teclas).forEach((tecla) => {
            teclas[tecla] = false;
        });

        atualizarTexto(
            pontosTexto,
            "0"
        );

        atualizarTexto(
            vidasTexto,
            "3"
        );

        atualizarTexto(
            faseTexto,
            "1"
        );

        atualizarTexto(
            mensagem,
            ""
        );

        if (botaoReset) {
            botaoReset.style.display = "none";
        }
    }

    function desenharNave() {

        if (!imgNave.complete) {
            return;
        }

        ctx.drawImage(
            imgNave,
            nave.x,
            nave.y,
            nave.largura,
            nave.altura
        );
    }

    function desenharInimigos() {

        if (!imgInimigo.complete) {
            return;
        }

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

    function atualizar() {

        if (!jogoAtivo) {
            return;
        }

        moverNave();
        controlarTiros();
        controlarInimigos();
        controlarTirosInimigos();

        atualizarTiros();
        atualizarTirosInimigos();
        atualizarInimigos();
        atualizarExplosoes();

        verificarColisoes();
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
        desenharTirosInimigos();
        desenharInimigos();
        desenharExplosoes();
    }

    function loop() {

        atualizar();
        desenhar();

        requestAnimationFrame(loop);
    }

    loop();
}

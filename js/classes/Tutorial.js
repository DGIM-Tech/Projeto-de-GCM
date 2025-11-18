// js/classes/Tutorial.js

export class Tutorial {
    constructor(jogo) {
        this.jogo = jogo;
        this.indicePasso = 0;
        this.roteiroAtual = [];

        // =====================================================================
        // ROTEIROS MODULARES (PEQUENAS LIÇÕES)
        // =====================================================================

        // 1. INTRODUÇÃO AO XADREZ
        const intro_xadrez = [
            { tipo: 'info', titulo: 'Bem-vindo ao Xadrez!', mensagem: "Este tutorial irá ensinar tudo o que você precisa para jogar sua primeira partida. Vamos começar com o objetivo do jogo." },
            { tipo: 'info', titulo: 'O Objetivo: Xeque-Mate', mensagem: "O objetivo no xadrez é dar 'Xeque-Mate' no Rei do seu oponente. Isso acontece quando o Rei está sob ataque (em 'xeque') e não tem nenhuma casa para escapar." },
            { tipo: 'setup', posicao: { 'e1': 'king-white', 'd2': 'queen-white', 'e8': 'king-black' }, mensagem: "Veja este exemplo simples de Xeque-Mate. O Rei preto não pode se mover para nenhuma casa sem ser capturado." },
            { tipo: 'info', titulo: 'Movimento das Peças', mensagem: "Agora que você sabe o objetivo, vamos aprender como cada peça se move. Cada uma tem um movimento único!" },
        ];

        // 2. GUIA DE MOVIMENTO DAS PEÇAS
        const movimento_pecas = [
            // PEÃO
            { tipo: 'info', titulo: 'O Peão', mensagem: "O Peão é a peça mais numerosa. Ele se move para frente, uma casa por vez. No seu primeiro movimento, ele tem a opção de avançar duas casas." },
            { tipo: 'setup', posicao: { 'e2': 'pawn-white', 'e7': 'pawn-black' } },
            { tipo: 'usuario', origem: 'e2', destino: 'e4', dica: "Mova este peão duas casas para frente, de e2 para e4." },
            { tipo: 'info', titulo: 'Captura do Peão', mensagem: "O Peão captura na diagonal, uma casa para frente. É a única peça que não captura da mesma forma que se move." },
            { tipo: 'setup', posicao: { 'e4': 'pawn-white', 'd5': 'pawn-black' } },
            { tipo: 'usuario', origem: 'e4', destino: 'd5', dica: "Capture o peão preto em d5 com o seu peão." },
            // TORRE
            { tipo: 'info', titulo: 'A Torre', mensagem: "A Torre se move em linhas retas: para frente, para trás e para os lados, quantas casas quiser, desde que o caminho esteja livre." },
            { tipo: 'setup', posicao: { 'a1': 'rook-white', 'a8': 'pawn-black', 'h1': 'pawn-black' } },
            { tipo: 'usuario', origem: 'a1', destino: 'a8', dica: "Mova a Torre para cima para capturar o peão em a8." },
            // CAVALO
            { tipo: 'info', titulo: 'O Cavalo', mensagem: "O Cavalo se move em 'L': duas casas em uma direção (horizontal ou vertical) e depois uma casa para o lado. É a única peça que pode pular sobre outras peças." },
            { tipo: 'setup', posicao: { 'b1': 'knight-white', 'd2': 'pawn-black', 'c3': 'pawn-white' } },
            { tipo: 'usuario', origem: 'b1', destino: 'd2', dica: "Mova o Cavalo em 'L' para capturar o peão em d2, pulando sobre seu próprio peão." },
            // BISPO
            { tipo: 'info', titulo: 'O Bispo', mensagem: "O Bispo se move na diagonal, quantas casas quiser. Cada jogador começa com um bispo nas casas brancas e um nas casas pretas, e eles nunca mudam de cor." },
            { tipo: 'setup', posicao: { 'c1': 'bishop-white', 'f4': 'pawn-black', 'g5': 'pawn-white' } },
            { tipo: 'usuario', origem: 'c1', destino: 'f4', dica: "Mova o Bispo na diagonal para capturar o peão em f4." },
            // DAMA (RAINHA)
            { tipo: 'info', titulo: 'A Dama', mensagem: "A Dama é a peça mais poderosa! Ela combina os movimentos da Torre e do Bispo, movendo-se em qualquer direção (horizontal, vertical ou diagonal) por quantas casas quiser." },
            { tipo: 'setup', posicao: { 'd1': 'queen-white', 'd8': 'pawn-black', 'h5': 'pawn-black' } },
            { tipo: 'usuario', origem: 'd1', destino: 'h5', dica: "Mova a Dama na diagonal para h5 para capturar o peão." },
            // REI
            { tipo: 'info', titulo: 'O Rei', mensagem: "O Rei é a peça mais importante, mas também uma das mais fracas. Ele pode se mover uma casa em qualquer direção." },
            { tipo: 'setup', posicao: { 'e1': 'king-white', 'd2': 'pawn-black' } },
            { tipo: 'usuario', origem: 'e1', destino: 'd2', dica: "Mova o Rei uma casa na diagonal para capturar o peão." },
        ];

        // 3. MOVIMENTOS ESPECIAIS (ROQUE)
        const movimentos_especiais = [
            { tipo: 'info', titulo: 'Movimento Especial: O Roque', mensagem: "O Roque é um movimento defensivo crucial para proteger seu Rei. Ele envolve o Rei e uma das Torres." },
            { tipo: 'info', titulo: 'Regras do Roque', mensagem: "Para fazer o Roque: 1) Nem o Rei nem a Torre podem ter se movido antes. 2) O caminho entre eles deve estar livre. 3) O Rei não pode estar em xeque." },
            { tipo: 'setup', posicao: { 'e1': 'king-white', 'h1': 'rook-white', 'a1': 'rook-white', 'e8': 'king-black' } },
            { tipo: 'usuario', origem: 'e1', destino: 'g1', dica: "Faça o 'Roque Curto'. Mova seu Rei duas casas para a direita, de e1 para g1." },
            { tipo: 'info', titulo: 'Excelente!', mensagem: "Perfeito! Veja como a Torre se moveu automaticamente para o lado do Rei. Agora seu Rei está mais seguro no canto do tabuleiro." },
        ];
        
        // 4. PARTIDA SIMULADA (MAIS LONGA E INSTRUTIVA)
        const partida_instrutiva = [
            { tipo: 'info', titulo: 'Vamos Jogar!', mensagem: "Agora que você conhece as regras, vamos jogar uma partida simulada. Siga as dicas para entender os princípios de uma boa abertura." },
            { tipo: 'setup', posicao: 'inicial' }, // 'inicial' é uma palavra-chave para a posição padrão
            { tipo: 'usuario', origem: 'e2', destino: 'e4', dica: "Lance 1: Controle o centro com o peão do Rei. Este é o lance de abertura mais popular." },
            { tipo: 'auto', origem: 'e7', destino: 'e5', mensagem: "Seu oponente responde da mesma forma, disputando o controle do centro." },
            { tipo: 'usuario', origem: 'g1', destino: 'f3', dica: "Lance 2: Desenvolva seu cavalo. Ele ataca o peão preto em e5 e se prepara para o Roque." },
            { tipo: 'auto', origem: 'b8', destino: 'c6', mensagem: "As pretas também desenvolvem o cavalo, defendendo seu peão." },
            { tipo: 'usuario', origem: 'f1', destino: 'c4', dica: "Lance 3: Desenvolva seu bispo para uma casa ativa. A partir de c4, ele pressiona o ponto fraco f7." },
            { tipo: 'auto', origem: 'g8', destino: 'f6', mensagem: "O oponente desenvolve seu outro cavalo, atacando seu peão em e4." },
            { tipo: 'usuario', origem: 'd2', destino: 'd3', dica: "Lance 4: Defenda seu peão central. Este é um lance sólido que fortalece sua posição." },
            { tipo: 'auto', origem: 'f8', destino: 'c5', mensagem: "As pretas colocam seu bispo em uma posição similar à sua." },
            { tipo: 'usuario', origem: 'e1', destino: 'g1', dica: "Lance 5: Faça o Roque! Coloque seu Rei em segurança para poder focar no ataque." },
            { tipo: 'auto', origem: 'h7', destino: 'h6', mensagem: "As pretas fazem um lance de peão para controlar a casa g5." },
            { tipo: 'usuario', origem: 'c2', destino: 'c3', dica: "Lance 6: Prepare-se para avançar no centro com o peão 'd'. Isso lhe dará mais espaço." },
            { tipo: 'auto', origem: 'e8', destino: 'g8', mensagem: "Seu oponente também faz o Roque, colocando o Rei em segurança." },
            
            { tipo: 'info', titulo: 'Posição Sólida', mensagem: "Ótimo trabalho! Ambos os lados desenvolveram suas peças, protegeram seus Reis e estão prontos para a próxima fase do jogo. A partir daqui, as possibilidades são infinitas!" },
            { tipo: 'conclusao', titulo: 'Tutorial Completo!', mensagem: "Parabéns! Você aprendeu o objetivo do xadrez, o movimento de todas as peças, regras especiais como o Roque e os princípios de uma boa abertura. Você está pronto para jogar!" }
        ];

        // =====================================================================
        // COLEÇÃO DE ROTEIROS COMPLETOS
        // =====================================================================
        this.roteiros = {
            'curso_completo': [
                ...intro_xadrez,
                ...movimento_pecas,
                ...movimentos_especiais,
                ...partida_instrutiva
            ],
            'mate_pastor': [/* roteiro original */], // Pode manter outros se quiser
            'partida_avancada': partida_instrutiva // Permite iniciar só a partida
        };
    }

    iniciar(nomeLicao = 'curso_completo') {
        console.log(`🛡️ Tutorial Iniciado: ${nomeLicao}`);
        this.roteiroAtual = this.roteiros[nomeLicao];
        if (!this.roteiroAtual) {
            console.error(`Lição "${nomeLicao}" não encontrada.`);
            return;
        }

        $('body').off();
        this.executarPassoAtual();
    }

    executarPassoAtual() {
        if (this.indicePasso >= this.roteiroAtual.length) {
            console.log("🛡️ Tutorial Finalizado");
            // A etapa de conclusão já exibe uma mensagem final.
            return;
        }
        const passo = this.roteiroAtual[this.indicePasso];
        $('.square-board').removeClass('tutorial-source tutorial-dest selected last-move');

        switch (passo.tipo) {
            case 'info':
            case 'conclusao':
                this.exibirMensagem(passo.titulo, passo.mensagem, () => this.proximoPasso());
                break;
            case 'setup':
                this.prepararTabuleiro(passo.posicao, passo.mensagem);
                break;
            case 'usuario':
                this.prepararMovimentoUsuario(passo);
                break;
            case 'auto':
                this.executarMovimentoAutomatico(passo);
                break;
        }
    }
    
    prepararTabuleiro(posicao, mensagem) {
        if (posicao === 'inicial') {
            this.jogo.tabuleiro.inicar(); // Usa a função do seu jogo para resetar
        } else {
            $('.square-board').empty();
            for (const casa in posicao) {
                $(`#${casa}`).html(`<div class="piece ${posicao[casa]}"></div>`);
            }
        }
        
        $('.capturadas-brancas, .capturadas-pretas').empty();
        this.jogo.whiteKingMoved = false;
        this.jogo.blackKingMoved = false;
        this.jogo.whiteRooksMoved = { a1: false, h1: false };
        this.jogo.blackRooksMoved = { a8: false, h8: false };

        // Se houver uma mensagem, exibe. Senão, avança direto.
        if (mensagem) {
            this.exibirMensagem("Preparando o Cenário", mensagem, () => this.proximoPasso());
        } else {
            this.proximoPasso();
        }
    }

    proximoPasso() {
        this.indicePasso++;
        this.executarPassoAtual();
    }

    prepararMovimentoUsuario(passo) {
        setTimeout(() => {
            $(`#${passo.origem}`).addClass('tutorial-source');
            $(`#${passo.destino}`).addClass('tutorial-dest');
        }, 50);

        this._mostrarToast(passo.dica, 'info');

        $('body').off('click.tutorial').on('click.tutorial', '.square-board', (e) => {
            e.stopPropagation();
            const casaClicadaId = $(e.currentTarget).attr('id');

            if (casaClicadaId === passo.destino) {
                if ($(`#${passo.origem}`).hasClass('selected')) {
                    $('body').off('click.tutorial');
                    this._realizarMovimento(passo.origem, passo.destino);
                } else {
                    this._mostrarToast("Primeiro, clique na peça para mover (casa amarela).", 'warning');
                }
            } else if (casaClicadaId === passo.origem) {
                $('.square-board').removeClass('selected');
                $(e.currentTarget).addClass('selected');
            } else {
                this._mostrarToast("Movimento incorreto. Siga as casas destacadas.", 'error');
            }
        });
    }

    executarMovimentoAutomatico(passo) {
        $('body').off('click.tutorial');
        // Usamos toast para movimentos automáticos para serem mais rápidos
        this._mostrarToast(passo.mensagem, 'info');
        setTimeout(() => {
             this._realizarMovimento(passo.origem, passo.destino);
            $('.square-board').removeClass('last-move');
            $(`#${passo.origem}, #${passo.destino}`).addClass('last-move');
        }, 1500); // Um delay para o jogador ler o toast
    }

    _realizarMovimento(origem, destino) {
        const pecaEl = $(`#${origem}`).find('.piece');
        const destinoEl = $(`#${destino}`);

        if (!pecaEl.length) {
            console.error(`Tutorial: Peça não encontrada em ${origem}.`);
            return;
        }

        this.jogo.clicou = 1;
        this.jogo.pecaEscolhida = pecaEl;
        this.jogo.ultimaCasa = origem;
        destinoEl.addClass('possible');

        const originalFinalizarTurno = this.jogo.finalizarTurno.bind(this.jogo);
        let turnoFinalizado = false;

        this.jogo.finalizarTurno = (...args) => {
            if (turnoFinalizado) return;
            turnoFinalizado = true;

            originalFinalizarTurno(...args);
            this.jogo.finalizarTurno = originalFinalizarTurno;
            setTimeout(() => this.proximoPasso(), 300);
        };

        const isPromocao = this.jogo._tratarPromocao(pecaEl, destino, origem, null);
        if (!isPromocao) {
            this.jogo._tentarMoverPeca(destinoEl);
        } else {
             this.jogo._executarMovimento(pecaEl, origem, destino);
        }

        destinoEl.removeClass('possible');
        $('.square-board').removeClass('selected tutorial-source tutorial-dest');
    }

    finalizar() {
        $('body').off();
        $('.square-board').removeClass('tutorial-source tutorial-dest selected last-move');
        Swal.fire({
            title: 'Tutorial Encerrado',
            text: "Você gostaria de iniciar um novo jogo?",
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Sim, reiniciar!',
            cancelButtonText: 'Não, voltar ao menu'
        }).then((result) => {
            if (result.isConfirmed) {
                window.location.reload();
            }
        });
    }

    exibirMensagem(titulo, msg, callback) {
        Swal.fire({
            title: titulo,
            text: msg,
            icon: 'info',
            confirmButtonText: 'Entendi, continuar!',
            showDenyButton: true,
            denyButtonText: 'Sair do Tutorial',
            allowOutsideClick: false,
            allowEscapeKey: false,
        }).then((result) => {
            if (result.isConfirmed) {
                callback();
            } else if (result.isDenied) {
                this.finalizar();
            }
        });
    }

    _mostrarToast(mensagem, tipo = 'info') {
        Swal.fire({
            toast: true, position: 'top-end', showConfirmButton: false, timer: 3500,
            timerProgressBar: true, icon: tipo, title: mensagem,
        });
    }
}
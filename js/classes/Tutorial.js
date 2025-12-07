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
        const partida_xeque_mate_simples = [
            { tipo: 'info', titulo: 'Xeque-mate do Pastor (4 Movimentos)', mensagem: "Este é um xeque-mate rápido e famoso. O objetivo é mostrar como peças podem trabalhar juntas para um ataque rápido." },
            { tipo: 'setup', posicao: 'inicial' },

            { tipo: 'usuario', origem: 'e2', destino: 'e4', dica: "1. e4: Comece controlando o centro com o peão do Rei." },
            { tipo: 'auto', origem: 'e7', destino: 'e5', mensagem: "1... e5: Pretas respondem controlando o centro." },

            { tipo: 'usuario', origem: 'd1', destino: 'h5', dica: "2. Dh5: Traga a Dama para h5 para começar a mirar a fraca casa f7." },
            { tipo: 'auto', origem: 'b8', destino: 'c6', mensagem: "2... Cc6: As pretas desenvolvem o Cavalo para c6." },

            { tipo: 'usuario', origem: 'f1', destino: 'c4', dica: "3. Bc4: O Bispo entra no jogo, atacando novamente a casa f7." },
            { tipo: 'auto', origem: 'g8', destino: 'f6', mensagem: "3... Cf6: As pretas tentam se defender de f7, mas este é um erro fatal." },

            // ESTE É O MOVIMENTO DO MATE: h5 para f7
            { tipo: 'usuario', origem: 'h5', destino: 'f7', dica: "4. Dxf7: XEQUE-MATE! A Dama em f7 é apoiada pelo Bispo em c4. O Rei não pode escapar nem a peça pode ser capturada." },

            // Passo de conclusão que será ativado pela detecção de xeque-mate do Jogo.js
            { tipo: 'finalizacao', titulo: 'Xeque-Mate!', mensagem: "Parabéns! O Rei está cercado sem movimentos legais. Escolha sair ou reiniciar abaixo." }
        ];

        // =====================================================================
        // COLEÇÃO DE ROTEIROS COMPLETOS
        // =====================================================================
        this.roteiros = {
            'curso_completo': [
                ...intro_xadrez,
                ...movimento_pecas,
                ...movimentos_especiais,
                ...partida_xeque_mate_simples
            ],
            'mate_pastor': [/* roteiro original */], // Pode manter outros se quiser
            'partida_avancada': partida_xeque_mate_simples // Permite iniciar só a partida
        };
        
        // Guardar referências originais para restaurar depois
        this.originalGirarTabuleiro = null;
        this.originalVerificarAfogamento = null;
        this.originalMostrarMensagemAfogamento = null;
    }

    iniciar(nomeLicao = 'curso_completo') {
        console.log(`🛡️ Tutorial Iniciado: ${nomeLicao}`);
        this.roteiroAtual = this.roteiros[nomeLicao];
        if (!this.roteiroAtual) {
            console.error(`Lição "${nomeLicao}" não encontrada.`);
            return;
        }

        // DESABILITAR GIRO DO TABULEIRO
        if (this.jogo && this.jogo.girarTabuleiro) {
            this.originalGirarTabuleiro = this.jogo.girarTabuleiro;
            this.jogo.girarTabuleiro = function() {
                console.log("Giro do tabuleiro desabilitado durante o tutorial");
                return;
            };
        }
        
        // DESABILITAR VERIFICAÇÃO DE AFOGAMENTO E MENSAGEM
        this._desabilitarAfogamento();

        // Garantir que o tabuleiro não está girado
        const boardWrapper = document.querySelector('.board-wrapper');
        if (boardWrapper) {
            boardWrapper.classList.remove('girarPretas');
        }

        $('body').off();
        this.indicePasso = 0;
        this.executarPassoAtual();
    }

    _desabilitarAfogamento() {
        // Interceptar a função de verificar afogamento
        if (this.jogo) {
            // Se o jogo tem uma função verificarAfogamento, desabilitar
            if (this.jogo.verificarAfogamento) {
                this.originalVerificarAfogamento = this.jogo.verificarAfogamento;
                this.jogo.verificarAfogamento = function() {
                    console.log("Verificação de afogamento desabilitada durante o tutorial");
                    return false; // Nunca retorna true para afogamento
                };
            }
            
            // Interceptar possíveis funções que mostram mensagem de afogamento
            // Procura por funções que usam Swal.fire para mostrar afogamento
            this._interceptarSwalFire();
            
            // Se houver uma função específica para finalizar partida por afogamento
            if (window.finalizarPartida) {
                this.originalMostrarMensagemAfogamento = window.finalizarPartida;
                window.finalizarPartida = function(mensagem) {
                    // Se a mensagem contém "afogamento" ou "empate por afogamento", ignorar
                    if (mensagem && 
                        (mensagem.toLowerCase().includes('afogamento') || 
                         mensagem.toLowerCase().includes('empate'))) {
                        console.log("Mensagem de afogamento ignorada durante o tutorial");
                        return;
                    }
                    // Para outras mensagens, usar a função original
                    if (this.originalMostrarMensagemAfogamento) {
                        this.originalMostrarMensagemAfogamento(mensagem);
                    }
                }.bind(this);
            }
        }
    }

    _interceptarSwalFire() {
        // Guardar a função original do Swal
        if (window.Swal && window.Swal.fire) {
            const originalSwalFire = window.Swal.fire;
            
            window.Swal.fire = function(config) {
                // Verificar se é uma mensagem de afogamento
                const title = config.title || '';
                const text = config.text || '';
                const html = config.html || '';
                
                const mensagemCompleta = title + ' ' + text + ' ' + html;
                
                if (mensagemCompleta.toLowerCase().includes('afogamento') ||
                    mensagemCompleta.toLowerCase().includes('empate') ||
                    mensagemCompleta.toLowerCase().includes('stalemate')) {
                    console.log("Mensagem de afogamento bloqueada durante o tutorial:", config.title);
                    return Promise.resolve({ isConfirmed: false, isDenied: false, dismiss: 'cancel' });
                }
                
                // Para todas as outras chamadas, usar a função original
                return originalSwalFire.call(this, config);
            };
            
            this.originalSwalFire = originalSwalFire;
        }
    }

    executarPassoAtual() {
        if (this.indicePasso >= this.roteiroAtual.length) {
            console.log("🛡️ Tutorial Finalizado");
            // RESTAURAR FUNÇÕES ORIGINAIS
            this._restaurarFuncoesOriginais();
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
            case 'finalizacao':
                this.finalizar();
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

        // RESTAURAR FUNÇÕES ORIGINAIS
        this._restaurarFuncoesOriginais();

        Swal.fire({
            title: 'Tutorial Encerrado',
            text: 'O que você deseja fazer agora?',
            icon: 'question',
            showDenyButton: true,
            showCancelButton: true,
            confirmButtonText: '🔁 Reiniciar Tutorial',
            denyButtonText: '🏁 Ir para o Menu',
            cancelButtonText: '❌ Cancelar',
            allowOutsideClick: false,
            allowEscapeKey: false,
        }).then((result) => {
            if (result.isConfirmed) {
                // reinicia o tutorial
                this.indicePasso = 0;
                this.executarPassoAtual();
            }
            else if (result.isDenied) {
                // vai para o menu principal
                window.location.href = '/';
            }
            // cancelar → não faz nada
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
                Swal.fire({
                    title: 'Encerrar Tutorial',
                    text: 'O que você deseja fazer agora?',
                    icon: 'question',
                    showDenyButton: true,
                    showCancelButton: true,
                    confirmButtonText: '🔁 Reiniciar Tutorial',
                    denyButtonText: '🏁 Ir para o Menu',
                    cancelButtonText: '❌ Cancelar',
                }).then((escolha) => {
                    if (escolha.isConfirmed) {
                        // reinicia o tutorial
                        this.indicePasso = 0;
                        this.executarPassoAtual();
                    }
                    else if (escolha.isDenied) {
                        // vai para o menu principal
                        window.location.href = '/';
                    }
                    // cancelar → não faz nada
                });
            }
        });
    }

    _mostrarToast(mensagem, tipo = 'info') {
        Swal.fire({
            toast: true, position: 'top-end', showConfirmButton: false, timer: 3500,
            timerProgressBar: true, icon: tipo, title: mensagem,
        });
    }
    
    _restaurarFuncoesOriginais() {
        // RESTAURAR GIRO DO TABULEIRO
        if (this.originalGirarTabuleiro && this.jogo) {
            this.jogo.girarTabuleiro = this.originalGirarTabuleiro;
        }
        
        // RESTAURAR VERIFICAÇÃO DE AFOGAMENTO
        if (this.originalVerificarAfogamento && this.jogo) {
            this.jogo.verificarAfogamento = this.originalVerificarAfogamento;
        }
        
        // RESTAURAR FUNÇÃO FINALIZAR PARTIDA
        if (this.originalMostrarMensagemAfogamento && window.finalizarPartida) {
            window.finalizarPartida = this.originalMostrarMensagemAfogamento;
        }
        
        // RESTAURAR SWAL.FIRE ORIGINAL
        if (this.originalSwalFire && window.Swal && window.Swal.fire) {
            window.Swal.fire = this.originalSwalFire;
        }
    }
}
// js/classes/Tutorial.js
export class Tutorial {
    constructor(jogo) {
        this.jogo = jogo;
        this.passos = [];
        this.passosAtuais = 0;
        this.pecaSelecionada = null;

        // 🔹 Nova funcionalidade: registrador de tipos de ações
        this.acoes = {
            mensagem: (passo) => {},
            selecionarPeca: (passo) => {
                this.esperarSelecaoPeca(
                    passo.peca.tipo,
                    passo.peca.cor,
                    passo.peca.casa || null
                );
            },
            moverPeca: (passo) => {
                this.esperarMovimento(passo.casasValidas);
            },
            resetTabuleiro: (passo) => {
                if (typeof iniciarNovaPartida === "function") {
                    iniciarNovaPartida("tutorial");
                    this.jogo = jogoAtual;
                }
            }
        };
    }

    iniciar() {
        console.log("Tutorial iniciado. Desabilitando eventos de jogo...");
        $('body').off('click.jogo click.quadrado');
        this.mostrarPasso();
    }

    mostrarPasso() {
        if (this.passosAtuais >= this.passos.length) {
            Swal.fire('Tutorial Concluído', 'Você aprendeu o básico de todas as peças!', 'success');
            $('body').off('click.tutorial');
            console.log("Tutorial concluído. Reabilitando eventos de jogo...");
            if (typeof this.jogo._registrarEventos === 'function') {
                this.jogo._registrarEventos();
            }
            return;
        }

        const passo = this.passos[this.passosAtuais];

        Swal.fire({
            title: 'Tutorial 🎓',
            text: passo.mensagem || passo.texto || "Siga as instruções.",
            icon: 'info',
            confirmButtonText: passo.acao ? 'Entendi' : 'Próximo',
            allowOutsideClick: false,
            allowEscapeKey: false
        }).then(() => {

            // 🔹 Executa automaticamente a ação do passo, se houver
            if (passo.tipo && this.acoes[passo.tipo]) {
                this.acoes[passo.tipo](passo);
                return;
            }

            if (passo.acao) {
                passo.acao();
            } else {
                this.passosAtuais++;
                this.mostrarPasso();
            }
        });
    }

    esperarSelecaoPeca(tipo, cor, casaEspecifica = null) {
        const self = this;
        $('.piece.tutorial-highlight').removeClass('tutorial-highlight');

        const seletorPeca = casaEspecifica
            ? `#${casaEspecifica} .piece.${tipo}-${cor}`
            : `.piece.${tipo}-${cor}`;

        const $pecas = $(seletorPeca);

        if (!casaEspecifica && $pecas.length > 1) {
            $pecas.removeClass('tutorial-highlight');
            $pecas.eq(0).addClass('tutorial-highlight');
        } else {
            $pecas.addClass('tutorial-highlight');
        }

        console.log(`Tutorial: Esperando clique em ${tipo}-${cor}`);

        $('body').off('click.tutorial click.jogo click.quadrado');

        $('body').on('click.tutorial', '.piece', function (e) {
            e.stopPropagation();
            const $pecaClicada = $(this);
            const casaClicada = $pecaClicada.parent().attr('id');

            const correto =
                casaEspecifica
                    ? casaClicada === casaEspecifica && $pecaClicada.is(`.piece.${tipo}-${cor}`)
                    : $pecaClicada.is(`.piece.${tipo}-${cor}`);

            if (correto) {
                console.log(`Peça correta selecionada.`);
                self.pecaSelecionada = casaClicada;
                $('.piece.tutorial-highlight').removeClass('tutorial-highlight');
                $('body').off('click.tutorial');

                self.passosAtuais++;
                self.mostrarPasso();
            } else {
                Swal.fire(
                    'Peça Errada',
                    `Selecione o ${tipo} ${cor}${casaEspecifica ? " em " + casaEspecifica : ""}.`,
                    'warning'
                );
            }
        });
    }

    esperarMovimento(casasValidas) {
        const self = this;

        if (!self.pecaSelecionada) {
            console.error("Erro: esperarMovimento sem pecaSelecionada.");
            self.passosAtuais--;
            self.mostrarPasso();
            return;
        }

        $('.square-board.tutorial-highlight').removeClass('tutorial-highlight');
        casasValidas.forEach(casa => $(`#${casa}`).addClass('tutorial-highlight'));

        console.log("Tutorial: Esperando movimento");

        $('body').off('click.tutorial click.jogo click.quadrado');

        $('body').on('click.tutorial', '.square-board', function (e) {
            e.stopPropagation();
            const destino = $(this).attr('id');

            if (!casasValidas.includes(destino)) {
                Swal.fire('Movimento Inválido', `Selecione uma casa válida.`, 'warning');
                return;
            }

            $('.square-board.tutorial-highlight').removeClass('tutorial-highlight');
            $('body').off('click.tutorial');

            try {
                self.jogo.movimento.moverPeca(self.pecaSelecionada, destino);
                if (self.jogo.limparMovimentosPossiveis) {
                    self.jogo.limparMovimentosPossiveis();
                }
            } catch (err) {
                console.error("Erro ao mover peça.", err);
                const $p = $('#' + self.pecaSelecionada).find('.piece');
                $('#' + destino).html($p.clone());
                $('#' + self.pecaSelecionada).empty();
            }

            self.pecaSelecionada = null;
            self.passosAtuais++;
            self.mostrarPasso();
        });
    }
}

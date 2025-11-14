// js/classes/Tutorial.js
export class Tutorial {
    constructor(jogo) {
        this.jogo = jogo;
        this.passos = [];
        this.passosAtuais = 0;
        this.pecaSelecionada = null;
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
            text: passo.mensagem,
            icon: 'info',
            confirmButtonText: passo.acao ? 'Entendi' : 'Próximo',
            allowOutsideClick: false,
            allowEscapeKey: false
        }).then(() => {
            if (passo.acao) {
                passo.acao();
            } else {
                this.passosAtuais++;
                this.mostrarPasso();
            }
        });
    }

    /**
     * Espera o usuário selecionar uma peça específica.
     */
    esperarSelecaoPeca(tipo, cor, casaEspecifica = null) {
        const self = this;
        $('.piece.tutorial-highlight').removeClass('tutorial-highlight');

        // Define seletor e descrição dependendo se é uma casa específica ou qualquer peça do tipo
        const seletorPeca = casaEspecifica
            ? `#${casaEspecifica} .piece.${tipo}-${cor}`
            : `.piece.${tipo}-${cor}`;
        const seletorDesc = casaEspecifica
            ? `${tipo}-${cor} em ${casaEspecifica}`
            : `${tipo}-${cor}`;

        const $pecas = $(seletorPeca);

        if ($pecas.length === 0) {
            console.error(`Tutorial: Nenhuma peça encontrada com o seletor: ${seletorPeca}`);
        }

        // 🔹 Se for qualquer peça, destaca só a primeira (pra não poluir visualmente)
        if (!casaEspecifica && $pecas.length > 1) {
            $pecas.removeClass('tutorial-highlight');
            $pecas.eq(0).addClass('tutorial-highlight');
        } else {
            $pecas.addClass('tutorial-highlight');
        }

        console.log(`Tutorial: Esperando clique em ${seletorDesc}`);

        // Remove eventos antigos
        $('body').off('click.tutorial click.jogo click.quadrado');

        // Ativa evento só para o tutorial
        $('body').on('click.tutorial', '.piece', function (e) {
            e.stopPropagation();
            const $pecaClicada = $(this);
            const casaClicada = $pecaClicada.parent().attr('id');

            const ehPecaCerta = casaEspecifica
                ? casaClicada === casaEspecifica && $pecaClicada.is(`.piece.${tipo}-${cor}`)
                : $pecaClicada.is(`.piece.${tipo}-${cor}`);

            if (ehPecaCerta) {
                console.log(`✅ Tutorial: Peça correta selecionada (${casaClicada}).`);
                self.pecaSelecionada = casaClicada;

                // Remove destaque e evento
                $('.piece.tutorial-highlight').removeClass('tutorial-highlight');
                $('body').off('click.tutorial');

                // Passa para o próximo passo
                self.passosAtuais++;
                self.mostrarPasso();
            } else {
                console.warn(`❌ Peça errada clicada (${casaClicada}).`);
                Swal.fire(
                    'Peça Errada',
                    `Por favor, selecione o ${tipo} ${cor}${casaEspecifica ? ' em ' + casaEspecifica : ''}.`,
                    'warning'
                );
            }
        });
    }

    /**
     * Espera o usuário mover a peça selecionada para uma casa válida.
     */
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
        console.log(`Tutorial: Esperando movimento para ${casasValidas.join(', ')}`);

        $('body').off('click.tutorial click.jogo click.quadrado');

        $('body').on('click.tutorial', '.square-board', function (e) {
            e.stopPropagation();
            const casaDestino = $(this).attr('id');

            if (!casasValidas.includes(casaDestino)) {
                Swal.fire('Movimento Inválido', `Selecione uma das casas destacadas: ${casasValidas.join(', ')}`, 'warning');
                return;
            }

            console.log(`Tutorial: Movimento correto para ${casaDestino}`);

            $('.square-board.tutorial-highlight').removeClass('tutorial-highlight');
            $('body').off('click.tutorial');

            try {
                self.jogo.movimento.moverPeca(self.pecaSelecionada, casaDestino);
                if (typeof self.jogo.limparMovimentosPossiveis === 'function') {
                    self.jogo.limparMovimentosPossiveis();
                }
            } catch (error) {
                console.error("Erro ao mover peça via lógica do jogo.", error);
                const $peca = $('#' + self.pecaSelecionada).find('.piece');
                if ($peca.length > 0) {
                    $('#' + casaDestino).html($peca.clone());
                    $('#' + self.pecaSelecionada).empty();
                }
            }

            self.pecaSelecionada = null;
            self.passosAtuais++;
            self.mostrarPasso();
        });
    }
}

// js/classes/Tutorial.js
export class Tutorial {
    constructor(jogo) {
        this.jogo = jogo; // referência ao objeto Jogo
        this.passos = []; // lista de passos do tutorial
        this.passosAtuais = 0;
        this.pecaSelecionada = null; // Rastreia a peça clicada
    }

    iniciar() {
        this.mostrarPasso(); // inicia o tutorial
    }

    mostrarPasso() {
        if (this.passosAtuais >= this.passos.length) {
            Swal.fire('Tutorial Concluído', 'Você aprendeu o básico de todas as peças!', 'success');
            // Limpa o último listener
            $('body').off('click.tutorial');
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
                passo.acao(); // espera ação do usuário
            } else {
                this.passosAtuais++;
                this.mostrarPasso();
            }
        });
    }

    esperarSelecaoPeca(tipo, cor) {
        const self = this;
        $('.piece.tutorial-highlight').removeClass('tutorial-highlight');
        
        // Destaca apenas as peças relevantes para o tutorial
        if (tipo === 'pawn' && cor === 'white') {
             $('#e2 .piece.pawn.white').addClass('tutorial-highlight');
             $('#a2 .piece.pawn.white').addClass('tutorial-highlight');
        } else {
            $(`.piece.${tipo}.${cor}`).addClass('tutorial-highlight');
        }

        // ATUALIZAÇÃO: Adicionado 'e' (evento)
        $('body').off('click.tutorial').on('click.tutorial', '.square-board', function (e) {
            const casaClicada = $(this);
            const peca = casaClicada.find('.piece');

            if (!peca.length) {
                return; 
            }

            if (!peca.hasClass(tipo) || !peca.hasClass(cor)) {
                Swal.fire('Peça Errada', `Por favor, selecione um ${tipo} da cor ${cor} (peças destacadas).`, 'warning');
                return;
            }

            $('.piece.tutorial-highlight').removeClass('tutorial-highlight');

            const posicao = casaClicada.attr('id'); 
            
            self.pecaSelecionada = posicao; 
            self.jogo.mostrarMovimentosPossiveis(posicao);

            $('body').off('click.tutorial'); 

            self.passosAtuais++;
            self.mostrarPasso();

            // ATUALIZAÇÃO: Impede o clique de vazar para o Jogo.js
            e.stopPropagation();
            return false;
        });
    }

    esperarMovimento(casasValidas) {
        const self = this;

        if (!self.pecaSelecionada) {
            console.error("Erro de Tutorial: esperarMovimento foi chamado sem uma pecaSelecionada.");
            self.passosAtuais--;
            self.mostrarPasso();
            return;
        }

        $('.square-board.tutorial-highlight').removeClass('tutorial-highlight');
        casasValidas.forEach(casa => $(`#${casa}`).addClass('tutorial-highlight'));

        // ATUALIZAÇÃO: Adicionado 'e' (evento)
        $('body').off('click.tutorial').on('click.tutorial', '.square-board', function (e) {
            const casaDestino = $(this).attr('id');
            
            if (!casasValidas.includes(casaDestino)) {
                Swal.fire('Movimento Inválido', `Selecione uma das casas destacadas: ${casasValidas.join(', ')}`, 'warning');
                return;
            }

            $('.square-board.tutorial-highlight').removeClass('tutorial-highlight');

            // --- ESTA É A CORREÇÃO PRINCIPAL ---
            // A função correta está no objeto 'movimento' dentro do 'jogo'.
            self.jogo.movimento.moverPeca(self.pecaSelecionada, casaDestino);
            
            self.pecaSelecionada = null; 
            self.jogo.limparMovimentosPossiveis(); 

            $('body').off('click.tutorial');

            self.passosAtuais++;
            self.mostrarPasso();

            // ATUALIZAÇÃO: Impede o clique de vazar para o Jogo.js
            e.stopPropagation();
            return false;
        });
    }
}
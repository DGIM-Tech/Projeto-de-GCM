import { Tabuleiro } from './Tabuleiro.js';
import { Movimento } from './Movimento.js';
import { Xeque } from './Xeque.js';
import { XequeMate } from './XequeMate.js';
import { Empate } from './Empate.js';

export class Jogo {
    constructor() {
        this.tabuleiro = new Tabuleiro();
        this.movimento = new Movimento();
        this.vezDo = 'white';
        this.clicou = 0;
        this.pecaEscolhida = null;
        this.ultimaCasa = '';

        // Histórico de Jogadas
        this.historicoDeJogadas = []; 

        // Flags de movimento para Roque
        this.whiteKingMoved = false;
        this.blackKingMoved = false;
        this.whiteRooksMoved = {a: false, h: false};
        this.blackRooksMoved = {a: false, h: false};
    }

    iniciar() {
        this.tabuleiro.inicar();
        this._registrarEventos(); // Renomeado para indicar que é um método "privado"
        this._iniciarInterfaceHistorico();
    }

    // --- MÉTODOS PÚBLICOS DE INTERFACE E LÓGICA DE JOGO ---

    registrarJogada(notacao) {
        this.historicoDeJogadas.push(notacao);
        this.atualizarInterfaceHistorico();
    }

    atualizarInterfaceHistorico() {
        // ... (código original sem alterações)
        $('.stats .notation .notation-content').remove();
        let html = '<div class="notation-content"><table><thead><tr><th>#</th><th>Brancas</th><th>Pretas</th></tr></thead><tbody>';
        let moveIndex = 0;
        for (let i = 0; i < this.historicoDeJogadas.length; i += 2) {
            moveIndex++;
            const notacaoBrancas = this.historicoDeJogadas[i];
            const notacaoPretas = this.historicoDeJogadas[i + 1] || ''; 
            html += `<tr><td class="move-number">${moveIndex}.</td><td class="brancas-move">${notacaoBrancas}</td><td class="pretas-move">${notacaoPretas || '...'}</td></tr>`;
        }
        html += '</tbody></table></div>';
        $('.stats .notation').html('<h3>Histórico de Jogadas</h3>' + html);
    }
    
    // --- MÉTODOS "PRIVADOS" DE LÓGICA INTERNA ---

    _registrarEventos() {
        const self = this;

        // Clicar na peça para selecioná-la
        $('body').on('click', '.piece', function (e) {
            e.stopPropagation(); // Evita que o clique na peça também acione o clique no quadrado
            self._selecionarPeca($(this));
        });

        // Clicar no quadrado para mover a peça selecionada
        $('body').on('click', '.square-board', function () {
            self._tentarMoverPeca($(this));
        });
        
        // Evento para a escolha na promoção do peão
        // Você precisará adicionar este evento ao seu HTML/JS que lida com o modal
        $('body').on('click', '.promotion-choice', function() {
            const pecaPromovida = $(this).data('piece'); // ex: 'queen'
            // Lógica para finalizar a jogada após a promoção
        });
    }

    _iniciarInterfaceHistorico() {
        $('.stats .notation').html('<h3>Histórico de Jogadas</h3><div class="notation-content"><table><thead><tr><th>#</th><th>Brancas</th><th>Pretas</th></tr></thead><tbody></tbody></table></div>');
    }

    _selecionarPeca(pecaClicada) {
        const classe = pecaClicada.attr('class');
        const casaId = pecaClicada.parent().attr('id');

        // Permite selecionar apenas peças do jogador da vez
        if (!classe.includes(this.vezDo)) {
            // Se uma peça já foi escolhida e o clique foi em uma peça inimiga em uma casa válida, trata como um movimento de captura
            if (this.clicou === 1 && pecaClicada.parent().hasClass('possible')) {
                pecaClicada.parent().trigger('click');
            } else {
                alert("⚠️ Não é sua vez! Escolha uma peça " + this.vezDo);
            }
            return;
        }

        /*
            Melhoria na Lógica de Xeque:
            A lógica original bloqueava qualquer peça que não fosse o rei, o que está incorreto.
            O jogador em xeque pode mover o rei OU mover outra peça para bloquear o xeque/capturar o atacante.
            A validação real deve acontecer no Movimento.js, garantindo que qualquer movimento possível deixe o rei fora de xeque.
            Por enquanto, vamos remover a verificação restritiva daqui para permitir o fluxo correto.
        */

        this.clicou = 1;
        this.ultimaCasa = casaId;
        this.pecaEscolhida = pecaClicada;
        
        this._mostrarMovimentosPossiveis(classe, casaId);
    }
    
    _mostrarMovimentosPossiveis(classe, casaId) {
        $('.square-board').removeClass('possible');
        const jaMoveuRei = (this.vezDo === 'white') ? this.whiteKingMoved : this.blackKingMoved;
        const jaMoveuTorres = (this.vezDo === 'white') ? this.whiteRooksMoved : this.blackRooksMoved;
        
        const moves = this.movimento.movimentosPossiveis(classe, casaId, jaMoveuRei, jaMoveuTorres);
        moves.forEach(m => $('#' + m).addClass('possible'));
    }

    _tentarMoverPeca(casaAlvo) {
        if (this.clicou !== 1) return;

        const casaDestinoId = casaAlvo.attr('id');
        const isMovimentoValido = casaDestinoId !== this.ultimaCasa && casaAlvo.hasClass('possible');

        if (!isMovimentoValido) return;
        
        const casaOrigemId = this.ultimaCasa;
        const pecaMovida = this.pecaEscolhida;

        // 1. Executa o movimento no DOM
        const pecaCapturada = this._executarMovimento(pecaMovida, casaOrigemId, casaDestinoId);
        
        // 2. Lida com movimentos especiais (Roque)
        const infoRoque = this._tratarRoque(pecaMovida, casaOrigemId, casaDestinoId);
        
        // 3. Atualiza flags para futuros Roques
        this._atualizarFlagsDeRoque(pecaMovida, casaOrigemId);

        // 4. Lida com a promoção de peão
        const isPromocao = this._tratarPromocao(pecaMovida, casaDestinoId);
        if (isPromocao) {
            // A jogada só será finalizada após a escolha do usuário no modal de promoção.
            // O evento do modal chamará uma função como _finalizarJogadaComPromocao().
            return;
        }

        // 5. Finaliza a jogada
        this._finalizarJogada(casaOrigemId, casaDestinoId, pecaMovida, pecaCapturada, infoRoque);
    }

    _executarMovimento(peca, origem, destino) {
        const casaDestinoEl = $('#' + destino);
        const pecaCapturada = casaDestinoEl.find('.piece');

        if (pecaCapturada.length > 0) {
            $('.stats .capturadas-list').append(pecaCapturada);
        }

        casaDestinoEl.html(peca);
        $('#' + origem).empty();
        $('.square-board').removeClass('possible');
        
        return pecaCapturada;
    }

    _atualizarFlagsDeRoque(peca, origem) {
       // implemnta depois
    }

    _tratarRoque(peca, origem, destino) {
        if (!peca.hasClass('king')) {
            return { isRoquePequeno: false, isRoqueGrande: false };
        }
        
        const origemCol = origem[0];
        const destinoCol = destino[0];
        const linha = origem[1];
        
        let isRoquePequeno = false;
        let isRoqueGrande = false;

        // Roque Pequeno (O-O)
        if (origemCol === 'e' && destinoCol === 'g') {
            const torre = $('#h' + linha).find('.piece');
            $('#f' + linha).html(torre);
            isRoquePequeno = true;
        }
        // Roque Grande (O-O-O)
        else if (origemCol === 'e' && destinoCol === 'c') {
            const torre = $('#a' + linha).find('.piece');
            $('#d' + linha).html(torre);
            isRoqueGrande = true;
        }
        
        return { isRoquePequeno, isRoqueGrande };
    }

    _tratarPromocao(peca, destino) {
        // aqui aplica o logica por ultimo
    }

    _finalizarJogada(origem, destino, peca, pecaCapturada, infoRoque, promocaoPara = null) {
        // Gera a notação
        const notacao = this._gerarNotacaoAlgébrica(
            origem, destino, peca, pecaCapturada,
            infoRoque.isRoquePequeno, infoRoque.isRoqueGrande, promocaoPara
        );
        this.registrarJogada(notacao);
        
        // Troca o turno
        this.vezDo = (this.vezDo === 'white') ? 'black' : 'white';
        this.clicou = 0;
        this.pecaEscolhida = null;

        // Verifica condições de fim de jogo (Xeque, Xeque-Mate, Empate)
        this._verificarCondicoesDeFimDeJogo();
    }

    _verificarCondicoesDeFimDeJogo() {
        // const corDoProximoJogador = this.vezDo;
        // const corTexto = corDoProximoJogador === 'white' ? 'Brancas' : 'Pretas';

        // // Passo 1: Verificar se o jogador da vez está em XEQUE.
        // if (Xeque.estaEmXeque(corDoProximoJogador)) {
            
        //     // Passo 2: Se está em xeque, verificar se é XEQUE-MATE.
        //     if (XequeMate.estaEmXequeMate(corDoProximoJogador)) {
        //         const vencedor = (corDoProximoJogador === 'white') ? 'Pretas' : 'Brancas';
        //         alert(`🏁 XEQUE-MATE! ${vencedor} vencem o jogo!`);
        //         this._encerrarJogo();
        //         return; // Jogo acabou, não precisa verificar mais nada.
        //     }
            
        //     // Se não é mate, é apenas um xeque normal. Apenas avisa o jogador.
        //     alert(`♟️ ${corTexto} estão em XEQUE!`);

        // }    Iandra probema de logica no checque aqui
        // Se nenhuma das condições de fim de jogo foi atendida, o jogo continua normalmente.
    }
    _gerarNotacaoAlgébrica(origem, destino, peca, pecaCapturada, isRoquePequeno, isRoqueGrande, promocaoPara) {
        // ... (código original sem alterações)
        const classePeca = peca.attr('class').split(' ')[1];
        const tipoPeca = classePeca.split('-')[0];
        const isCaptura = pecaCapturada.length > 0;
        let notacao = '';
        const nomePeca = {'pawn': 'Peão', 'knight': 'Cavalo', 'bishop': 'Bispo', 'rook': 'Torre', 'queen': 'Rainha', 'king': 'Rei'}[tipoPeca];
        if (isRoquePequeno) return 'Roque-Pequeno (O-O)'; 
        if (isRoqueGrande) return 'Roque-Grande (O-O-O)'; 
        notacao += nomePeca + ' ' + origem + '-' + destino;
        if (isCaptura) notacao += ' (Captura)';
        if (promocaoPara) {
            const nomePromocao = promocaoPara.charAt(0).toUpperCase() + promocaoPara.slice(1);
            notacao += ` (Promove a ${nomePromocao})`;
        }
        return notacao;
    }
}
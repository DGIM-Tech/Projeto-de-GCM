// js/classes/Jogo.js

import { Tabuleiro } from './Tabuleiro.js';
import { Movimento } from './Movimento.js';
import { Xeque } from './Xeque.js';
import { XequeMate } from './XequeMate.js';

export class Jogo {
    constructor(jogador1, jogador2) {
        this.tabuleiro = new Tabuleiro();
        this.movimento = new Movimento(this.tabuleiro);
        this.clicou = 0;
        this.pecaEscolhida = null;
        this.ultimaCasa = '';
        this.historicoDeJogadas = [];
        this.gameOver = false;
        this.jogador1 = jogador1;
        this.jogador2 = jogador2;
        this.jogadorAtual = this.jogador1;
        this.vezDo = 'white';
        this.whiteKingMoved = false;
        this.blackKingMoved = false;
        this.whiteRooksMoved = { a1: false, h1: false };
        this.blackRooksMoved = { a8: false, h8: false };
        this.enPassantTarget = null; 
    }

    iniciar() {
        this.tabuleiro.inicar();
        this._registrarEventos();
        this.atualizarInterfaceHistorico();
        this.proximoTurno();
    }

    async proximoTurno() {
        if (this.gameOver) return;
        console.log(`Turno de: ${this.jogadorAtual.nome} (${this.jogadorAtual.cor})`);

        if (this.jogadorAtual.tipo === 'IA') {
            $('.board').addClass('ia-thinking');
            const movimentoIA = await this.jogadorAtual.fazerMovimento(this);
            $('.board').removeClass('ia-thinking');

            if (movimentoIA) {
                const { peca, casaOrigem, casaDestino } = movimentoIA;
                this.pecaEscolhida = peca;
                this.ultimaCasa = casaOrigem;
                this._tentarMoverPeca($('#' + casaDestino));
            } else {
                console.error("A IA falhou em retornar um movimento.");
            }
        }
    }
    
    // NOVO: Função para exibir toasts (mensagens pequenas e rápidas)
    _mostrarToast(mensagem, tipo = 'info') {
        Swal.fire({
            text: mensagem,
            icon: tipo,
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 2500, // A mensagem some após 2.5 segundos
            timerProgressBar: true
        });
    }

    _registrarEventos() {
        const self = this;
        $('body').off('click.jogo').on('click.jogo', '.piece', function (e) {
            e.stopPropagation();
            if (self.jogadorAtual.tipo === 'Humano') {
                self._selecionarPeca($(this));
            }
        });
        $('body').off('click.quadrado').on('click.quadrado', '.square-board', function () {
            if (self.jogadorAtual.tipo === 'Humano') {
                self._tentarMoverPeca($(this));
            }
        });
    }

    _selecionarPeca(pecaClicada) {
       const classe = pecaClicada.attr('class');
       const casaId = pecaClicada.parent().attr('id');
       if (!classe.includes(this.vezDo)) {
           if (this.clicou === 1 && pecaClicada.parent().hasClass('possible')) {
               pecaClicada.parent().trigger('click');
           } else {
               // ALTERADO: Substituído o alert() por um toast personalizado
               this._mostrarToast('Não é a sua vez de jogar!', 'error');
           }
           return;
       }
       this.clicou = 1;
       this.ultimaCasa = casaId;
       this.pecaEscolhida = pecaClicada;
       this._mostrarMovimentosPossiveis(classe, casaId);
    }

    _tentarMoverPeca(casaAlvo) {
       if (this.clicou !== 1 && this.jogadorAtual.tipo === 'Humano') {
           // NOVO: Mensagem para quando o jogador clica numa casa vazia sem ter selecionado peça
           this._mostrarToast('Selecione uma peça para mover.', 'info');
           return;
       }

       const casaDestinoId = casaAlvo.attr('id');
       const isMovimentoValido = casaDestinoId !== this.ultimaCasa && casaAlvo.hasClass('possible');
       
       if (!isMovimentoValido && this.jogadorAtual.tipo === 'Humano') return;

       const casaOrigemId = this.ultimaCasa;
       const pecaMovida = this.pecaEscolhida;
       
       this._atualizarFlagsDeRoque(pecaMovida, casaOrigemId);

       const pecaCapturada = this._executarMovimento(pecaMovida, casaOrigemId, casaDestinoId);
       const infoRoque = this._tratarRoque(pecaMovida, casaOrigemId, casaDestinoId);
       
       const isPromocao = this._tratarPromocao(pecaMovida, casaDestinoId);
       if (isPromocao) return;
       
       this.finalizarTurno(casaOrigemId, casaDestinoId, pecaMovida, pecaCapturada, infoRoque);
    }
    
    finalizarTurno(origem, destino, peca, pecaCapturada, infoRoque, promocaoPara = null) {
        if (peca.hasClass('pawn') && Math.abs(origem[1] - destino[1]) === 2) {
            const file = origem[0];
            const rank = this.vezDo === 'white' ? parseInt(origem[1]) + 1 : parseInt(origem[1]) - 1;
            this.enPassantTarget = file + rank;
        } else {
            this.enPassantTarget = null;
        }

        const notacao = this._gerarNotacaoAlgébrica(origem, destino, peca, pecaCapturada, infoRoque.isRoquePequeno, infoRoque.isRoqueGrande, promocaoPara);
        this.registrarJogada(notacao);

        this.vezDo = (this.vezDo === 'white') ? 'black' : 'white';
        this.jogadorAtual = (this.jogadorAtual === this.jogador1) ? this.jogador2 : this.jogador1;
        this.clicou = 0;
        this.pecaEscolhida = null;

        this._verificarCondicoesDeFimDeJogo();

        if (!this.gameOver) {
            this.proximoTurno();
        }
    }
    
    // ALTERADO: Lógica de xeque agora destaca o rei e mostra toast personalizado
    _verificarCondicoesDeFimDeJogo() {
        // Limpa destaques de xeque anteriores antes de verificar de novo
        $('.xeque-highlight').removeClass('xeque-highlight');

        const corDoProximoJogador = this.vezDo;

        // 1. Verifica se o próximo jogador está em XEQUE
        if (Xeque.estaEmXeque(corDoProximoJogador, this.movimento)) {
            
            // NOVO: Encontra o rei e destaca a sua casa em vermelho
            const reiEmXeque = $(`.piece.king-${corDoProximoJogador}`);
            if(reiEmXeque.length) {
                reiEmXeque.parent().addClass('xeque-highlight');
            }
            
            // NOVO: Mostra um toast personalizado informando qual rei está em perigo
            const corTexto = corDoProximoJogador === 'white' ? 'Branco' : 'Preto';
            this._mostrarToast(`O Rei ${corTexto} está em Xeque!`, 'warning');

            // 2. Se estiver em xeque, verifica se é XEQUE-MATE
            
        }
    }
    
    // --- O RESTO DO CÓDIGO PERMANECE IGUAL ---

    _atualizarFlagsDeRoque(peca, origem) {
        const cor = peca.hasClass('white') ? 'white' : 'black';
        if (peca.hasClass('king')) {
            if (cor === 'white') this.whiteKingMoved = true;
            else this.blackKingMoved = true;
        } 
        else if (peca.hasClass('rook')) {
            if (cor === 'white') {
                if (origem === 'a1') this.whiteRooksMoved.a1 = true;
                if (origem === 'h1') this.whiteRooksMoved.h1 = true;
            } else {
                if (origem === 'a8') this.blackRooksMoved.a8 = true;
                if (origem === 'h8') this.blackRooksMoved.h8 = true;
            }
        }
    }
    
    _gerarFEN() {
        let fen = '';
        const colunas = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
        for (let l = 8; l >= 1; l--) {
            let casasVazias = 0;
            for (let c = 0; c < colunas.length; c++) {
                const casaId = colunas[c] + l;
                const peca = $('#' + casaId).find('.piece');
                if (peca.length > 0) {
                    if (casasVazias > 0) { fen += casasVazias; casasVazias = 0; }
                    const classe = peca.attr('class').split(' ')[1];
                    const cor = classe.split('-')[1];
                    let tipo = classe.split('-')[0];
                    const mapaPecas = { 'pawn': 'p', 'knight': 'n', 'bishop': 'b', 'rook': 'r', 'queen': 'q', 'king': 'k' };
                    let letraPeca = mapaPecas[tipo];
                    if (cor === 'white') { letraPeca = letraPeca.toUpperCase(); }
                    fen += letraPeca;
                } else {
                    casasVazias++;
                }
            }
            if (casasVazias > 0) { fen += casasVazias; }
            if (l > 1) { fen += '/'; }
        }
        fen += this.vezDo === 'white' ? ' w' : ' b';
        let castling = '';
        if (!this.whiteKingMoved) {
            if (!this.whiteRooksMoved.h1) castling += 'K';
            if (!this.whiteRooksMoved.a1) castling += 'Q';
        }
        if (!this.blackKingMoved) {
            if (!this.blackRooksMoved.h8) castling += 'k';
            if (!this.blackRooksMoved.a8) castling += 'q';
        }
        fen += ' ' + (castling || '-');
        fen += ' ' + (this.enPassantTarget || '-');
        fen += ' 0 1';
        return fen;
    }
    
    registrarJogada(notacao) { this.historicoDeJogadas.push(notacao); this.atualizarInterfaceHistorico(); }
    atualizarInterfaceHistorico() {
        const notationContainer = $('.stats .notation');
        if (!notationContainer.length) return;
        notationContainer.empty().append('<h3>Histórico de Jogadas</h3>');
        let html = '<div class="notation-content"><table><thead><tr><th>#</th><th>Brancas</th><th>Pretas</th></tr></thead><tbody>';
        for (let i = 0; i < this.historicoDeJogadas.length; i += 2) {
            const moveIndex = (i / 2) + 1;
            const notacaoBrancas = this.historicoDeJogadas[i];
            const notacaoPretas = this.historicoDeJogadas[i + 1] || '...';
            html += `<tr><td class="move-number">${moveIndex}.</td><td class="brancas-move">${notacaoBrancas}</td><td class="pretas-move">${notacaoPretas}</td></tr>`;
        }
        html += '</tbody></table></div>';
        notationContainer.append(html);
    }
    
    _mostrarMovimentosPossiveis(classe, casaId) {
        $('.square-board').removeClass('possible');
        const jaMoveuRei = (this.vezDo === 'white') ? this.whiteKingMoved : this.blackKingMoved;
        const jaMoveuTorres = (this.vezDo === 'white') ? this.whiteRooksMoved : this.blackRooksMoved;
        const movimentosPseudoLegais = this.movimento.movimentosPossiveis(classe, casaId, jaMoveuRei, jaMoveuTorres, this.enPassantTarget);
        const pecaSelecionada = $('#' + casaId).find('.piece');
        const movimentosFinais = this._filtrarMovimentosLegais(pecaSelecionada, movimentosPseudoLegais);
        movimentosFinais.forEach(m => $('#' + m).addClass('possible'));
    }

    _filtrarMovimentosLegais(peca, movimentos) {
       const cor = this.vezDo;
       const casaOrigemEl = peca.parent();
       const movimentosLegais = [];
       peca.detach();
       for (const casaDestinoId of movimentos) {
           const casaDestinoEl = $('#' + casaDestinoId);
           let pecaCapturada = casaDestinoEl.children('.piece').first();
           if (pecaCapturada.length > 0) { pecaCapturada.detach(); }
           casaDestinoEl.append(peca);
           if (!Xeque.estaEmXeque(cor, this.movimento)) {
               movimentosLegais.push(casaDestinoId);
           }
           peca.detach();
           if (pecaCapturada.length > 0) { casaDestinoEl.append(pecaCapturada); }
       }
       casaOrigemEl.append(peca);
       return movimentosLegais;
    }
     
    _executarMovimento(peca, origem, destino) {
        const casaDestinoEl = $('#' + destino);
        const pecaCapturada = casaDestinoEl.find('.piece');
        if (pecaCapturada.length > 0) {
            $('.stats .capturadas-list').append(pecaCapturada);
        }
        casaDestinoEl.html(peca);
        if (origem) $('#' + origem).empty();
        $('.square-board').removeClass('possible');
        return pecaCapturada;
    }

    _tratarRoque(peca, origem, destino) {
        if (!peca.hasClass('king')) return { isRoquePequeno: false, isRoqueGrande: false };
        const origemCol = origem[0]; const destinoCol = destino[0]; const linha = origem[1];
        let isRoquePequeno = false, isRoqueGrande = false;
        if (origemCol === 'e' && destinoCol === 'g') {
            const torre = $('#h' + linha).find('.piece'); $('#f' + linha).html(torre); isRoquePequeno = true;
        } else if (origemCol === 'e' && destinoCol === 'c') {
            const torre = $('#a' + linha).find('.piece'); $('#d' + linha).html(torre); isRoqueGrande = true;
        }
        return { isRoquePequeno, isRoqueGrande };
    }
    
    _tratarPromocao(peca, destino) { /* Implementar lógica de promoção */ return false; }

    _mostrarVencedorAnimado(vencedor) {
        Swal.fire({
            title: 'Xeque-Mate!',
            text: `As ${vencedor} venceram a partida!`,
            icon: 'success',
            confirmButtonText: 'Jogar Novamente'
        }).then((result) => {
            if (result.isConfirmed) {
                window.location.reload(); // Recarrega a página para voltar ao menu
            }
        });
    }
    
    _gerarNotacaoAlgébrica(origem, destino, peca, pecaCapturada, isRoquePequeno, isRoqueGrande, promocaoPara) {
        if(!peca || !peca.attr('class')) return "Jogada inválida";
        const tipoPeca = peca.attr('class').split(' ')[1].split('-')[0];
        const isCaptura = pecaCapturada && pecaCapturada.length > 0;
        const nomePecaMap = { 'pawn': '', 'knight': 'C', 'bishop': 'B', 'rook': 'T', 'queen': 'D', 'king': 'R' };
        let notacao = nomePecaMap[tipoPeca];
        if (isRoquePequeno) return 'O-O';
        if (isRoqueGrande) return 'O-O-O';
        if (isCaptura) {
            if (tipoPeca === 'pawn') notacao += origem[0];
            notacao += 'x';
        }
        notacao += destino;
        // Adicionar '+' para xeque ou '#' para xeque-mate aqui, se desejar.
        return notacao;
    }
}
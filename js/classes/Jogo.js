import { Tabuleiro } from './Tabuleiro.js';
import { Movimento } from './Movimento.js';
import { Xeque } from './Xeque.js';

export class Jogo {
    constructor() {
        // --- CONSTRUTOR CORRIGIDO E LIMPO ---
        this.tabuleiro = new Tabuleiro();
        this.movimento = new Movimento(this.tabuleiro); // Apenas uma inicialização, a correta.

        this.vezDo = 'white';
        this.clicou = 0;
        this.pecaEscolhida = null;
        this.ultimaCasa = '';

        // Histórico de Jogadas
        this.historicoDeJogadas = [];

        // Flags de movimento para Roque
        this.whiteKingMoved = false;
        this.blackKingMoved = false;
        this.whiteRooksMoved = { a: false, h: false };
        this.blackRooksMoved = { a: false, h: false };
    }

    iniciar() {
        this.tabuleiro.inicar();
        this._registrarEventos();
        this._iniciarInterfaceHistorico();
    }

    // --- MÉTODOS PÚBLICOS DE INTERFACE E LÓGICA DE JOGO ---

    registrarJogada(notacao) {
        this.historicoDeJogadas.push(notacao);
        this.atualizarInterfaceHistorico();
    }

    atualizarInterfaceHistorico() {
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
        $('body').on('click', '.piece', function (e) {
            e.stopPropagation();
            self._selecionarPeca($(this));
        });
        $('body').on('click', '.square-board', function () {
            self._tentarMoverPeca($(this));
        });
        $('body').on('click', '.promotion-choice', function () {
            const pecaPromovida = $(this).data('piece');
        });
    }

    _iniciarInterfaceHistorico() {
        $('.stats .notation').html('<h3>Histórico de Jogadas</h3><div class="notation-content"><table><thead><tr><th>#</th><th>Brancas</th><th>Pretas</th></tr></thead><tbody></tbody></table></div>');
    }

    _selecionarPeca(pecaClicada) {
        const classe = pecaClicada.attr('class');
        const casaId = pecaClicada.parent().attr('id');
        if (!classe.includes(this.vezDo)) {
            if (this.clicou === 1 && pecaClicada.parent().hasClass('possible')) {
                pecaClicada.parent().trigger('click');
            } else {
                alert("⚠️ Não é sua vez! Escolha uma peça " + this.vezDo);
            }
            return;
        }
        this.clicou = 1;
        this.ultimaCasa = casaId;
        this.pecaEscolhida = pecaClicada;
        this._mostrarMovimentosPossiveis(classe, casaId);
    }

    _mostrarMovimentosPossiveis(classe, casaId) {
        $('.square-board').removeClass('possible');
        const jaMoveuRei = (this.vezDo === 'white') ? this.whiteKingMoved : this.blackKingMoved;
        const jaMoveuTorres = (this.vezDo === 'white') ? this.whiteRooksMoved : this.blackRooksMoved;
        
        const moves = this.movimento.movimentosPossiveis(
            classe,
            casaId,
            jaMoveuRei,
            jaMoveuTorres
        );
        moves.forEach(m => $('#' + m).addClass('possible'));
    }

    _filtrarMovimentosLegais(peca, movimentos) {
        const cor = this.vezDo;
        const casaOrigemEl = peca.parent();
        const movimentosLegais = [];

        // Desanexa a peça principal do tabuleiro ANTES de começar o loop
        peca.detach();

        for (const casaDestinoId of movimentos) {
            const casaDestinoEl = $('#' + casaDestinoId);
            
            // Salva e desanexa a peça que seria capturada
            let pecaCapturada = casaDestinoEl.children('.piece').first();
            if (pecaCapturada.length > 0) {
                pecaCapturada.detach();
            }
            
            // 1. SIMULAÇÃO: Coloca a peça na casa de destino
            casaDestinoEl.append(peca);

            // 2. VERIFICAÇÃO
            if (!Xeque.estaEmXeque(cor, this.movimento)) {
                movimentosLegais.push(casaDestinoId);
            }

            // 3. DESFAZ A SIMULAÇÃO
            // Remove a peça da casa de destino
            peca.detach();
            // Coloca a peça capturada de volta, se ela existia
            if (pecaCapturada.length > 0) {
                casaDestinoEl.append(pecaCapturada);
            }
        }

        // Coloca a peça principal de volta em sua casa original
        casaOrigemEl.append(peca);

        return movimentosLegais;
    }
   _mostrarMovimentosPossiveis(classe, casaId) {
        $('.square-board').removeClass('possible');

        const jaMoveuRei = (this.vezDo === 'white') ? this.whiteKingMoved : this.blackKingMoved;
        const jaMoveuTorres = (this.vezDo === 'white') ? this.whiteRooksMoved : this.blackRooksMoved;

        // 1. Pega todos os movimentos "pseudo-legais" (o que a peça pode fazer em teoria)
        const movimentosPseudoLegais = this.movimento.movimentosPossiveis(
            classe, casaId, jaMoveuRei, jaMoveuTorres
        );

        // 2. Pega o elemento da peça que foi selecionada.
        const pecaSelecionada = $('#' + casaId).find('.piece');

        // 3. USA O FILTRO! Esta é a linha que faltava.
        const movimentosFinais = this._filtrarMovimentosLegais(pecaSelecionada, movimentosPseudoLegais);

        // 4. Mostra apenas os movimentos 100% legais na interface.
        movimentosFinais.forEach(m => $('#' + m).addClass('possible'));
    }

    _tentarMoverPeca(casaAlvo) {
        if (this.clicou !== 1) return;
        const casaDestinoId = casaAlvo.attr('id');
        const isMovimentoValido = casaDestinoId !== this.ultimaCasa && casaAlvo.hasClass('possible');
        if (!isMovimentoValido) return;
        const casaOrigemId = this.ultimaCasa;
        const pecaMovida = this.pecaEscolhida;
        const pecaCapturada = this._executarMovimento(pecaMovida, casaOrigemId, casaDestinoId);
        const infoRoque = this._tratarRoque(pecaMovida, casaOrigemId, casaDestinoId);
        this._atualizarFlagsDeRoque(pecaMovida, casaOrigemId);
        const isPromocao = this._tratarPromocao(pecaMovida, casaDestinoId);
        if (isPromocao) {
            return;
        }
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
        // implementa depois
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
        if (origemCol === 'e' && destinoCol === 'g') {
            const torre = $('#h' + linha).find('.piece');
            $('#f' + linha).html(torre);
            isRoquePequeno = true;
        }
        else if (origemCol === 'e' && destinoCol === 'c') {
            const torre = $('#a' + linha).find('.piece');
            $('#d' + linha).html(torre);
            isRoqueGrande = true;
        }
        return { isRoquePequeno, isRoqueGrande };
    }

    _tratarPromocao(peca, destino) {
        // aqui aplica a logica por ultimo
    }

    _finalizarJogada(origem, destino, peca, pecaCapturada, infoRoque, promocaoPara = null) {
        const notacao = this._gerarNotacaoAlgébrica(
            origem, destino, peca, pecaCapturada,
            infoRoque.isRoquePequeno, infoRoque.isRoqueGrande, promocaoPara
        );
        this.registrarJogada(notacao);
        this.vezDo = (this.vezDo === 'white') ? 'black' : 'white';
        this.clicou = 0;
        this.pecaEscolhida = null;
        this._verificarCondicoesDeFimDeJogo();
    }

    _verificarCondicoesDeFimDeJogo() {
        const corDoProximoJogador = this.vezDo;
        const corTexto = corDoProximoJogador === 'white' ? 'Brancas' : 'Pretas';
        
        if (Xeque.estaEmXeque(corDoProximoJogador, this.movimento)) {
            alert(`♟️ ${corTexto} estão em XEQUE!`);
        }
    }

    _gerarNotacaoAlgébrica(origem, destino, peca, pecaCapturada, isRoquePequeno, isRoqueGrande, promocaoPara) {
        const classePeca = peca.attr('class').split(' ')[1];
        const tipoPeca = classePeca.split('-')[0];
        const isCaptura = pecaCapturada.length > 0;
        let notacao = '';
        const nomePeca = { 'pawn': 'Peão', 'knight': 'Cavalo', 'bishop': 'Bispo', 'rook': 'Torre', 'queen': 'Rainha', 'king': 'Rei' }[tipoPeca];
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
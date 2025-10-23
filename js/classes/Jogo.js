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

    _mostrarToast(mensagem, tipo = 'info') {
        Swal.fire({
            text: mensagem,
            icon: tipo,
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 2500,
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

        this.registrarJogada(origem, destino, peca);

        // Verifique condições de xeque antes de inverter turno
        this._verificarCondicoesDeFimDeJogo();

        // Só depois mude a vez
        if (!this.gameOver) {
            this.vezDo = (this.vezDo === 'white') ? 'black' : 'white';
            this.jogadorAtual = (this.jogadorAtual === this.jogador1) ? this.jogador2 : this.jogador1;
            this.clicou = 0;
            this.pecaEscolhida = null;
            this.proximoTurno();
        }
    }

    _verificarCondicoesDeFimDeJogo() {
        console.log(" INICIANDO VERIFICAÇÃO DE FIM DE JOGO");

        // Remove destaque anterior
        $('.xeque-highlight').removeClass('xeque-highlight');

        
        // Precisamos verificar o estado do OPONENTE.
        const oponente = (this.vezDo === 'white') ? 'black' : 'white';
        console.log(`Verificando estado do Oponente: ${oponente}`);

        // VERIFICAÇÃO DE XEQUE
        console.log("1. Verificando xeque...");
        const emXeque = Xeque.estaEmXeque(oponente, this.movimento);

        if (emXeque) {
            console.log("2. Rei oponente em xeque! Verificando movimentos legais...");

            // Destaca o rei oponente (SEU PEDIDO DE "QUADRADO VERMELHO")
            $(`.king-${oponente}`).parent().addClass('xeque-highlight');

            const temMovimentos = this._verificarMovimentosLegais(oponente);
            console.log(`3. Movimentos legais encontrados: ${temMovimentos}`);

            if (!temMovimentos) {
                // É XEQUE-MATE
                console.log("🎉 XEQUE-MATE DETECTADO!");
                this.gameOver = true;
                // Se o oponente for 'white', 'Pretas' venceram. Se for 'black', 'Brancas' venceram.
                const vencedor = (oponente === 'white') ? 'Pretas' : 'Brancas';
                console.log(`Vencedor: ${vencedor}`);
                this._mostrarVencedorAnimado(vencedor);
                return;
            } else {
                // É SÓ XEQUE
                console.log(" Apenas xeque, não é mate");
                const corTexto = (oponente === 'white') ? 'Branco' : 'Preto';
                this._mostrarToast(`O Rei ${corTexto} está em Xeque!`, 'warning');
            }
        } else {
            // NÃO ESTÁ EM XEQUE
            console.log("4. Nenhum xeque. Verificando afogamento...");
            const temMovimentos = this._verificarMovimentosLegais(oponente);

            if (!temMovimentos) {
                // É AFOGAMENTO
                console.log(" AFOGAMENTO DETECTADO!");
                this.gameOver = true;
                this._mostrarEmpate();
            } else {
                // JOGO NORMAL
                console.log(" Jogo continua normalmente");
            }
        }
    }
    _mostrarVencedorAnimado(vencedor) {
        console.log(`CHAMANDO _mostrarVencedorAnimado: ${vencedor}`);

        Swal.fire({
            title: 'Xeque-Mate!',
            text: `As ${vencedor} venceram a partida!`,
            icon: 'success',
            confirmButtonText: 'Jogar Novamente'
        }).then((result) => {
            if (result.isConfirmed) {
                window.location.reload();
            }
        });
    }
    _verificarMovimentosLegais(cor) {
        console.log(`=== INICIANDO VERIFICAÇÃO DE MOVIMENTOS LEGAIS PARA ${cor} ===`);

        // Encontrar peças por cor usando filter
        const todasPecas = $('.piece');
        const pecasDoJogador = todasPecas.filter(function () {
            const classes = $(this).attr('class');
            return classes && classes.includes(cor);
        });

        console.log(`Total de peças no tabuleiro: ${todasPecas.length}`);
        console.log(`Peças do jogador ${cor}: ${pecasDoJogador.length}`);

        let movimentosLegaisTotais = 0;

        for (let i = 0; i < pecasDoJogador.length; i++) {
            const peca = $(pecasDoJogador[i]);
            const casaOrigemId = peca.parent().attr('id');
            const classe = peca.attr('class');

            // Verifica se a classe existe
            if (!classe) {
                console.log(`AVISO: Peça em ${casaOrigemId} não tem classe!`);
                continue;
            }

            const jaMoveuRei = (cor === 'white') ? this.whiteKingMoved : this.blackKingMoved;
            const jaMoveuTorres = (cor === 'white') ? this.whiteRooksMoved : this.blackRooksMoved;

            console.log(`\n--- Analisando peça: ${classe} em ${casaOrigemId} ---`);

            try {
                const movimentosPseudoLegais = this.movimento.movimentosPossiveis(
                    classe,
                    casaOrigemId,
                    jaMoveuRei,
                    jaMoveuTorres,
                    this.enPassantTarget
                );

                console.log(`Movimentos pseudo-legais: ${movimentosPseudoLegais.length} → ${movimentosPseudoLegais.join(', ')}`);

                // AQUI A MUDANÇA: Passamos a 'cor' que estamos verificando
                const movimentosLegais = this._filtrarMovimentosLegais(peca, movimentosPseudoLegais, cor);

                movimentosLegaisTotais += movimentosLegais.length;

                console.log(`Movimentos legais: ${movimentosLegais.length} → ${movimentosLegais.join(', ')}`);

                if (movimentosLegais.length > 0) {
                    console.log(`ENCONTRADOS MOVIMENTOS LEGAIS para ${cor}!`);
                    return true;
                }
            } catch (error) {
                console.error(`Erro ao calcular movimentos para peça em ${casaOrigemId}:`, error);
            }
        }

        console.log(`✗ NENHUM MOVIMENTO LEGAL para ${cor}. Total: ${movimentosLegaisTotais}`);
        return movimentosLegaisTotais > 0;
    }
    _mostrarEmpate() {
        Swal.fire({
            title: 'Afogamento!',
            text: 'Empate! O rei não está em xeque mas não tem movimentos legais.',
            icon: 'info',
            confirmButtonText: 'Jogar Novamente'
        }).then((result) => {
            if (result.isConfirmed) {
                window.location.reload();
            }
        });
    }

    _atualizarFlagsDeRoque(peca, origem) {
        const cor = peca.hasClass('white') ? 'white' : 'black';
        if (peca.hasClass('king')) {
            if (cor === 'white') this.whiteKingMoved = true;
            else this.blackKingMoved = true;
        } else if (peca.hasClass('rook')) {
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

    //  NOVO: Registro detalhado de jogadas (origem → destino)
    registrarJogada(origem, destino, peca) {
        const cor = this.vezDo === 'white' ? 'Brancas' : 'Pretas';
        const tipoPeca = peca.attr('class').split(' ')[1].split('-')[0];

        const mapaPecas = {
            pawn: 'Peão',
            knight: 'Cavalo',
            bishop: 'Bispo',
            rook: 'Torre',
            queen: 'Dama',
            king: 'Rei'
        };

        const nomePeca = mapaPecas[tipoPeca] || tipoPeca;
        const descricao = `${nomePeca} (${origem} → ${destino})`;

        this.historicoDeJogadas.push({
            cor,
            descricao,
            origem,
            destino,
            tipoPeca
        });

        this.atualizarInterfaceHistorico();
    }

    atualizarInterfaceHistorico() {
        const notationContainer = $('.stats .notation');
        if (!notationContainer.length) return;

        notationContainer.empty().append('<h3>Histórico de Jogadas</h3>');
        let html = '<div class="notation-content"><table><thead><tr><th>#</th><th>Brancas</th><th>Pretas</th></tr></thead><tbody>';

        for (let i = 0; i < this.historicoDeJogadas.length; i += 2) {
            const moveIndex = (i / 2) + 1;
            const jogadaBrancas = this.historicoDeJogadas[i]
                ? this.historicoDeJogadas[i].descricao
                : '';
            const jogadaPretas = this.historicoDeJogadas[i + 1]
                ? this.historicoDeJogadas[i + 1].descricao
                : '';
            html += `<tr>
                        <td class="move-number">${moveIndex}.</td>
                        <td class="brancas-move">${jogadaBrancas}</td>
                        <td class="pretas-move">${jogadaPretas}</td>
                    </tr>`;
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

        // AQUI A MUDANÇA: Passamos 'this.vezDo', a cor do jogador atual
        const movimentosFinais = this._filtrarMovimentosLegais(pecaSelecionada, movimentosPseudoLegais, this.vezDo);

        movimentosFinais.forEach(m => $('#' + m).addClass('possible'));
    }

    _filtrarMovimentosLegais(peca, movimentos, corParaVerificar) {
        // AQUI A MUDANÇA: Usamos o parâmetro 'corParaVerificar'. 
        // Se ele não for passado, usamos this.vezDo como segurança.
        const cor = corParaVerificar || this.vezDo;
        const casaOrigemEl = peca.parent();
        const casaOrigemId = casaOrigemEl.attr('id');
        const movimentosLegais = [];

        console.log(`=== FILTRANDO MOVIMENTOS LEGAIS ===`);
        console.log(`Peça: ${peca.attr('class')} em ${casaOrigemId}`);
        console.log(`Verificando para a cor: ${cor}`); // Log para ajudar a debugar
        console.log(`Movimentos a verificar: ${movimentos.length} → ${movimentos.join(', ')}`);

        // Verificação de segurança
        if (!casaOrigemId) {
            console.error('Erro: casaOrigemId não definida');
            return [];
        }

        for (const casaDestinoId of movimentos) {
            // Verificar se a casa de destino existe
            const casaDestinoEl = $('#' + casaDestinoId);
            if (casaDestinoEl.length === 0) {
                console.warn(`Casa de destino não encontrada: ${casaDestinoId}`);
                continue;
            }

            console.log(`--- Verificando movimento: ${casaOrigemId} → ${casaDestinoId} ---`);

            // Guardar estado ANTES da simulação
            const pecaCapturada = casaDestinoEl.children('.piece').first();
            const pecaCapturadaClone = pecaCapturada.length > 0 ? pecaCapturada.clone() : null;

            try {
                // 1. REMOVER peças temporariamente
                if (pecaCapturada.length > 0) {
                    pecaCapturada.detach();
                }
                peca.detach();

                // 2. MOVER peça para destino
                casaDestinoEl.append(peca);

                // 3. VERIFICAR XEQUE (após o movimento)
                // AQUI A MUDANÇA: 'cor' agora é a cor correta
                console.log(`Verificando xeque para ${cor} após movimento...`);
                const aindaEmXeque = Xeque.estaEmXeque(cor, this.movimento);
                console.log(`Resultado: ${aindaEmXeque ? 'EM XEQUE' : 'SAFE'}`);

                if (!aindaEmXeque) {
                    movimentosLegais.push(casaDestinoId);
                    console.log(`✓ Movimento legal: ${casaDestinoId}`);
                } else {
                    console.log(`✗ Movimento ilegal (xeque): ${casaDestinoId}`);
                }

            } catch (error) {
                console.error(`Erro ao simular movimento ${casaOrigemId} → ${casaDestinoId}:`, error);
            } finally {
                // 4. RESTAURAR ESTADO ORIGINAL (IMPORTANTE!)

                // Remover peça do destino
                peca.detach();

                // Restaurar na posição original
                casaOrigemEl.append(peca);

                // Restaurar peça capturada (se existia)
                if (pecaCapturadaClone && pecaCapturadaClone.length > 0) {
                    casaDestinoEl.append(pecaCapturadaClone);
                } else if (pecaCapturada.length > 0) {
                    // Fallback: se o clone não funcionou
                    casaDestinoEl.append(pecaCapturada);
                }

                console.log(`Estado restaurado: peça de volta para ${casaOrigemId}`);
            }
        }

        console.log(`=== RESULTADO: ${movimentosLegais.length} movimentos legais → ${movimentosLegais.join(', ')} ===`);
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

    _tratarPromocao(peca, destino) { return false; }



    _gerarNotacaoAlgébrica(origem, destino, peca, pecaCapturada, isRoquePequeno, isRoqueGrande, promocaoPara) {
        if (!peca || !peca.attr('class')) return "Jogada inválida";
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
        return notacao;
    }
}

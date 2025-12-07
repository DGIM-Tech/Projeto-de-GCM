// js/classes/Jogo.js
import { Tabuleiro } from './Tabuleiro.js';
import { Movimento } from './Movimento.js';
import { Xeque } from './Xeque.js';


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
        this.movimentoPendente = null;
    }

    girarTabuleiro() {
        const isModoAmigo = this.jogador1.tipo === 'Humano' && this.jogador2.tipo === 'Humano';
        if (!isModoAmigo) return;

        const boardWrapper = document.querySelector('.board-wrapper');
        if (!boardWrapper) return;

        if (this.vezDo === 'black') {
            boardWrapper.classList.add('girarPretas');
            window.perspectivaPretas = true; // Usando a mesma variável global
        } else {
            boardWrapper.classList.remove('girarPretas');
            window.perspectivaPretas = false;
        }

        // Chama a função global definida no index.js
        if (typeof window.atualizarLabels === 'function') {
            window.atualizarLabels();
        }
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

    _tentarMoverPeca(casaAlvo) {
        if (this.clicou !== 1 && this.jogadorAtual.tipo === 'Humano') {
            this._mostrarToast('Selecione uma peça para mover.', 'info');
            return;
        }

        const casaDestinoId = casaAlvo.attr('id');
        const isMovimentoValido = casaDestinoId !== this.ultimaCasa && casaAlvo.hasClass('possible');

        if (!isMovimentoValido && this.jogadorAtual.tipo === 'Humano') {
            console.log("Movimento inválido ou não é a vez do humano");
            return;
        }

        const casaOrigemId = this.ultimaCasa;
        const pecaMovida = this.pecaEscolhida;

        console.log(`Tentando mover: ${casaOrigemId} → ${casaDestinoId}`);

        // *** CORREÇÃO: Primeiro verifica se é roque, DEPOIS atualiza flags ***
        const infoRoque = this._tratarRoque(pecaMovida, casaOrigemId, casaDestinoId);

        // Executa o movimento do rei (e da torre, se for roque)
        const pecaCapturada = this._executarMovimento(pecaMovida, casaOrigemId, casaDestinoId);

        // *** CORREÇÃO: Só atualiza flags DEPOIS do movimento ***
        this._atualizarFlagsDeRoque(pecaMovida, casaOrigemId);

        // *** CORREÇÃO CRÍTICA AQUI ***
        const isPromocao = this._tratarPromocao(pecaMovida, casaDestinoId, casaOrigemId, pecaCapturada);

        if (isPromocao) {
            // console.log("Promoção detectada - pausando turno para escolha da peça");
            return;
        }

        // console.log("Sem promoção - finalizando turno normalmente");
        this.finalizarTurno(casaOrigemId, casaDestinoId, pecaMovida, pecaCapturada, infoRoque);
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

    __tentarMoverPeca(casaAlvo) {
        if (this.clicou !== 1 && this.jogadorAtual.tipo === 'Humano') {
            this._mostrarToast('Selecione uma peça para mover.', 'info');
            return;
        }

        const casaDestinoId = casaAlvo.attr('id');
        const isMovimentoValido = casaDestinoId !== this.ultimaCasa && casaAlvo.hasClass('possible');

        if (!isMovimentoValido && this.jogadorAtual.tipo === 'Humano') {
            console.log("Movimento inválido ou não é a vez do humano");
            return;
        }

        const casaOrigemId = this.ultimaCasa;
        const pecaMovida = this.pecaEscolhida;

        console.log(`Tentando mover: ${casaOrigemId} → ${casaDestinoId}`);

        // *** CORREÇÃO: Primeiro verifica se é roque, DEPOIS atualiza flags ***
        const infoRoque = this._tratarRoque(pecaMovida, casaOrigemId, casaDestinoId);

        // Executa o movimento do rei (e da torre, se for roque)
        const pecaCapturada = this._executarMovimento(pecaMovida, casaOrigemId, casaDestinoId);

        // *** CORREÇÃO: Só atualiza flags DEPOIS do movimento ***
        this._atualizarFlagsDeRoque(pecaMovida, casaOrigemId);

        // *** CORREÇÃO CRÍTICA AQUI ***
        const isPromocao = this._tratarPromocao(pecaMovida, casaDestinoId, casaOrigemId, pecaCapturada);

        if (isPromocao) {
            // console.log("Promoção detectada - pausando turno para escolha da peça");
            return;
        }

        // console.log("Sem promoção - finalizando turno normalmente");
        this.finalizarTurno(casaOrigemId, casaDestinoId, pecaMovida, pecaCapturada, infoRoque);
    }
    // continuarTurnoAposPromocao(origem, destino, peca, pecaCapturada, infoRoque, promocaoPara) {
    //     console.log("Continuando turno após promoção para:", promocaoPara);
    //     this.finalizarTurno(origem, destino, peca, pecaCapturada, infoRoque, promocaoPara);
    // }
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

            // 🟢 CHAMADA DO MÉTODO DE ROTAÇÃO AQUI 
            // Somente no modo 'amigo' (Humano vs Humano)
            if (this.jogador1.tipo === 'Humano' && this.jogador2.tipo === 'Humano') {
                this.girarTabuleiro();
            }

            this.proximoTurno();
        }
        // Salva o estado do jogo no cache após cada jogada
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
            confirmButtonText: 'Jogar Novamente',
            backdrop: false, // remove o fundo escuro
            position: 'top-end', // canto superior direito
            toast: true, // estilo notificação
            timer: 10000, // fecha automaticamente em 10s
            timerProgressBar: true,
            customClass: {
                popup: 'swal-xeque-mate'
            }
        }).then((result) => {
            if (result.isConfirmed) {
                window.location.reload();
            }
        });
    }

    _verificarMovimentosLegais(cor) {
        console.log(`=== INICIANDO VERIFICAÇÃO DE MOVIMENTOS LEGAIS PARA ${cor} ===`);

        // CORREÇÃO: Só considerar peças que estão no tabuleiro
        const todasPecas = $('.square-board .piece'); // Só peças dentro de casas do tabuleiro
        const pecasDoJogador = todasPecas.filter(function () {
            const classes = $(this).attr('class');
            const parent = $(this).parent();
            // Verifica se está em uma casa válida do tabuleiro
            return classes && classes.includes(cor) &&
                parent.hasClass('square-board') &&
                parent.attr('id') &&
                parent.attr('id').match(/^[a-h][1-8]$/);
        });

        console.log(`Total de peças no tabuleiro: ${todasPecas.length}`);
        console.log(`Peças do jogador ${cor}: ${pecasDoJogador.length}`);

        let movimentosLegaisTotais = 0;

        for (let i = 0; i < pecasDoJogador.length; i++) {
            const peca = $(pecasDoJogador[i]);
            const casaOrigemEl = peca.parent();

            // VERIFICAÇÃO CRÍTICA: Garantir que a casa tem ID
            if (!casaOrigemEl.length || !casaOrigemEl.attr('id')) {
                console.log(`AVISO: Peça sem casa parent válida:`, peca.attr('class'));
                continue;
            }

            const casaOrigemId = casaOrigemEl.attr('id');
            const classe = peca.attr('class');

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

                const movimentosLegais = this._filtrarMovimentosLegais(peca, movimentosPseudoLegais, cor);
                movimentosLegaisTotais += movimentosLegais.length;

                console.log(`Movimentos legais: ${movimentosLegais.length} → ${movimentosLegais.join(', ')}`);

                if (movimentosLegais.length > 0) {
                    // console.log(`✅ ENCONTRADOS MOVIMENTOS LEGAIS para ${cor}!`);
                    return true;
                }
            } catch (error) {
                console.error(`❌ Erro ao calcular movimentos para peça em ${casaOrigemId}:`, error);
            }
        }

        console.log(`❌ NENHUM MOVIMENTO LEGAL para ${cor}. Total: ${movimentosLegaisTotais}`);
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
        // Obter a string completa de classes
        const pecaClasses = peca.attr('class');
        if (!pecaClasses) return; // Segurança, caso a peça não tenha classe

        const cor = pecaClasses.includes('white') ? 'white' : 'black';

        // *** CORREÇÃO: Usar includes() para 'king' e 'rook' ***
        // A verificação anterior (peca.hasClass('king')) falhava.

        if (pecaClasses.includes('king')) {
            console.log(`♔ FLAG DE ROQUE: Rei ${cor} moveu-se. Roque desabilitado.`);
            if (cor === 'white') {
                this.whiteKingMoved = true;
            } else {
                this.blackKingMoved = true;
            }
        }
        else if (pecaClasses.includes('rook')) {
            if (cor === 'white') {
                if (origem === 'a1') {
                    this.whiteRooksMoved.a1 = true;
                    // console.log(`♜ FLAG DE ROQUE: Torre branca 'a1' moveu-se.`);
                }
                if (origem === 'h1') {
                    this.whiteRooksMoved.h1 = true;
                    // console.log(`♜ FLAG DE ROQUE: Torre branca 'h1' moveu-se.`);
                }
            } else { // 'black'
                if (origem === 'a8') {
                    this.blackRooksMoved.a8 = true;
                    // console.log(`♜ FLAG DE ROQUE: Torre preta 'a8' moveu-se.`);
                }
                if (origem === 'h8') {
                    this.blackRooksMoved.h8 = true;
                    // console.log(`♜ FLAG DE ROQUE: Torre preta 'h8' moveu-se.`);
                }
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
        this.atualizarInterfaceHistoricoMobile();
    }

    atualizarInterfaceHistoricoMobile() {
        const notationMobile = document.getElementById('notationMobile');
        if (!notationMobile) return;

        let html = `
            <table class="notation-mobile-table">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Brancas</th>
                        <th>Pretas</th>
                    </tr>
                </thead>
                <tbody>
        `;

        for (let i = 0; i < this.historicoDeJogadas.length; i += 2) {
            const moveIndex = (i / 2) + 1;
            const jogadaBrancas = this.historicoDeJogadas[i]
                ? this.historicoDeJogadas[i].descricao
                : '';
            const jogadaPretas = this.historicoDeJogadas[i + 1]
                ? this.historicoDeJogadas[i + 1].descricao
                : '';

            html += `
                <tr>
                    <td class="move-number">${moveIndex}.</td>
                    <td class="brancas-move">${jogadaBrancas}</td>
                    <td class="pretas-move">${jogadaPretas}</td>
                </tr>
            `;
        }

        html += `
                </tbody>
            </table>
        `;

        notationMobile.innerHTML = html;
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
                //    console.warn(`Casa de destino não encontrada: ${casaDestinoId}`);
                continue;
            }

            //   console.log(`--- Verificando movimento: ${casaOrigemId} → ${casaDestinoId} ---`);

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

        //console.log(`=== RESULTADO: ${movimentosLegais.length} movimentos legais → ${movimentosLegais.join(', ')} ===`);
        return movimentosLegais;
    }
    _executarMovimento(peca, origem, destino) {
        const casaDestinoEl = $('#' + destino);
        const pecaCapturada = casaDestinoEl.find('.piece');

        //Verifica se houve captura
        if (pecaCapturada.length > 0) {
            // Faz uma cópia da peça capturada
            const pecaClone = pecaCapturada.clone();
            const classeCapturada = pecaCapturada.attr('class') || '';

            // Identifica a cor da peça capturada
            const corCapturada = classeCapturada.includes('white') ? 'white' : 'black';

            // Remove do tabuleiro
            pecaCapturada.remove();

            // Adiciona na área correta de capturas
            if (corCapturada === 'white') {
                // Preto capturou uma peça branca → vai para o topo
                document.querySelector('.capturadas-brancas').appendChild(pecaClone[0]);
            } else {
                // Branco capturou uma peça preta → vai para a parte inferior
                document.querySelector('.capturadas-pretas').appendChild(pecaClone[0]);
            }
        }

        // Move a peça para o destino
        casaDestinoEl.html(peca);
        if (origem) $('#' + origem).empty();

        // Limpa os destaques de movimento
        $('.square-board').removeClass('possible');

        return pecaCapturada;
    }

    _tratarRoque(peca, origem, destino) {
        console.log("♜🟢 MÉTODO _tratarRoque INICIADO!");

        // *** CORREÇÃO 1: Obter a string de classes ***
        const pecaClasses = peca.attr('class');

        console.log("♜ Peça:", pecaClasses);
        console.log("♜ Origem:", origem, "Destino:", destino);

        // *** CORREÇÃO 2: A verificação estava errada ***
        // A classe da peça é 'king-white' ou 'king-black', não 'king'.
        // Devemos verificar se a string de classes *inclui* 'king'.
        if (!pecaClasses || !pecaClasses.includes('king')) {
            console.log("♜❌ Não é rei, retornando false");
            return { isRoquePequeno: false, isRoqueGrande: false };
        }

        const origemCol = origem[0];
        const destinoCol = destino[0];
        const linha = origem[1]; // '1' ou '8'
        const cor = this.vezDo;

        let isRoquePequeno = false, isRoqueGrande = false;

        console.log(`♜ Verificando roque: ${origem} → ${destino}, linha: ${linha}, cor: ${cor}`);

        // Verifica roque pequeno (e→g)
        if (origemCol === 'e' && destinoCol === 'g' &&
            ((cor === 'white' && linha === '1') || (cor === 'black' && linha === '8'))) {

            console.log("♜🟡 ROQUE PEQUENO detectado!");
            const torreOrigem = (cor === 'white') ? 'h1' : 'h8';
            const $torre = $('#' + torreOrigem).find('.piece');

            // Verificação mais segura (rook da cor certa)
            if ($torre.length > 0 && $torre.hasClass('rook-' + cor)) {
                const torreDestino = (cor === 'white') ? 'f1' : 'f8';
                console.log(`♜ Movendo torre (pequeno): ${torreOrigem} → ${torreDestino}`);
                this._executarMovimentoRoque(torreOrigem, torreDestino); //
                isRoquePequeno = true;
            } else {
                console.log("♜❌ Roque pequeno IMPOSSÍVEL - torre não encontrada ou não é rook");
            }
        }

        // Verifica roque grande (e→c)
        else if (origemCol === 'e' && destinoCol === 'c' &&
            ((cor === 'white' && linha === '1') || (cor === 'black' && linha === '8'))) {

            console.log("♜🟡 ROQUE GRANDE detectado!");
            const torreOrigem = (cor === 'white') ? 'a1' : 'a8';
            const $torre = $('#' + torreOrigem).find('.piece');

            // Verificação mais segura (rook da cor certa)
            if ($torre.length > 0 && $torre.hasClass('rook-' + cor)) {
                const torreDestino = (cor === 'white') ? 'd1' : 'd8';
                console.log(`♜ Movendo torre (grande): ${torreOrigem} → ${torreDestino}`);
                this._executarMovimentoRoque(torreOrigem, torreDestino); //
                isRoqueGrande = true;
            } else {
                console.log("♜❌ Roque grande IMPOSSÍVEL - torre não encontrada ou não é rook");
            }
        }

        console.log("♜🔚 MÉTODO _tratarRoque FINALIZADO!");
        return { isRoquePequeno, isRoqueGrande };
    }

    /**
     * Método auxiliar para mover a torre durante o roque
     * (Este método já estava correto no seu arquivo, incluído para completude)
     */
    _executarMovimentoRoque(torreOrigem, torreDestino) {
        console.log(`♜🔄 _executarMovimentoRoque CHAMADO: ${torreOrigem} → ${torreDestino}`);

        const $torre = $('#' + torreOrigem).find('.piece');
        console.log(`♜ Torre em ${torreOrigem}:`, $torre.length > 0 ? "ENCONTRADA" : "NÃO ENCONTRADA");

        if ($torre.length > 0) {
            console.log(`♜ Classe da torre:`, $torre.attr('class'));
            console.log(`♜ Movendo torre: ${torreOrigem} → ${torreDestino}`);

            // Move a torre para o destino
            $('#' + torreDestino).html($torre.clone());
            // Limpa a origem
            $('#' + torreOrigem).empty();

            console.log(`♜✅ Torre movida com sucesso!`);
        } else {
            console.error(`♜❌ ERRO: Torre não encontrada em ${torreOrigem}`);
        }
    }

    promocaoConcluida(tipoPecaEscolhida) {
        if (!this.movimentoPendente) {
            console.error("Nenhum movimento pendente para promoção!");
            return;
        }

        // 1. Pega as informações salvas
        const { origem, destino, peca, pecaCapturada } = this.movimentoPendente;

        console.log(`Promovendo peão para: ${tipoPecaEscolhida}`);

        // 2. Remove o peão (o 'peca' do movimentoPendente)
        peca.remove();

        // 3. Adiciona a nova peça
        const novaPeca = $(`<div class="piece ${tipoPecaEscolhida}-${this.vezDo}"></div>`);
        $(`#${destino}`).html(novaPeca);

        // 4. Limpa o estado de pendência
        this.movimentoPendente = null;

        // 5. RETOMA O JOGO: Chama o finalizarTurno que foi pausado
        // Passa a 'novaPeca' como a peça que se moveu
        this.finalizarTurno(origem, destino, novaPeca, pecaCapturada, null, tipoPecaEscolhida);

        console.log("Promoção concluída com sucesso!");
    }

    // NOVO MÉTODO: Retoma o fluxo do jogo após a promoção ser concluída (pelo modal)
    continuarTurnoAposPromocao(origem, destino, peca, pecaCapturada, infoRoque, promocaoPara) {
        // Chama a função de finalização de turno, que estava sendo evitada pela promoção.
        // Aqui, promocaoPara não será null, se a promoção ocorreu.
        this.finalizarTurno(origem, destino, peca, pecaCapturada, infoRoque, promocaoPara);
    }

    _tratarPromocao(peca, destino, origem, pecaCapturada) {
        console.log("=== VERIFICANDO PROMOÇÃO ===");

        const classes = peca.attr('class');
        console.log("Peça:", classes);
        console.log("Destino:", destino);

        if (!classes || !classes.includes('pawn')) {
            console.log("❌ Não é peão, sem promoção");
            return false;
        }

        const linha = parseInt(destino[1]);
        const cor = classes.includes('white') ? 'white' : 'black';

        console.log("Linha destino:", linha, "Cor:", cor);

        const isUltimaLinha = (cor === 'white' && linha === 8) || (cor === 'black' && linha === 1);

        console.log("É última linha?", isUltimaLinha);

        if (!isUltimaLinha) {
            console.log("❌ Não chegou na última linha, sem promoção");
            return false;
        }

        console.log("🎉 PROMOÇÃO DETECTADA! Exibindo modal...");

        // Guarda as informações da jogada
        this.movimentoPendente = {
            peca: peca,
            destino: destino,
            origem: origem,
            pecaCapturada: pecaCapturada ? pecaCapturada : null
        };

        // Exibe o modal
        $('#promotionModal').show();

        // Registrar eventos para os botões (usando a classe 'promote')
        this._registrarEventosPromocao();

        return true;
    }

    // Método para registrar eventos do modal
    _registrarEventosPromocao() {
        const self = this;

        // Remove eventos anteriores
        $('#promotionModal .promote').off('click.promocao');

        // Adiciona novos eventos
        $('#promotionModal .promote').on('click.promocao', function () {
            const tipoPeca = $(this).data('piece');
            console.log(`Peça selecionada para promoção: ${tipoPeca}`);

            // Fecha o modal
            $('#promotionModal').hide();

            // Processa a promoção
            if (self.movimentoPendente) {
                self.promocaoConcluida(tipoPeca);
            } else {
                console.error("Erro: Nenhum movimento pendente para promoção!");
            }
        });
    }

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
    girarTabuleiro() {
        const board = document.querySelector('.board');
        if (!board) return;

        if (this.vezDo === 'black') {
            board.classList.add('girarPretas');
        } else {
            board.classList.remove('girarPretas');
        }
    }
}
// CLASSE TABULEIRO
class Tabuleiro {
    constructor() {
        this.initialPosition = {
            a8: 'rook-black', b8: 'knight-black', c8: 'bishop-black', d8: 'queen-black',
            e8: 'king-black', f8: 'bishop-black', g8: 'knight-black', h8: 'rook-black',

            a7: 'pawn-black', b7: 'pawn-black', c7: 'pawn-black', d7: 'pawn-black',
            e7: 'pawn-black', f7: 'pawn-black', g7: 'pawn-black', h7: 'pawn-black',

            a2: 'pawn-white', b2: 'pawn-white', c2: 'pawn-white', d2: 'pawn-white',
            e2: 'pawn-white', f2: 'pawn-white', g2: 'pawn-white', h2: 'pawn-white',

            a1: 'rook-white', b1: 'knight-white', c1: 'bishop-white', d1: 'queen-white',
            e1: 'king-white', f1: 'bishop-white', g1: 'knight-white', h1: 'rook-white'
        };
    }

    printBoard() {
        var light = 1;
        var columns = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
        for (var l = 8; l >= 1; --l) {
            for (var c = 0; c < columns.length; ++c) {
                var sq = columns[c] + l;
                var lightdark = (light == 1) ? 'light' : 'dark';
                $('.board').append('<div class="square-board ' + lightdark + '" id="' + sq + '"></div>');
                light ^= 1;
            }
            light ^= 1;
        }
    }

    inicializarPecas() {
        $('.square-board').each((_, square) => {
            const sq = $(square).attr('id');
            if (this.initialPosition.hasOwnProperty(sq)) {
                $(square).html(`<div class="piece ${this.initialPosition[sq]}"></div>`)
            }
        });
    }

    inicar() {
        this.printBoard();
        this.inicializarPecas();
    }
}

// CLASSE MOVIMENTO
class Movimento {
    constructor() {
        this.colunas = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    }

    movimentosPeao(pieceClass, coluna, linha, idxCol) {
        let movimentos = [];
        let direcao = pieceClass.includes('pawn-white') ? 1 : -1;
        let linhaInicial = pieceClass.includes('pawn-white') ? 2 : 7;
        let corInimiga = pieceClass.includes('pawn-white') ? 'black' : 'white';

        let destino1 = coluna + (linha + direcao);
        if ($('#' + destino1 + ' .piece').length === 0) {
            movimentos.push(destino1);
            if (linha === linhaInicial) {
                let destino2 = coluna + (linha + direcao * 2);
                if ($('#' + destino2 + ' .piece').length === 0) {
                    movimentos.push(destino2);
                }
            }
        }
        movimentos.push(...this.movimentosCaptura(coluna, linha, idxCol, direcao, corInimiga));
        return movimentos;
    }

    movimentosCaptura(coluna, linha, idxCol, direcao, corInimiga) {
        let movimentos = [];
        if (idxCol > 0) {
            let destino = this.colunas[idxCol - 1] + (linha + direcao);
            if ($('#' + destino + ' .piece').length > 0 &&
                $('#' + destino + ' .piece').attr('class').includes(corInimiga)) {
                movimentos.push(destino);
            }
        }
        if (idxCol < 7) {
            let destino = this.colunas[idxCol + 1] + (linha + direcao);
            if ($('#' + destino + ' .piece').length > 0 &&
                $('#' + destino + ' .piece').attr('class').includes(corInimiga)) {
                movimentos.push(destino);
            }
        }
        return movimentos;
    }

    movimentosBispo(pieceClass, coluna, linha, idxCol) {
        let movimentos = [];
        let corPeca = pieceClass.includes('white') ? 'white' : 'black';
        const direcoes = [ [1, 1], [-1, 1], [1, -1], [-1, -1] ];
        for (const [colDelta, rowDelta] of direcoes) {
            for (let step = 1; step <= 7; step++) {
                let newIdxCol = idxCol + colDelta * step;
                let newLinha = linha + rowDelta * step;
                if (newIdxCol < 0 || newIdxCol > 7 || newLinha < 1 || newLinha > 8) break;
                let destinoId = this.colunas[newIdxCol] + newLinha;
                let $pecaDestino = $('#' + destinoId + ' .piece');
                if ($pecaDestino.length === 0) {
                    movimentos.push(destinoId);
                } else {
                    let classePecaDestino = $pecaDestino.attr('class');
                    if (!classePecaDestino.includes(corPeca)) {
                        movimentos.push(destinoId);
                    }
                    break;
                }
            }
        }
        return movimentos;
    }

    movimentosTorre(pieceClass, coluna, linha, idxCol) {
        let movimentos = [];
        let corPeca = pieceClass.includes('white') ? 'white' : 'black';
        const direcoes = [ [1, 0], [-1, 0], [0, 1], [0, -1] ];
        for (const [colDelta, rowDelta] of direcoes) {
            for (let step = 1; step <= 7; step++) {
                let newIdxCol = idxCol + colDelta * step;
                let newLinha = linha + rowDelta * step;
                if (newIdxCol < 0 || newIdxCol > 7 || newLinha < 1 || newLinha > 8) break;
                let destinoId = this.colunas[newIdxCol] + newLinha;
                let $pecaDestino = $('#' + destinoId + ' .piece');
                if ($pecaDestino.length === 0) {
                    movimentos.push(destinoId);
                } else {
                    let classePecaDestino = $pecaDestino.attr('class');
                    if (!classePecaDestino.includes(corPeca)) {
                        movimentos.push(destinoId);
                    }
                    break;
                }
            }
        }
        return movimentos;
    }

    movimentosCavalo(pieceClass, coluna, linha, idxCol) {
        let movimentos = [];
        let corPeca = pieceClass.includes('white') ? 'white' : 'black';
        const offsets = [
            [1, 2], [2, 1], [-1, 2], [-2, 1],
            [1, -2], [2, -1], [-1, -2], [-2, -1]
        ];
        for (const [colDelta, rowDelta] of offsets) {
            let newIdxCol = idxCol + colDelta;
            let newLinha = linha + rowDelta;
            if (newIdxCol < 0 || newIdxCol > 7 || newLinha < 1 || newLinha > 8) continue;
            let destinoId = this.colunas[newIdxCol] + newLinha;
            let $pecaDestino = $('#' + destinoId + ' .piece');
            if ($pecaDestino.length === 0 || !$pecaDestino.attr('class').includes(corPeca)) {
                movimentos.push(destinoId);
            }
        }
        return movimentos;
    }

    movimentosRei(pieceClass, coluna, linha, idxCol, jaMoveuRei, jaMoveuTorres) {
        let movimentos = [];
        let corPeca = pieceClass.includes('white') ? 'white' : 'black';
        const offsets = [
            [1, 0], [-1, 0], [0, 1], [0, -1],
            [1, 1], [1, -1], [-1, 1], [-1, -1]
        ];

        for (const [colDelta, rowDelta] of offsets) {
            let newIdxCol = idxCol + colDelta;
            let newLinha = linha + rowDelta;
            if (newIdxCol < 0 || newIdxCol > 7 || newLinha < 1 || newLinha > 8) continue;
            let destinoId = this.colunas[newIdxCol] + newLinha;
            let $pecaDestino = $('#' + destinoId + ' .piece');
            if ($pecaDestino.length === 0 || !$pecaDestino.attr('class').includes(corPeca)) {
                movimentos.push(destinoId);
            }
        }

        // Roque
        if (!jaMoveuRei) {
        // Pequeno (g1 ou g8)
            if (!jaMoveuTorres['h'] &&
                $('#' + this.colunas[idxCol + 1] + linha).children().length === 0 &&
                $('#' + this.colunas[idxCol + 2] + linha).children().length === 0) {
                movimentos.push(this.colunas[idxCol + 2] + linha);
            }
            // Grande (c1 ou c8)
            if (!jaMoveuTorres['a'] &&
                $('#' + this.colunas[idxCol - 1] + linha).children().length === 0 &&
                $('#' + this.colunas[idxCol - 2] + linha).children().length === 0 &&
                $('#' + this.colunas[idxCol - 3] + linha).children().length === 0) {
                movimentos.push(this.colunas[idxCol - 2] + linha);
            }
        }
        return movimentos;
    }

    movimentosRainha(pieceClass, coluna, linha, idxCol) {
        let movimentos = [];
        movimentos.push(...this.movimentosTorre(pieceClass, coluna, linha, idxCol));
        movimentos.push(...this.movimentosBispo(pieceClass, coluna, linha, idxCol));
        return movimentos;
    }

    movimentosPossiveis(pieceClass, squareId, jaMoveuRei = false, jaMoveuTorres = {a:false,h:false}) {
        let coluna = squareId[0];
        let linha = parseInt(squareId[1]);
        let idxCol = this.colunas.indexOf(coluna);

        if (pieceClass.includes('pawn')) return this.movimentosPeao(pieceClass, coluna, linha, idxCol);
        if (pieceClass.includes('bishop')) return this.movimentosBispo(pieceClass, coluna, linha, idxCol);
        if (pieceClass.includes('rook')) return this.movimentosTorre(pieceClass, coluna, linha, idxCol);
        if (pieceClass.includes('knight')) return this.movimentosCavalo(pieceClass, coluna, linha, idxCol);
        if (pieceClass.includes('king')) return this.movimentosRei(pieceClass, coluna, linha, idxCol, jaMoveuRei, jaMoveuTorres);
        if (pieceClass.includes('queen')) return this.movimentosRainha(pieceClass, coluna, linha, idxCol);

        return [];
    }
}


// CLASSE JOGO (Com RF05 - Registro de Jogadas Descritivo)
class Jogo {
    constructor() {
        this.tabuleiro = new Tabuleiro();
        this.movimento = new Movimento();
        this.vezDo = 'white';
        this.clicou = 0;
        this.pecaEscolhida = null;
        this.ultimaCasa = '';

        // RF05: Histórico de Jogadas
        this.historicoDeJogadas = []; 

        // Flags de movimento para Roque
        this.whiteKingMoved = false;
        this.blackKingMoved = false;
        this.whiteRooksMoved = {a:false,h:false};
        this.blackRooksMoved = {a:false,h:false};
    }

    iniciar() {
        this.tabuleiro.inicar();
        this.registrarEventos();
    }
    
    // NOVO: Gera a notação no formato descritivo: [Tipo de peça] [Origem]-[Destino]
    gerarNotacaoAlgébrica(origem, destino, peca, pecaCapturada, isRoquePequeno, isRoqueGrande, promocaoPara) {
        
        const classePeca = peca.attr('class').split(' ')[1];
        const tipoPeca = classePeca.split('-')[0];
        const isCaptura = pecaCapturada.length > 0;
        
        let notacao = '';
        
        const nomePeca = {
            'pawn': 'Peão',
            'knight': 'Cavalo',
            'bishop': 'Bispo',
            'rook': 'Torre',
            'queen': 'Rainha',
            'king': 'Rei'
        }[tipoPeca];

        if (isRoquePequeno) return 'Roque-Pequeno (O-O)'; 
        if (isRoqueGrande) return 'Roque-Grande (O-O-O)'; 

        notacao += nomePeca + ' ' + origem + '-' + destino;

        if (isCaptura) {
            notacao += ' (Captura)';
        }

        if (promocaoPara) {
            const nomePromocao = promocaoPara.charAt(0).toUpperCase() + promocaoPara.slice(1);
            notacao += ` (Promove a ${nomePromocao})`;
        }
        
        return notacao;
    }
    
    // NOVO: Registra a jogada no array e atualiza a interface (RF05)
    registrarJogada(notacao) {
        this.historicoDeJogadas.push(notacao);
        this.atualizarInterfaceHistorico();
    }

    // NOVO: Renderiza o histórico em formato de tabela (linhas separadas por jogada)
    atualizarInterfaceHistorico() {
        // Remove o wrapper anterior para evitar duplicação antes de injetar a tabela
        $('.stats .notation .notation-content').remove();

        // Inicia a estrutura da tabela
        let html = '<div class="notation-content"><table><thead><tr><th>#</th><th>Brancas</th><th>Pretas</th></tr></thead><tbody>';
        let moveIndex = 0;

        for (let i = 0; i < this.historicoDeJogadas.length; i += 2) {
            moveIndex++;
            const notacaoBrancas = this.historicoDeJogadas[i];
            const notacaoPretas = this.historicoDeJogadas[i + 1] || ''; 
            
            html += `<tr>`;
            
            html += `<td class="move-number">${moveIndex}.</td>`;
            html += `<td class="brancas-move">${notacaoBrancas}</td>`;
            
            if (notacaoPretas) {
                html += `<td class="pretas-move">${notacaoPretas}</td>`;
            } else {
                html += `<td class="pretas-move">...</td>`; 
            }
            
            html += `</tr>`;
        }
        
        html += '</tbody></table></div>';
        
        // ATUALIZA: Injeta o cabeçalho e a tabela no elemento .notation
        $('.stats .notation').html('<h3>Histórico de Jogadas</h3>' + html);
    }

    registrarEventos() {
        const self = this;

        // clicar em peça
        $('body').on('click', '.piece', function () {
            let classe = $(this).attr('class');
            let casaId = $(this).parent().attr('id');

            if (classe.includes(self.vezDo)) {
                self.clicou = 1;
                self.ultimaCasa = casaId;
                self.pecaEscolhida = $(this);
                $('.square-board').removeClass('possible');

                let jaMoveuRei = (self.vezDo === 'white') ? self.whiteKingMoved : self.blackKingMoved;
                let jaMoveuTorres = (self.vezDo === 'white') ? self.whiteRooksMoved : self.blackRooksMoved;

                let moves = self.movimento.movimentosPossiveis(classe, casaId, jaMoveuRei, jaMoveuTorres);
                moves.forEach(m => $('#' + m).addClass('possible'));
            } else if (self.clicou === 1 && $(this).parent().hasClass('possible')) {
                $(this).parent().trigger('click');
            } else {
                 alert("⚠️ Não é sua vez! Escolha uma peça " + self.vezDo);
            }
        });

        // clicar em quadrado
        $('body').on('click', '.square-board', function () {
            if (self.clicou === 1) {
                let idCasa = $(this).attr('id');
                
                if (idCasa !== self.ultimaCasa && $(this).hasClass('possible')) {
                    let pecaCapturada = $(this).find('.piece');
                    let moveRei = self.pecaEscolhida.hasClass('king');
                    
                    let notacaoFinal = '';
                    let isRoquePequeno = false;
                    let isRoqueGrande = false;
                    let promocaoPara = null;

                    // Captura
                    if (pecaCapturada.length > 0) {
                        $('.stats .capturadas-list').append(pecaCapturada); 
                    }

                    // Move Rei e trata Roque
                    if (moveRei) {
                        let origemCol = self.ultimaCasa[0];
                        let destinoCol = idCasa[0];
                        let linha = parseInt(idCasa[1]);
                        let torreOrigem, torreDestino;

                        if (origemCol === 'e' && destinoCol === 'g') { 
                            isRoquePequeno = true; torreOrigem = 'h' + linha; torreDestino = 'f' + linha; 
                        }
                        if (origemCol === 'e' && destinoCol === 'c') { 
                            isRoqueGrande = true; torreOrigem = 'a' + linha; torreDestino = 'd' + linha; 
                        }

                        if (torreOrigem && torreDestino) {
                            let $torre = $('#' + torreOrigem).find('.piece');
                            $('#' + torreDestino).html($torre);
                            $('#' + torreOrigem).empty();
                            if (self.vezDo === 'white') self.whiteRooksMoved[torreOrigem[0]] = true;
                            else self.blackRooksMoved[torreOrigem[0]] = true;
                        }
                        if (self.vezDo === 'white') self.whiteKingMoved = true;
                        else self.blackKingMoved = true;
                    }

                    // Move peça
                    $(this).html(self.pecaEscolhida);
                    $('#' + self.ultimaCasa).empty();
                    $('.square-board').removeClass('possible');

                    // ===== Promoção de Peão =====
                    if ((self.pecaEscolhida.hasClass('pawn-white') && parseInt(idCasa[1]) === 8) ||
                        (self.pecaEscolhida.hasClass('pawn-black') && parseInt(idCasa[1]) === 1)) {
                        
                        $('#promotionModal').data('square', idCasa); 
                        $('#promotionModal').data('color', self.pecaEscolhida.hasClass('white') ? 'white' : 'black');
                        $('.board').data('jogo', self); 
                        $('#promotionModal').show();
                        
                    } else {
                        // Movimento Normal/Roque: Gera notação, registra e troca a vez
                        notacaoFinal = self.gerarNotacaoAlgébrica(
                            self.ultimaCasa, idCasa, self.pecaEscolhida, pecaCapturada,
                            isRoquePequeno, isRoqueGrande, promocaoPara
                        );
                        self.registrarJogada(notacaoFinal);
                        
                        // Troca vez
                        self.vezDo = (self.vezDo === 'white') ? 'black' : 'white';
                        self.clicou = 0;
                    }
                    
                    // Marca torre como movida
                    if (self.pecaEscolhida.hasClass('rook') && !isRoquePequeno && !isRoqueGrande) {
                        if (self.vezDo === 'white') self.whiteRooksMoved[self.ultimaCasa[0]] = true;
                        else self.blackRooksMoved[self.ultimaCasa[0]] = true;
                    }
                }
            }
        });
    }
}

// INICIALIZAÇÃO E MODAL 
$(function () {
    // PREPARAÇÃO DO LAYOUT LATERAL
    
    // Injeta o cabeçalho e o contêiner de peças capturadas (no HTML, div.stats)
    $('.stats').append('<div class="capturadas"><h3>Peças Capturadas</h3><div class="capturadas-list"></div></div>');
    
    // 1. Inicializa o Jogo
    const jogo = new Jogo();
    jogo.iniciar();
    $('.board').data('jogo', jogo); 
});

// Handler do Modal de Promoção
$('body').on('click', '#promotionModal .promote', function() {
    let piece = $(this).data('piece'); 
    let squareId = $('#promotionModal').data('square');
    let color = $('#promotionModal').data('color');
    const jogo = $('.board').data('jogo'); 
    
    const ultimaCasa = jogo.ultimaCasa;
    const pecaCapturada = $(`#${squareId}`).find('.piece');
    const pecaAntiga = jogo.pecaEscolhida;

    // Gera notação de promoção
    const notacaoPromocao = jogo.gerarNotacaoAlgébrica(
        ultimaCasa,
        squareId,
        pecaAntiga,
        pecaCapturada,
        false, 
        false, 
        piece
    );
    
    // Atualiza a peça no tabuleiro
    $('#' + squareId).html(`<div class="piece ${piece}-${color}"></div>`);

    // Registra a jogada (inclui a promoção)
    jogo.registrarJogada(notacaoPromocao);
    
    // Troca a vez
    jogo.vezDo = (jogo.vezDo === 'white') ? 'black' : 'white';
    jogo.clicou = 0;

    $('#promotionModal').hide();
});

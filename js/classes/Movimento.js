export class Movimento {
    constructor(tabuleiro) {
        this.tabuleiro = tabuleiro;
        this.colunas = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    }

    // --- FUNÇÃO ADICIONADA DE VOLTA ---
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
        const direcoes = [[1, 1], [-1, 1], [1, -1], [-1, -1]];
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
        const direcoes = [[1, 0], [-1, 0], [0, 1], [0, -1]];
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

    /**
     * NOVO MÉTODO AJUDANTE
     * Verifica se uma determinada casa está sob ataque pelas peças de uma cor.
     * @param {string} posicao - A casa a ser verificada (ex: 'e4').
     * @param {string} corAtacante - A cor das peças que podem estar atacando ('white' ou 'black').
     * @returns {boolean} - True se a casa estiver sob ataque.
     */
    isSquareAttacked(posicao, corAtacante) {
        const pecas = document.querySelectorAll('.piece');

        for (const peca of pecas) {
            const classes = peca.className;
            if (!classes.includes(corAtacante)) continue;

            const casaAtual = peca.parentElement.id;
            const tipo = classes.split(' ')[1]; // ex: 'rook-black'
            
            let coluna = casaAtual[0];
            let linha = parseInt(casaAtual[1]);
            let idxCol = this.colunas.indexOf(coluna);

            let movimentosDeAtaque;

            // Para peões, só consideramos os movimentos de captura diagonal
            if (tipo.includes('pawn')) {
                let direcao = tipo.includes('white') ? 1 : -1;
                movimentosDeAtaque = this.movimentosCaptura(coluna, linha, idxCol, direcao, '');
            } else {
                // Para outras peças, os movimentos de ataque são os mesmos que os de movimento
                // Chamamos os métodos específicos para evitar lógica de xeque recursiva
                if (tipo.includes('bishop')) movimentosDeAtaque = this.movimentosBispo(tipo, coluna, linha, idxCol);
                else if (tipo.includes('rook')) movimentosDeAtaque = this.movimentosTorre(tipo, coluna, linha, idxCol);
                else if (tipo.includes('knight')) movimentosDeAtaque = this.movimentosCavalo(tipo, coluna, linha, idxCol);
                else if (tipo.includes('queen')) movimentosDeAtaque = this.movimentosRainha(tipo, coluna, linha, idxCol);
                else if (tipo.includes('king')) { 
                    // Para o rei, calculamos um ataque simples de 1 casa para evitar loops infinitos
                    const tempReiMoves = [];
                    const direcoes = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]];
                    for(const [dc, dr] of direcoes) {
                        if (this.colunas[idxCol + dc] && (linha + dr) >= 1 && (linha + dr) <= 8) {
                            tempReiMoves.push(this.colunas[idxCol + dc] + (linha + dr));
                        }
                    }
                    movimentosDeAtaque = tempReiMoves;
                }
            }

            if (movimentosDeAtaque && movimentosDeAtaque.includes(posicao)) {
                return true; // A casa está sob ataque!
            }
        }

        return false; // A casa está segura.
    }

    /**
     * MÉTODO DO REI CORRIGIDO
     * Agora utiliza isSquareAttacked para validar cada movimento.
     */
    movimentosRei(pieceClass, coluna, linha, idxCol, jaMoveuRei, jaMoveuTorres) {
        const movimentos = [];
        const cor = pieceClass.includes('white') ? 'white' : 'black';
        const corInimiga = (cor === 'white') ? 'black' : 'white';
        const direcoes = [
            [1, 0], [-1, 0], [0, 1], [0, -1],
            [1, 1], [1, -1], [-1, 1], [-1, -1]
        ];
    
        for (const [colDelta, rowDelta] of direcoes) {
            const newIdxCol = idxCol + colDelta;
            const newLinha = linha + rowDelta;
            
            if (newIdxCol < 0 || newIdxCol > 7 || newLinha < 1 || newLinha > 8) continue;
            
            const novaPosicao = this.colunas[newIdxCol] + newLinha;
    
            const $casaDestino = $('#' + novaPosicao);
            const $pecaDestino = $casaDestino.find('.piece');
    
            // Impede capturar peça da mesma cor
            if ($pecaDestino.length > 0 && $pecaDestino.attr('class').includes(cor)) continue;

            // * A VERIFICAÇÃO CRÍTICA! *
            // Só adiciona o movimento se a casa de destino NÃO estiver atacada.
            if (!this.isSquareAttacked(novaPosicao, corInimiga)) {
                movimentos.push(novaPosicao);
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

    movimentosPossiveis(pieceClass, squareId, jaMoveuRei = false, jaMoveuTorres = { a: false, h: false }) {
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
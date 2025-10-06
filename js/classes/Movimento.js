export class Movimento {
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

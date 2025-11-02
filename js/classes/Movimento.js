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

            // *** CORREÇÃO PARA PEÕES - Só diagonais para ataque ***
            if (tipo.includes('pawn')) {
                movimentosDeAtaque = [];
                let direcao = tipo.includes('white') ? 1 : -1;

                // Diagonal esquerda
                if (idxCol > 0) {
                    const destinoEsq = this.colunas[idxCol - 1] + (linha + direcao);
                    movimentosDeAtaque.push(destinoEsq);
                }
                // Diagonal direita
                if (idxCol < 7) {
                    const destinoDir = this.colunas[idxCol + 1] + (linha + direcao);
                    movimentosDeAtaque.push(destinoDir);
                }
            }
            // Restante do método permanece igual...
            else if (tipo.includes('bishop')) {
                movimentosDeAtaque = this.movimentosBispo(tipo, coluna, linha, idxCol);
            }
            else if (tipo.includes('rook')) {
                movimentosDeAtaque = this.movimentosTorre(tipo, coluna, linha, idxCol);
            }
            else if (tipo.includes('knight')) {
                movimentosDeAtaque = this.movimentosCavalo(tipo, coluna, linha, idxCol);
            }
            else if (tipo.includes('queen')) {
                movimentosDeAtaque = this.movimentosRainha(tipo, coluna, linha, idxCol);
            }
            else if (tipo.includes('king')) {
                // Para o rei, movimentos de ataque são os mesmos que movimentos normais
                const tempReiMoves = [];
                const direcoes = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]];
                for (const [dc, dr] of direcoes) {
                    if (this.colunas[idxCol + dc] && (linha + dr) >= 1 && (linha + dr) <= 8) {
                        tempReiMoves.push(this.colunas[idxCol + dc] + (linha + dr));
                    }
                }
                movimentosDeAtaque = tempReiMoves;
            }

            if (movimentosDeAtaque && movimentosDeAtaque.includes(posicao)) {
                return true;
            }
        }

        return false;
    }
    movimentosRei(pieceClass, coluna, linha, idxCol, jaMoveuRei, jaMoveuTorres) {
        const movimentos = [];
        const cor = pieceClass.includes('white') ? 'white' : 'black';
        const direcoes = [
            [1, 0], [-1, 0], [0, 1], [0, -1],
            [1, 1], [1, -1], [-1, 1], [-1, -1]
        ];

        // Movimentos normais do rei
        for (const [colDelta, rowDelta] of direcoes) {
            const newIdxCol = idxCol + colDelta;
            const newLinha = linha + rowDelta;
            if (newIdxCol < 0 || newIdxCol > 7 || newLinha < 1 || newLinha > 8) continue;

            const novaPosicao = this.colunas[newIdxCol] + newLinha;
            const $pecaDestino = $('#' + novaPosicao).find('.piece');

            // Só adiciona se estiver vazio ou tiver peça inimiga
            if ($pecaDestino.length === 0 || !$pecaDestino.attr('class').includes(cor)) {
                movimentos.push(novaPosicao);
            }
        }

        // *** LÓGICA DE VERIFICAÇÃO DE ROQUE ***
        // Esta lógica usa o 'isSquareAttacked' e está correta dentro da sua arquitetura
        if (!jaMoveuRei && (linha === (cor === 'white' ? 1 : 8))) {
            const corOponente = cor === 'white' ? 'black' : 'white';
            const casaRei = coluna + linha; // ex: 'e1' ou 'e8'

            // VERIFICA ROQUE PEQUENO (lado do rei, O-O)
            const torrePequeno = cor === 'white' ? 'h1' : 'h8';
            if (!jaMoveuTorres[torrePequeno]) {
                const casaF = (cor === 'white') ? 'f1' : 'f8';
                const casaG = (cor === 'white') ? 'g1' : 'g8';

                // Verifica se as casas estão vazias
                if ($('#' + casaF).find('.piece').length === 0 &&
                    $('#' + casaG).find('.piece').length === 0) {

                    // Verifica se o rei não está em xeque E não passa por casas atacadas
                    if (!this.isSquareAttacked(casaRei, corOponente) &&
                        !this.isSquareAttacked(casaF, corOponente) &&
                        !this.isSquareAttacked(casaG, corOponente)) {
                        movimentos.push(casaG); // Destino do rei
                    }
                }
            }

            // VERIFICA ROQUE GRANDE (lado da dama, O-O-O)
            const torreGrande = cor === 'white' ? 'a1' : 'a8';
            if (!jaMoveuTorres[torreGrande]) {
                const casaB = (cor === 'white') ? 'b1' : 'b8';
                const casaC = (cor === 'white') ? 'c1' : 'c8';
                const casaD = (cor === 'white') ? 'd1' : 'd8';

                // Verifica se as casas estão vazias
                if ($('#' + casaB).find('.piece').length === 0 &&
                    $('#' + casaC).find('.piece').length === 0 &&
                    $('#' + casaD).find('.piece').length === 0) {

                    // Verifica se o rei não está em xeque E não passa por casas atacadas
                    // Nota: b1/b8 não precisa ser verificado para ataque
                    if (!this.isSquareAttacked(casaRei, corOponente) &&
                        !this.isSquareAttacked(casaC, corOponente) && // Destino do rei
                        !this.isSquareAttacked(casaD, corOponente)) { // Passagem do rei
                        movimentos.push(casaC); // Destino do rei
                    }
                }
            }
        }

        return movimentos;
    }
    executarRoque(tipoRoque, cor) {
        const linha = cor === 'white' ? '1' : '8';

        if (tipoRoque === 'pequeno') {
            // Roque pequeno: Rei e1→g1, Torre h1→f1 (branco) / Rei e8→g8, Torre h8→f8 (preto)
            this._moverPecaRoque('e' + linha, 'g' + linha);
            this._moverPecaRoque('h' + linha, 'f' + linha);
            console.log(`♜ ROQUE PEQUENO executado para ${cor}`);
        }
        else if (tipoRoque === 'grande') {
            // Roque grande: Rei e1→c1, Torre a1→d1 (branco) / Rei e8→c8, Torre a8→d8 (preto)
            this._moverPecaRoque('e' + linha, 'c' + linha);
            this._moverPecaRoque('a' + linha, 'd' + linha);
            console.log(`♜ ROQUE GRANDE executado para ${cor}`);
        }
    }

    /**
     * Método auxiliar para mover peças durante o roque
     */
    _moverPecaRoque(origem, destino) {
        const $peca = $('#' + origem).find('.piece');
        if ($peca.length > 0) {
            // Move a peça para o destino
            $('#' + destino).html($peca.clone());
            // Limpa a origem
            $('#' + origem).empty();
        }
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
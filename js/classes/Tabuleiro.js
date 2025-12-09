export class Tabuleiro {
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
    /**
    * Verifica se uma posição (ex: 'e4') é válida no tabuleiro.
    * @param {string} posicao 
    * @returns {boolean}
    */
    posicaoValida(posicao) {
        if (typeof posicao !== 'string' || posicao.length !== 2) return false;

        const coluna = posicao[0];
        const linha = parseInt(posicao[1], 10);

        const colunasValidas = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

        return colunasValidas.includes(coluna) && linha >= 1 && linha <= 8;
    }


    printBoard() {
        $('.board').empty();

        let light = 1;
        const columns = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

        for (let l = 8; l >= 1; l--) {
            for (let c of columns) {
                const sq = c + l;
                const cor = light ? 'light' : 'dark';

                $('.board').append(`
                <div class="square-board ${cor}" id="${sq}"></div>
            `);

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
    getTabuleiroAtual() {
        const tabuleiroAtual = {};
        $('.piece').each((_, peca) => {
            const casa = $(peca).parent().attr('id');
            tabuleiroAtual[casa] = {
                tipo: $(peca).attr('class').split(' ')[1].split('-')[0],  // rook, king, etc
                cor: $(peca).attr('class').split(' ')[1].split('-')[1],   // white ou black
                posicaoValida: true
            };
        });
        return tabuleiroAtual;
    }
}
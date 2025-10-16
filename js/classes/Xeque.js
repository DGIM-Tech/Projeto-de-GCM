// // Xeque.js
// export class Xeque {
//     // Verifica se o REI da cor alvo está sendo atacado por alguma peça inimiga
//     static estaEmXeque(tabuleiro, corDoRei, movimento) {
//         const posicaoRei = Xeque._encontrarRei(tabuleiro, corDoRei);
//         if (!posicaoRei) return false;

//         const corOponente = corDoRei === 'white' ? 'black' : 'white';

//         // Percorrer todas as peças do adversário e ver se alguma pode capturar o rei
//         for (let linha = 1; linha <= 8; linha++) {
//             for (let col of ['a','b','c','d','e','f','g','h']) {
//                 const cellId = col + linha;
//                 const peca = $('#' + cellId).find('.piece');
//                 if (peca.length > 0 && peca.attr('class').includes(corOponente)) {
//                     const moves = movimento.movimentosPossiveis(peca.attr('class'), cellId, false, {});
//                     if (moves.includes(posicaoRei)) {
//                         return true;
//                     }
//                 }
//             }
//         }

//         return false;
//     }

//     static _encontrarRei(tabuleiro, cor) {
//         for (let linha = 1; linha <= 8; linha++) {
//             for (let col of ['a','b','c','d','e','f','g','h']) {
//                 const cellId = col + linha;
//                 const peca = $('#' + cellId).find('.piece');
//                 if (peca.length > 0 && peca.hasClass(cor) && peca.hasClass('king')) {
//                     return cellId;
//                 }
//             }
//         }
//         return null;
//     }
// }

export class Xeque {
    /**
     * Verifica se o rei da cor informada está em xeque.
     * Esta versão é mais eficiente e reutiliza a lógica de ataque.
     * @param {string} cor - A cor do rei a ser verificado ('white' ou 'black').
     * @param {Movimento} movimento - A instância principal de Movimento do jogo.
     * @returns {boolean}
     */
    static estaEmXeque(cor, movimento) {
        const corInimiga = (cor === 'white') ? 'black' : 'white';

        // Encontra a posição do rei
        const rei = document.querySelector(`.piece.king-${cor}`);
        if (!rei) {
            console.error('Rei da cor ${cor} não encontrado!');
            return false;
        }
        const posicaoRei = rei.parentElement.id;

        // Usa o método ajudante para verificar se a casa do rei está sob ataque
        return movimento.isSquareAttacked(posicaoRei, corInimiga);
    }
}
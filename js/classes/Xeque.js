import { Movimento } from './Movimento.js';

/**
 * Classe responsável por verificar se o rei de uma cor está em xeque.
 */
export class Xeque {
    /**
     * Verifica se o rei da cor informada está em xeque.
     * @param {string} cor - 'white' ou 'black'
     * @returns {boolean}
     */
    static estaEmXeque(cor) {
        const movimento = new Movimento();
        const corInimiga = (cor === 'white') ? 'black' : 'white';

        // Encontra o rei
        const rei = document.querySelector(`.piece.king-${cor}`);
        if (!rei) return false;
        const posicaoRei = rei.parentElement.id;

        // Percorre todas as peças inimigas
        const pecas = document.querySelectorAll('.piece');
        for (const peca of pecas) {
            const classes = peca.className;
            if (!classes.includes(corInimiga)) continue;

            const casaAtual = peca.parentElement.id;
            const tipo = classes.split(' ')[1]; // ex: rook-black

            const moves = movimento.movimentosPossiveis(tipo, casaAtual);
            if (moves.includes(posicaoRei)) {
                return true; // Xeque detectado!
            }
        }

        return false;
    }
}

import { Xeque } from './Xeque.js';
import { Movimento } from './Movimento.js';

/**
 * Classe responsável por detectar Xeque-Mate no tabuleiro.
 */
export class XequeMate {

    /**
     * Verifica se o jogador da cor informada está em xeque-mate.
     * @param {string} cor - 'white' ou 'black'
     * @returns {boolean}
     */
    static estaEmXequeMate(cor) {
        //Se o rei não está em xeque → não é xeque-mate
        if (!Xeque.estaEmXeque(cor)) return false;

        const movimento = new Movimento();
        const pecas = document.querySelectorAll(`.piece.${cor}`);

        //Para cada peça do jogador
        for (const peca of pecas) {
            const casaId = peca.parentElement.id;
            const classe = peca.className;
            const tipo = classe.split(' ')[1]; // Ex: rook-white

            //Calcula movimentos possíveis dessa peça
            const moves = movimento.movimentosPossiveis(classe, casaId);

            //Simula cada movimento e vê se algum tira o rei do xeque
            for (const destino of moves) {
                const casaOrigem = document.getElementById(casaId);
                const casaDestino = document.getElementById(destino);

                // Salva o estado atual
                const pecaCapturada = casaDestino.innerHTML;
                casaDestino.innerHTML = casaOrigem.innerHTML;
                casaOrigem.innerHTML = '';

                // Verifica se após o movimento, o rei ainda está em xeque
                const continuaEmXeque = Xeque.estaEmXeque(cor);

                // Reverte o movimento
                casaOrigem.innerHTML = casaDestino.innerHTML;
                casaDestino.innerHTML = pecaCapturada;

                // Se o movimento tirou o rei do xeque → não é xeque-mate
                if (!continuaEmXeque) {
                    return false;
                }
            }
        }

        //Se nenhuma jogada remove o xeque → XEQUE-MATE!
        return true;
    }
}

import { Xeque } from './Xeque.js';

export class XequeMate {
    static estaEmXequeMate(cor, movimento) {
        if (!Xeque.estaEmXeque(cor, movimento)) {
            return false;
        }

        const colunas = ['a','b','c','d','e','f','g','h'];

        for (let linha = 1; linha <= 8; linha++) {
            for (let col of colunas) {
                const id = col + linha;
                const casa = document.getElementById(id);
                if (!casa) continue;

                const peca = casa.querySelector('.piece');
                if (!peca || !peca.classList.contains(cor)) continue;

                const moves = movimento.movimentosPossiveis(peca.className, id, false, {});
                for (const destino of moves) {
                    const casaDestino = document.getElementById(destino);
                    if (!casaDestino) continue;

                    const origemHTML = casa.innerHTML;
                    const destinoHTML = casaDestino.innerHTML;

                    casaDestino.innerHTML = origemHTML;
                    casa.innerHTML = '';

                    const aindaEmXeque = Xeque.estaEmXeque(cor, movimento);

                    casa.innerHTML = origemHTML;
                    casaDestino.innerHTML = destinoHTML;

                    if (!aindaEmXeque) return false;
                }
            }
        }

        // Efeito visual do xeque-mate
        const rei = document.querySelector(`.piece.king-${cor}`);
        if (rei) {
            const casaRei = rei.parentElement;
            casaRei.classList.remove('xeque-highlight');
            casaRei.classList.add('xeque-mate-highlight');
        }

        return true;
    }
}

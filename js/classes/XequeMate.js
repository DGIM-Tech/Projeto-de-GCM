// XequeMate.js
import { Xeque } from './Xeque.js';

export class XequeMate {
    static estaEmXequeMate(tabuleiro, corDoRei, movimento) {
        if (!Xeque.estaEmXeque(tabuleiro, corDoRei, movimento)) {
            return false;
        }

        // Tentar mover todas as peças do rei e ver se alguma salva o rei
        for (let linha = 1; linha <= 8; linha++) {
            for (let col of ['a','b','c','d','e','f','g','h']) {
                const cellId = col + linha;
                const peca = $('#' + cellId).find('.piece');
                if (peca.length > 0 && peca.attr('class').includes(corDoRei)) {
                    const moves = movimento.movimentosPossiveis(peca.attr('class'), cellId, false, {});
                    for (let destino of moves) {
                        // Simular movimento
                        const pecaCapturada = $('#' + destino).html();
                        const origHTML = $('#' + cellId).html();

                        $('#' + destino).html(origHTML);
                        $('#' + cellId).empty();

                        const aindaEmXeque = Xeque.estaEmXeque(tabuleiro, corDoRei, movimento);

                        // Desfazer movimento
                        $('#' + cellId).html(origHTML);
                        $('#' + destino).html(pecaCapturada);

                        if (!aindaEmXeque) {
                            return false; // Há como escapar → não é xeque-mate
                        }
                    }
                }
            }
        }

        return true;
    }
}

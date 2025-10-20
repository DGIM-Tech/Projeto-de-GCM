// XequeMate.js - VERSÃO FINAL E CORRIGIDA

import { Xeque } from './Xeque.js';

export class XequeMate {
    /**
     * Verifica se um jogador, que já está em xeque, não tem movimentos legais para escapar.
     */
    static estaEmXequeMate(cor, jogo) {
        const pecasDoJogador = document.querySelectorAll(`.piece.${cor}`);

        // Testa TODAS as peças para ver se ALGUMA tem um movimento que salva o rei
        for (const peca of pecasDoJogador) {
            const casaOrigemEl = peca.parentElement;
            if (!casaOrigemEl) continue;

            // Pega os movimentos teóricos da peça
            const movimentosPossiveis = jogo.movimento.movimentosPossiveis(
                peca.className,
                casaOrigemEl.id,
                (cor === 'white') ? jogo.whiteKingMoved : jogo.blackKingMoved,
                (cor === 'white') ? jogo.whiteRooksMoved : jogo.blackRooksMoved
            );

            // Simula cada um desses movimentos
            for (const destinoId of movimentosPossiveis) {
                const destinoEl = document.getElementById(destinoId);
                if (!destinoEl) continue;

                const pecaCapturada = destinoEl.querySelector('.piece');

                // --- Simulação ---
                if (pecaCapturada) destinoEl.removeChild(pecaCapturada);
                destinoEl.appendChild(peca);

                // VERIFICAÇÃO SEGURA: O rei ainda está sob ataque?
                // Usamos o método "puro" para não bagunçar a tela!
                const ehMovimentoSalvador = !Xeque._estaSendoAtacado(cor, jogo.movimento);

                // --- Restauração ---
                casaOrigemEl.appendChild(peca);
                if (pecaCapturada) destinoEl.appendChild(pecaCapturada);

                // Se encontramos UM movimento que salva, já sabemos que NÃO é mate.
                if (ehMovimentoSalvador) {
                    return false; // Encontrou uma fuga!
                }
            }
        }

        // Se o loop terminou e NENHUM movimento salvou o rei, é xeque-mate.
        return true;
    }
}
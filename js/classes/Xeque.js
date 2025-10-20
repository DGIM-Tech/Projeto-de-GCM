export class Xeque {
    /**
     * Verifica se o rei da cor informada está em xeque.
     * Destaca o rei com fundo vermelho se estiver em xeque.
     * @param {string} cor - A cor do rei ('white' ou 'black').
     * @param {Movimento} movimento - Instância principal de Movimento.
     * @returns {boolean}
     */
    static estaEmXeque(cor, movimento) {
        const corInimiga = (cor === 'white') ? 'black' : 'white';
        const rei = document.querySelector(`.piece.king-${cor}`);

        if (!rei) {
            console.error(`Rei da cor ${cor} não encontrado!`);
            return false;
        }

        const casaRei = rei.parentElement;
        const posicaoRei = casaRei.id;

        // Verifica se o rei está sob ataque
        const emXeque = movimento.isSquareAttacked(posicaoRei, corInimiga);

        // Remove qualquer destaque anterior
        document.querySelectorAll('.xeque-highlight').forEach(el => {
            el.classList.remove('xeque-highlight');
        });

        // Se estiver em xeque, adiciona destaque vermelho
        if (emXeque) {
            casaRei.classList.add('xeque-highlight');
        }

        return emXeque;
    }
}
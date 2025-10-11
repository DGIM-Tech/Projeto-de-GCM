export class Empate {
    /**
     * Verifica se o jogo entrou em empate
     * @param {string} vezDo - 'white' ou 'black', jogador da vez
     * @param {Movimento} movimento - instância da classe Movimento
     * @returns {boolean} - true se houver empate
     */
    static verificarEmpate(vezDo, movimento) {
        const possiveis = Empate.todosMovimentosPossiveis(vezDo, movimento);
        const emXeque = require('./Xeque.js').Xeque.estaEmXeque(vezDo);

        // Empate por afogamento
        if (possiveis.length === 0 && !emXeque) {
            alert("♟️ EMPATE! Afogamento (Stalemate).");
            return true;
        }

        // Empate por material insuficiente
        if (Empate.materialInsuficiente()) {
            alert("♟️ EMPATE! Material insuficiente para dar xeque-mate.");
            return true;
        }

        return false;
    }

    /**
     * Retorna todos os movimentos possíveis de um jogador
     * @param {string} cor - 'white' ou 'black'
     * @param {Movimento} movimento
     * @returns {Array} - array de strings com casas possíveis
     */
    static todosMovimentosPossiveis(cor, movimento) {
        const todasPecas = document.querySelectorAll(`.piece.${cor}`);
        let moves = [];

        todasPecas.forEach(peca => {
            const classe = peca.className;
            const casaOrigem = peca.parentElement.id;

            // Para roque, passamos flags como false para não interferir
            const possiveis = movimento.movimentosPossiveis(classe, casaOrigem, false, {a:false,h:false});
            moves = moves.concat(possiveis);
        });

        return moves;
    }

    /**
     * Verifica se o material em jogo é insuficiente para xeque-mate
     * @returns {boolean}
     */
    static materialInsuficiente() {
        const pecasBrancas = Array.from(document.querySelectorAll('.piece.white')).map(p => p.className);
        const pecasPretas = Array.from(document.querySelectorAll('.piece.black')).map(p => p.className);

        // Remove os reis (sempre existem)
        const pecasBrancasSemRei = pecasBrancas.filter(p => !p.includes('king'));
        const pecasPretasSemRei = pecasPretas.filter(p => !p.includes('king'));

        // Rei vs Rei
        if (pecasBrancasSemRei.length === 0 && pecasPretasSemRei.length === 0) return true;

        // Rei + Cavalo ou Bispo vs Rei
        const pecasSimples = ['bishop','knight'];
        if (
            (pecasBrancasSemRei.length === 1 && pecasSimples.includes(pecasBrancasSemRei[0].split('-')[0]) && pecasPretasSemRei.length === 0) ||
            (pecasPretasSemRei.length === 1 && pecasSimples.includes(pecasPretasSemRei[0].split('-')[0]) && pecasBrancasSemRei.length === 0)
        ) return true;

        // Rei + Bispo vs Rei + Bispo (mesma cor de casa) → simplificação: considera empate
        if (pecasBrancasSemRei.length === 1 && pecasPretasSemRei.length === 1) {
            const bPeca = pecasBrancasSemRei[0].split('-')[0];
            const pPeca = pecasPretasSemRei[0].split('-')[0];
            if (bPeca === 'bishop' && pPeca === 'bishop') return true;
        }

        return false;
    }
}

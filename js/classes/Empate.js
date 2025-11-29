import { Xeque } from './Xeque.js';
export class Empate {
    /**
     * Verifica se o jogo entrou em empate
     * @param {string} vezDo - 'white' ou 'black', jogador da vez
     * @param {Movimento} movimento - instância da classe Movimento
     * @returns {boolean} - true se houver empate
     */
    static verificarEmpate(vezDo, movimento) {
        const possiveis = Empate.todosMovimentosPossiveis(vezDo, movimento);
        const emXeque = Xeque.estaEmXeque(vezDo);

        // CORREÇÃO (1): Prioridade Material Insuficiente (deve vir primeiro).
        // Isso resolve o erro de prioridade do TE-010.
        if (Empate.materialInsuficiente()) {
            alert("♟️ EMPATE! Material insuficiente para dar xeque-mate.");
            return true;
        }

        // Verificar Xeque-Mate (Se for 0 movimentos E em xeque, não é empate, é vitória)
        if (possiveis.length === 0 && emXeque) {
            return false;
        }

        // Empate por afogamento (Stalemate - 0 movimentos E NÃO em xeque)
        if (possiveis.length === 0 && !emXeque) {
            alert("♟️ EMPATE! Afogamento (Stalemate).");
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
        // Coleta e separa por cor, mantendo a classe completa para identificar a cor da casa do bispo
        const todasPecas = Array.from(document.querySelectorAll('.piece'));
        
        // Separa as classes das peças menores por cor (Ex: ['bishop-light', 'knight'])
        const pecasBrancasSemRei = todasPecas
            .filter(p => p.className.includes('white') && !p.className.includes('king'))
            .map(p => p.className.split(' ').filter(cls => !['piece', 'white'].includes(cls)).join(' '));
            
        const pecasPretasSemRei = todasPecas
            .filter(p => p.className.includes('black') && !p.className.includes('king'))
            .map(p => p.className.split(' ').filter(cls => !['piece', 'black'].includes(cls)).join(' '));

        const todasPecasMenores = pecasBrancasSemRei.concat(pecasPretasSemRei);
        
        // 1. Cenario A: Rei vs Rei
        if (todasPecasMenores.length === 0) return true;

        // 2. Verifica material suficiente (Pawn, Rook, Queen)
        const pecasSuficientes = todasPecasMenores.filter(p => p.includes('pawn') || p.includes('rook') || p.includes('queen'));
        if (pecasSuficientes.length > 0) return false;

        // 3. Verifica Cenários de Empate Com Peças Menores (só sobram B e N)

        switch (todasPecasMenores.length) {
            case 1: // R vs R + B ou R + N
                return true; 

            case 2:
                const tipos = todasPecasMenores.map(p => p.split('-')[0]).sort();

                // Caso 1: K + 2B de mesma cor vs K (Material SUFICIENTE, retorna FALSE)
                // Se um jogador tem 2 Bispos e o outro nenhum, é suficiente (TE-013).
                if (pecasBrancasSemRei.length === 2 || pecasPretasSemRei.length === 2) {
                    return false; // Material SUFICIENTE (ex: 2B vs K)
                }

                // Caso 2: K + B vs K + B (Assumido como empate de cores opostas)
                if (tipos[0] === 'bishop' && tipos[1] === 'bishop') return true;
                
                // Caso 3: K + B vs K + N ou K + N vs K + B
                if (tipos.includes('bishop') && tipos.includes('knight')) return true; 
                
                // Caso 4: K + N vs K + N ou outros casos com 2 peças
                return false; 
            
            case 3:
                // Se temos 3 peças (ex: K+2B+N vs K), é suficiente (exceto K+3N vs K, que é raro).
                // Para a simplicidade do jogo, 3+ peças é suficiente.
                return false;
        }
    }
}
// js/classes/Xeque.js - VERSÃO MELHORADA

export class Xeque {
    /**
     * Verifica se o rei da cor informada está em xeque.
     */
    static estaEmXeque(cor, movimento) {
        console.log(`[XEQUE] Verificando xeque para rei ${cor}...`);
        
        const corInimiga = (cor === 'white') ? 'black' : 'white';
        
        // Múltiplas formas de encontrar o rei
        let rei = null;
        
        // Tentativa 1: Seletor direto
        rei = $(`.king-${cor}`)[0];
        
        // Tentativa 2: Buscar por todas as peças e filtrar
        if (!rei) {
            console.log(`[XEQUE] Tentativa 1 falhou. Buscando rei alternativamente...`);
            const todasPecas = $('.piece');
            for (let i = 0; i < todasPecas.length; i++) {
                const peca = todasPecas[i];
                const classes = peca.className;
                if (classes.includes('king') && classes.includes(cor)) {
                    rei = peca;
                    break;
                }
            }
        }
        
        if (!rei) {
            console.error(`[XEQUE] Rei ${cor} não encontrado!`);
            return false;
        }

        const casaRei = $(rei).parent();
        const posicaoRei = casaRei.attr('id');
        
        if (!posicaoRei) {
            console.error(`[XEQUE] Rei ${cor} não está em uma casa válida!`);
            return false;
        }
        
        console.log(`[XEQUE] Rei ${cor} encontrado em ${posicaoRei}`);

        // Verificar se a posição do rei está sob ataque
        try {
            const emXeque = movimento.isSquareAttacked(posicaoRei, corInimiga);
            console.log(`[XEQUE] Resultado: ${emXeque ? 'EM XEQUE' : 'SAFE'}`);
            return emXeque;
        } catch (error) {
            console.error(`[XEQUE] Erro ao verificar ataque:`, error);
            return false;
        }
    }
}
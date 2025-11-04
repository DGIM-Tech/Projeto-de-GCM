// Local: js/classes/JogadorIA.js
import { Jogador } from './Jogador.js';

export class JogadorIA extends Jogador {
    constructor(cor, nivelDificuldade = 'médio') {
        super('Computador', cor);
        this.tipo = 'IA';
        this.nivelDificuldade = nivelDificuldade;
    }

    async fazerMovimento(jogo) {
        // 🔹 Define profundidade conforme dificuldade
        const profundidade = {
            'iniciante': 1,  // Joga rápido e com pouca precisão
            'fácil': 3,
            'médio': 6,
            'difícil': 10
        }[this.nivelDificuldade];

        const fen = jogo._gerarFEN();
        const url = `https://chess-api.com/v1`;

        console.log(`🧠 IA (${this.nivelDificuldade}) pensando com profundidade ${profundidade}...`);

        try {
            // Envia o FEN e profundidade via POST
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    fen: fen,
                    depth: profundidade
                })
            });

            const data = await response.json();
            console.log('🔍 Resposta da API:', data);

            if (data.move) {
                const moveUCI = data.move.trim(); // Ex: "e2e4"
                const casaOrigem = moveUCI.substring(0, 2);
                const casaDestino = moveUCI.substring(2, 4);
                const peca = $('#' + casaOrigem).find('.piece');

                console.log(`✅ IA (${this.nivelDificuldade}) move: ${casaOrigem} → ${casaDestino}`);

                return {
                    peca: peca,
                    casaOrigem: casaOrigem,
                    casaDestino: casaDestino
                };
            } else {
                console.error('❌ Nenhuma jogada retornada pela API:', data);
                Swal.fire('Erro', 'A IA não conseguiu calcular uma jogada.', 'error');
                return null;
            }

        } catch (error) {
            console.error('⚠️ Erro ao chamar Chess API:', error);
            Swal.fire('Erro de Conexão', 'Não foi possível contatar a IA. Verifique sua conexão com a internet.', 'error');
            return null;
        }
    }
}

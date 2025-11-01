// Local: js/classes/JogadorIA.js

import { Jogador } from './Jogador.js';

export class JogadorIA extends Jogador {
    constructor(cor, nivelDificuldade = 'médio') {
        super('Computador', cor);
        this.tipo = 'IA';
        this.nivelDificuldade = nivelDificuldade;
    }

    async fazerMovimento(jogo) {
        const profundidade = {
            'iniciante': 1,
            'fácil': 3,
            'médio': 6,
            'difícil': 13
        }[this.nivelDificuldade];
        
        const fen = jogo._gerarFEN();
        const url = `https://stockfish.online/api/s/v2.php?fen=${encodeURIComponent(fen)}&depth=${profundidade}`;

        console.log(`🧠 IA (${this.nivelDificuldade}) está pensando...`);
        
        try {
            const response = await fetch(url);
            const data = await response.json();

            // --- CORREÇÃO APLICADA AQUI ---
            if (data.success && data.bestmove) {
                // A resposta da API é uma string longa como "continuation e7e5 d7d5..."
                // Nós precisamos pegar apenas a segunda parte ("e7e5").
                
                const parts = data.bestmove.split(' '); // Divide a string em palavras: ["continuation", "e7e5", "d7d5"]

                // Verifica se a resposta tem o formato esperado (pelo menos duas palavras)
                if (parts.length >= 2) {
                    const moveUCI = parts[1]; // Pega a segunda palavra, que é a jogada
                    
                    const casaOrigem = moveUCI.substring(0, 2);
                    const casaDestino = moveUCI.substring(2, 4);
                    const peca = $('#' + casaOrigem).find('.piece');

                    console.log(`✅ IA (${this.nivelDificuldade}) move via API: ${casaOrigem} para ${casaDestino}`);

                    return {
                        peca: peca,
                        casaOrigem: casaOrigem,
                        casaDestino: casaDestino
                    };
                } else {
                    // Se o formato for inesperado, registra um erro.
                    console.error("API retornou um formato de 'bestmove' inesperado:", data.bestmove);
                    return null;
                }
            } else {
                console.error("API não retornou a melhor jogada:", data);
                return null;
            }
        } catch (error) {
            console.error("Erro ao chamar a API da IA:", error);
            Swal.fire('Erro de Conexão', 'Não foi possível contatar a IA. Verifique sua conexão com a internet.', 'error');
            return null;
        }
    }
}
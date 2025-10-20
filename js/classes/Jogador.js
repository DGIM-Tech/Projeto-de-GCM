// Local: js/classes/Jogador.js

export class Jogador {
    constructor(nome, cor) {
        this.nome = nome;
        this.cor = cor; // Deve ser 'white' ou 'black'
        this.tipo = 'Humano'; // Padrão para jogadores controlados por pessoas
    }

    /**
     * Este método é um placeholder. Para jogadores humanos, o movimento é 
     * determinado pelos eventos de clique na interface, não por este método.
     * Para a IA, este método será sobrescrito com a lógica de chamada da API.
     */
    fazerMovimento(jogo) {
        // A lógica para jogadores humanos está nos eventos de clique registrados em Jogo.js
        return Promise.resolve(null);
    }
}
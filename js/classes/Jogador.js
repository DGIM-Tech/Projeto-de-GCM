// Local: js/classes/Jogador.js

export class Jogador {
    constructor(nome, cor) {
        this.nome = nome;
        this.cor = cor; // Deve ser 'white' ou 'black'
        this.tipo = 'Humano'; // Padrão para jogadores controlados por pessoas
    }

    
    fazerMovimento(jogo) {
        // A lógica para jogadores humanos está nos eventos de clique registrados em Jogo.js
        return Promise.resolve(null);
    }
}
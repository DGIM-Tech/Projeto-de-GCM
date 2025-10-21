export class ModoDeJogo {
    constructor(tipo) {
        this.tipo = tipo; // Ex: "1v1", "vsIA"
    }

    iniciarPartida() {
        console.log(`Iniciando partida no modo: ${this.tipo}`);
    }

    alternarTurno(jogo) {
        jogo.vezDo = (jogo.vezDo === 'white') ? 'black' : 'white';
    }
}

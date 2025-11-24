/**
 * @jest-environment jsdom
 */
import { ModoDeJogo } from "../js/classes/ModoDeJogo.js";

describe("ModoDeJogo", () => {
    let modo;

    beforeEach(() => {
        modo = new ModoDeJogo("vsIA");
    });

    test("Deve inicializar com o tipo correto", () => {
        expect(modo.tipo).toBe("vsIA");
    });

    test("iniciarPartida deve logar mensagem correta", () => {
        console.log = jest.fn();
        modo.iniciarPartida();
        expect(console.log).toHaveBeenCalledWith("Iniciando partida no modo: vsIA");
    });

    test("alternarTurno deve alternar vezDo entre white e black", () => {
        const jogoMock = { vezDo: "white" };
        modo.alternarTurno(jogoMock);
        expect(jogoMock.vezDo).toBe("black");

        modo.alternarTurno(jogoMock);
        expect(jogoMock.vezDo).toBe("white");
    });

    test("alternarTurno funciona mesmo se vezDo começar como black", () => {
        const jogoMock = { vezDo: "black" };
        modo.alternarTurno(jogoMock);
        expect(jogoMock.vezDo).toBe("white");
    });
});

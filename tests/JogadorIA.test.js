/**
 * @jest-environment jsdom
 */

import { JogadorIA } from "../js/classes/JogadorIA.js";
import $ from "jquery";
global.$ = $;

describe("Classe JogadorIA", () => {
    let ia;

    beforeEach(() => {
        ia = new JogadorIA("white", "médio");
        document.body.innerHTML = `
            <div id="e2"><div class="piece pawn-white"></div></div>
            <div id="e4"></div>
        `;
    });

    test("Deve inicializar com propriedades corretas", () => {
        expect(ia.tipo).toBe("IA");
        expect(ia.cor).toBe("white");
        expect(ia.nivelDificuldade).toBe("médio");
    });

    describe("fazerMovimento", () => {
        beforeEach(() => {
            // Mock global do fetch
            global.fetch = jest.fn();
        });

        afterEach(() => {
            jest.resetAllMocks();
        });

        test("Deve retornar o movimento corretamente quando a API responde", async () => {
            const mockResponse = {
                move: "e2e4"
            };
            fetch.mockResolvedValue({
                json: jest.fn().mockResolvedValue(mockResponse)
            });

            // Mock do método _gerarFEN do jogo
            const jogoMock = {
                _gerarFEN: jest.fn().mockReturnValue("mock-fen")
            };

            const movimento = await ia.fazerMovimento(jogoMock);

            expect(movimento.casaOrigem).toBe("e2");
            expect(movimento.casaDestino).toBe("e4");
            expect($(movimento.casaOrigem + " .piece").length).toBe(1);
        });

        test("Deve lidar com erro de fetch", async () => {
            fetch.mockRejectedValue(new Error("Falha na rede"));
            const jogoMock = { _gerarFEN: jest.fn() };

            const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});

            const movimento = await ia.fazerMovimento(jogoMock);
            expect(movimento).toBeNull();
            expect(consoleSpy).toHaveBeenCalled();

            consoleSpy.mockRestore();
        });

        test("Deve lidar com resposta vazia da API", async () => {
            fetch.mockResolvedValue({
                json: jest.fn().mockResolvedValue({})
            });
            const jogoMock = { _gerarFEN: jest.fn() };

            const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});

            const movimento = await ia.fazerMovimento(jogoMock);
            expect(movimento).toBeNull();
            expect(consoleSpy).toHaveBeenCalled();

            consoleSpy.mockRestore();
        });
    });
});

/**
 * @jest-environment jsdom
 */

import $ from "jquery"; // Adicione jQuery
global.$ = $;

import { Tutorial } from "../js/classes/Tutorial.js";

// Mock do Swal
import Swal from "sweetalert2";
jest.mock("sweetalert2", () => ({
    fire: jest.fn(() => Promise.resolve({ isConfirmed: true }))
}));

describe("Tutorial", () => {
    let jogoMock;
    let tutorial;

    beforeEach(() => {
        document.body.innerHTML = `
            <div id="e2" class="square-board"></div>
            <div id="e4" class="square-board"></div>
            <div id="d1" class="square-board"></div>
            <div id="h5" class="square-board"></div>
        `;

        jogoMock = {
            tabuleiro: { inicar: jest.fn() },
            clicou: 0,
            pecaEscolhida: null,
            ultimaCasa: null,
            finalizarTurno: jest.fn(),
            _tratarPromocao: jest.fn().mockReturnValue(false),
            _tentarMoverPeca: jest.fn(),
            _executarMovimento: jest.fn(),
            whiteKingMoved: false,
            blackKingMoved: false,
            whiteRooksMoved: { a1: false, h1: false },
            blackRooksMoved: { a8: false, h8: false },
        };

        tutorial = new Tutorial(jogoMock);
    });

    test("Deve iniciar tutorial com roteiro correto", () => {
        tutorial.iniciar("curso_completo");
        expect(tutorial.roteiroAtual).toBe(tutorial.roteiros["curso_completo"]);
        expect(tutorial.indicePasso).toBe(0);
    });

    test("Executar passo tipo 'setup' chama prepararTabuleiro", () => {
        const passoSetup = { tipo: "setup", posicao: { e2: "pawn-white" } };
        tutorial.roteiroAtual = [passoSetup];
        const spy = jest.spyOn(tutorial, "prepararTabuleiro");
        tutorial.executarPassoAtual();
        expect(spy).toHaveBeenCalledWith(passoSetup.posicao, undefined);
    });

    test("Executar passo tipo 'usuario' aplica classes e mostra toast", async () => {
        const passoUsuario = { tipo: "usuario", origem: "e2", destino: "e4", dica: "Movimento teste" };
        tutorial.roteiroAtual = [passoUsuario];

        const toastSpy = jest.spyOn(tutorial, "_mostrarToast");
        tutorial.executarPassoAtual();

        // Espera o timeout interno
        await new Promise(r => setTimeout(r, 100));

        expect($("#e2").hasClass("tutorial-source")).toBe(true);
        expect($("#e4").hasClass("tutorial-dest")).toBe(true);
        expect(toastSpy).toHaveBeenCalledWith("Movimento teste", "info");
    });

    test("Executar passo tipo 'auto' realiza movimento automático", async () => {
        const passoAuto = { tipo: "auto", origem: "e2", destino: "e4", mensagem: "Movimento automático" };
        tutorial.roteiroAtual = [passoAuto];

        const realSpy = jest.spyOn(tutorial, "_realizarMovimento");
        const toastSpy = jest.spyOn(tutorial, "_mostrarToast");

        tutorial.executarPassoAtual();

        // Aguarda timeout de 1500ms interno
        await new Promise(r => setTimeout(r, 1600));

        expect(realSpy).toHaveBeenCalledWith("e2", "e4");
        expect(toastSpy).toHaveBeenCalledWith("Movimento automático", "info");
    });

    test("Finalizar tutorial chama Swal.fire", async () => {
        await tutorial.finalizar();
        expect(Swal.fire).toHaveBeenCalled();
    });

    test("_realizarMovimento atualiza estado do jogo e chama _tentarMoverPeca", () => {
        document.querySelector("#e2").innerHTML = '<div class="piece pawn-white"></div>';
        tutorial._realizarMovimento("e2", "e4");

        expect(jogoMock.clicou).toBe(1);
        expect(jogoMock.pecaEscolhida.length).toBeGreaterThan(0);
        expect(jogoMock._tentarMoverPeca).toHaveBeenCalled();
    });
    test("Executar passo tipo 'auto' realiza movimento automático", () => {
        const passoAuto = { tipo: "auto", origem: "e2", destino: "e4", mensagem: "Movimento automático" };
        tutorial.roteiroAtual = [passoAuto];

        const realSpy = jest.spyOn(tutorial, "_realizarMovimento");
        const toastSpy = jest.spyOn(tutorial, "_mostrarToast");

        tutorial.executarPassoAtual();

        jest.advanceTimersByTime(1600); // Força o timeout do movimento automático
        expect(realSpy).toHaveBeenCalledWith("e2", "e4");
        expect(toastSpy).toHaveBeenCalledWith("Movimento automático", "info");
    });
    test("Finalizar tutorial chama Swal.fire", async () => {
        await tutorial.finalizar();
        expect(Swal.fire).toHaveBeenCalled();
    });
});

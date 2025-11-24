/**
 * @jest-environment jsdom
 */

import { Xeque } from "../js/classes/Xeque.js";

// Mock movimento
const movimentoMock = {
    isSquareAttacked: jest.fn(),
};

// Mock jQuery
import $ from "jquery";
global.$ = $;

describe("Testes da classe Xeque", () => {

    beforeEach(() => {
        document.body.innerHTML = "";
        movimentoMock.isSquareAttacked.mockReset();
        // Opcional: silenciar logs durante os testes
        jest.spyOn(console, "log").mockImplementation(() => { });
        jest.spyOn(console, "error").mockImplementation(() => { });
    });

    test("Rei branco NÃO está em xeque quando isSquareAttacked retorna false", () => {
        document.body.innerHTML = `<div id="e1"><div class="piece king-white"></div></div>`;
        movimentoMock.isSquareAttacked.mockReturnValue(false);

        const resultado = Xeque.estaEmXeque("white", movimentoMock);
        expect(resultado).toBe(false);
        expect(movimentoMock.isSquareAttacked).toHaveBeenCalledWith("e1", "black");
    });

    test("Rei branco ESTÁ em xeque quando isSquareAttacked retorna true", () => {
        document.body.innerHTML = `<div id="e1"><div class="piece king-white"></div></div>`;
        movimentoMock.isSquareAttacked.mockReturnValue(true);

        const resultado = Xeque.estaEmXeque("white", movimentoMock);
        expect(resultado).toBe(true);
        expect(movimentoMock.isSquareAttacked).toHaveBeenCalledWith("e1", "black");
    });

    test("Rei não encontrado → deve retornar false", () => {
        document.body.innerHTML = `<div id="tabuleiro_vazio"></div>`;
        const resultado = Xeque.estaEmXeque("white", movimentoMock);
        expect(resultado).toBe(false);
    });

    test("Rei branco encontrado pela TENTATIVA 2 (busca alternativa via .piece)", () => {
        document.body.innerHTML = `<div id="d4"><div class="piece someclass king white"></div></div>`;
        movimentoMock.isSquareAttacked.mockReturnValue(false);

        const resultado = Xeque.estaEmXeque("white", movimentoMock);
        expect(resultado).toBe(false);
        expect(movimentoMock.isSquareAttacked).toHaveBeenCalled();
    });

    test("Rei encontrado, mas pai NÃO TEM id → deve retornar false", () => {
        document.body.innerHTML = `<div><div class="piece king-white"></div></div>`;
        const resultado = Xeque.estaEmXeque("white", movimentoMock);
        expect(resultado).toBe(false);
    });

    test("Erro no isSquareAttacked → deve ser capturado e retornar false", () => {
        document.body.innerHTML = `<div id="e1"><div class="piece king-white"></div></div>`;
        movimentoMock.isSquareAttacked.mockImplementation(() => {
            throw new Error("Erro interno no cálculo de ataque");
        });

        const resultado = Xeque.estaEmXeque("white", movimentoMock);
        expect(resultado).toBe(false);
        expect(movimentoMock.isSquareAttacked).toHaveBeenCalled();
    });

    // ---------------- Novos testes para aumentar cobertura ----------------

    test("Rei preto NÃO está em xeque quando isSquareAttacked retorna false", () => {
        document.body.innerHTML = `<div id="e8"><div class="piece king-black"></div></div>`;
        movimentoMock.isSquareAttacked.mockReturnValue(false);

        const resultado = Xeque.estaEmXeque("black", movimentoMock);
        expect(resultado).toBe(false);
        expect(movimentoMock.isSquareAttacked).toHaveBeenCalledWith("e8", "white");
    });

    test("Rei preto ESTÁ em xeque quando isSquareAttacked retorna true", () => {
        document.body.innerHTML = `<div id="e8"><div class="piece king-black"></div></div>`;
        movimentoMock.isSquareAttacked.mockReturnValue(true);

        const resultado = Xeque.estaEmXeque("black", movimentoMock);
        expect(resultado).toBe(true);
        expect(movimentoMock.isSquareAttacked).toHaveBeenCalledWith("e8", "white");
    });

    test("Detecta rei mesmo com classe alternativa (king white)", () => {
        document.body.innerHTML = `<div id="b2"><div class="piece king white"></div></div>`;
        movimentoMock.isSquareAttacked.mockReturnValue(false);

        const resultado = Xeque.estaEmXeque("white", movimentoMock);
        expect(resultado).toBe(false);
    });

    test("Tabuleiro com várias peças — encontra apenas o rei correto", () => {
        document.body.innerHTML = `
            <div id="a1"><div class="piece queen-white"></div></div>
            <div id="b2"><div class="piece bishop-white"></div></div>
            <div id="c3"><div class="piece knight-white"></div></div>
            <div id="d4"><div class="piece king-white"></div></div>
        `;
        movimentoMock.isSquareAttacked.mockReturnValue(false);

        const resultado = Xeque.estaEmXeque("white", movimentoMock);
        expect(resultado).toBe(false);
        expect(movimentoMock.isSquareAttacked).toHaveBeenCalledWith("d4", "black");
    });

    test("Rei encontrado mas com id vazio — deve retornar false", () => {
        document.body.innerHTML = `<div id=""><div class="piece king-white"></div></div>`;
        const resultado = Xeque.estaEmXeque("white", movimentoMock);
        expect(resultado).toBe(false);
    });

    test("Confere que a cor passada para isSquareAttacked é oposta ao rei", () => {
        document.body.innerHTML = `<div id="e1"><div class="piece king-white"></div></div>`;
        movimentoMock.isSquareAttacked.mockReturnValue(false);

        Xeque.estaEmXeque("white", movimentoMock);

        expect(movimentoMock.isSquareAttacked).toHaveBeenCalledWith("e1", expect.not.stringContaining("white"));
    });
    test("Rei preto NÃO está em xeque quando isSquareAttacked retorna false", () => {
        document.body.innerHTML = `<div id="e8"><div class="piece king-black"></div></div>`;
        movimentoMock.isSquareAttacked.mockReturnValue(false);

        const resultado = Xeque.estaEmXeque("black", movimentoMock);
        expect(resultado).toBe(false);
        expect(movimentoMock.isSquareAttacked).toHaveBeenCalledWith("e8", "white");
    });

    test("Rei preto ESTÁ em xeque quando isSquareAttacked retorna true", () => {
        document.body.innerHTML = `<div id="e8"><div class="piece king-black"></div></div>`;
        movimentoMock.isSquareAttacked.mockReturnValue(true);

        const resultado = Xeque.estaEmXeque("black", movimentoMock);
        expect(resultado).toBe(true);
        expect(movimentoMock.isSquareAttacked).toHaveBeenCalledWith("e8", "white");
    });

});

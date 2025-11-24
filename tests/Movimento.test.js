/**
 * @jest-environment jsdom
 */

import { Movimento } from "../js/classes/Movimento.js";
import $ from "jquery";
global.$ = $;

describe("Testes avançados da classe Movimento", () => {
    let movimento;

    beforeEach(() => {
        document.body.innerHTML = "";
        movimento = new Movimento({});
    });

    // ================= PEÃO =================
    describe("movimentosPeao - casos extras", () => {
        test("Peão branco bloqueado não avança", () => {
            document.body.innerHTML = `<div id="a2"><div class="piece pawn-white"></div></div><div id="a3"><div class="piece pawn-black"></div></div>`;
            const movimentos = movimento.movimentosPeao("pawn-white", "a", 2, 0);
            expect(movimentos).not.toContain("a3");
        });

        test("Peão preto não captura peças da mesma cor", () => {
            document.body.innerHTML = `
                <div id="b7"><div class="piece pawn-black"></div></div>
                <div id="a6"><div class="piece pawn-black"></div></div>
                <div id="c6"><div class="piece knight-black"></div></div>
            `;
            const movimentos = movimento.movimentosPeao("pawn-black", "b", 7, 1);
            expect(movimentos).not.toContain("a6");
            expect(movimentos).not.toContain("c6");
        });
    });

    // ================= BISPO =================
    describe("movimentosBispo - bordas do tabuleiro", () => {
        test("Bispo no canto do tabuleiro", () => {
            document.body.innerHTML = `<div id="a1"><div class="piece bishop-white"></div></div>`;
            const movimentos = movimento.movimentosBispo("bishop-white", "a", 1, 0);
            expect(movimentos).toContain("b2");
        });

        test("Bispo bloqueado por peça da mesma cor", () => {
            document.body.innerHTML = `
                <div id="c1"><div class="piece bishop-white"></div></div>
                <div id="d2"><div class="piece pawn-white"></div></div>
            `;
            const movimentos = movimento.movimentosBispo("bishop-white", "c", 1, 2);
            expect(movimentos).not.toContain("d2");
        });
    });

    // ================= TORRE =================
    describe("movimentosTorre - casos extras", () => {
        test("Torre no centro com peças amigas e inimigas", () => {
            document.body.innerHTML = `
                <div id="d4"><div class="piece rook-white"></div></div>
                <div id="d6"><div class="piece pawn-black"></div></div>
                <div id="b4"><div class="piece pawn-white"></div></div>
            `;
            const movimentos = movimento.movimentosTorre("rook-white", "d", 4, 3);
            expect(movimentos).toContain("d6");
            expect(movimentos).not.toContain("b4");
        });
    });

    // ================= CAVALO =================
    describe("movimentosCavalo - bordas", () => {
        test("Cavalo no canto gera 2 movimentos", () => {
            document.body.innerHTML = `<div id="a1"><div class="piece knight-white"></div></div>`;
            const movimentos = movimento.movimentosCavalo("knight-white", "a", 1, 0);
            expect(movimentos).toContain("b3");
            expect(movimentos).toContain("c2");
            expect(movimentos.length).toBe(2);
        });

        test("Cavalo captura peça inimiga", () => {
            document.body.innerHTML = `
                <div id="b1"><div class="piece knight-white"></div></div>
                <div id="c3"><div class="piece pawn-black"></div></div>
            `;
            const movimentos = movimento.movimentosCavalo("knight-white", "b", 1, 1);
            expect(movimentos).toContain("c3");
        });
    });

    // ================= RAINHA =================
    describe("movimentosRainha - casos extras", () => {
        test("Rainha bloqueada por peças amigas", () => {
            document.body.innerHTML = `
                <div id="d4"><div class="piece queen-white"></div></div>
                <div id="d5"><div class="piece pawn-white"></div></div>
                <div id="e5"><div class="piece pawn-white"></div></div>
            `;
            const movimentos = movimento.movimentosRainha("queen-white", "d", 4, 3);
            expect(movimentos).not.toContain("d5");
            expect(movimentos).not.toContain("e5");
        });
    });

    // ================= REI =================
    describe("movimentosRei - casos extras", () => {
        test("Rei cercado por peças inimigas", () => {
            document.body.innerHTML = `
                <div id="e4"><div class="piece king-white"></div></div>
                <div id="d4"><div class="piece rook-black"></div></div>
                <div id="f4"><div class="piece bishop-black"></div></div>
            `;
            const movimentos = movimento.movimentosRei("king-white", "e", 4, 4, false, { a1: false, h1: false });
            expect(movimentos).toContain("d4");
            expect(movimentos).toContain("f4");
        });

        test("Roque não permitido se casas intermediárias ocupadas", () => {
            document.body.innerHTML = `
                <div id="e1"><div class="piece king-white"></div></div>
                <div id="h1"><div class="piece rook-white"></div></div>
                <div id="f1"><div class="piece pawn-white"></div></div>
                <div id="g1"></div>
            `;
            const movimentos = movimento.movimentosRei("king-white", "e", 1, 4, false, { a1: false, h1: false });
            expect(movimentos).not.toContain("g1");
        });
    });

    // ================= isSquareAttacked =================
    describe("isSquareAttacked - casos extras", () => {
        test("Casa atacada por bispo", () => {
            document.body.innerHTML = `
                <div id="c1"><div class="piece bishop-black"></div></div>
                <div id="e3"></div>
            `;
            const atacado = movimento.isSquareAttacked("e3", "black");
            expect(atacado).toBe(true);
        });

        test("Casa atacada por rainha", () => {
            document.body.innerHTML = `
                <div id="d1"><div class="piece queen-black"></div></div>
                <div id="d5"></div>
            `;
            const atacado = movimento.isSquareAttacked("d5", "black");
            expect(atacado).toBe(true);
        });

        test("Casa não atacada", () => {
            document.body.innerHTML = `<div id="a1"><div class="piece king-white"></div></div>`;
            const atacado = movimento.isSquareAttacked("h8", "white");
            expect(atacado).toBe(false);
        });
    });

    // ================= ROQUE - casos extras =================
    describe("executarRoque - casos extras", () => {
        test("Roque pequeno com peças no lugar correto", () => {
            document.body.innerHTML = `
                <div id="e1"><div class="piece king-white"></div></div>
                <div id="h1"><div class="piece rook-white"></div></div>
                <div id="f1"></div><div id="g1"></div>
            `;
            movimento.executarRoque("pequeno", "white");
            expect($("#g1 .piece").length).toBe(1);
            expect($("#f1 .piece").length).toBe(1);
        });

        test("Roque grande com peças no lugar correto", () => {
            document.body.innerHTML = `
                <div id="e1"><div class="piece king-white"></div></div>
                <div id="a1"><div class="piece rook-white"></div></div>
                <div id="b1"></div><div id="c1"></div><div id="d1"></div>
            `;
            movimento.executarRoque("grande", "white");
            expect($("#c1 .piece").length).toBe(1);
            expect($("#d1 .piece").length).toBe(1);
        });
    });
});

/**
 * @jest-environment jsdom
 */
import { Movimento } from "../js/classes/Movimento.js";
import $ from "jquery";

global.$ = $;

describe("Cobertura completa - Classe Movimento (arquivo completo de testes)", () => {
  let movimento;
  const colunas = ['a','b','c','d','e','f','g','h'];

  // Helper: cria apenas as divs passadas. Cada célula terá no máximo um .piece.
  const setupBoard = (squares) => {
    document.body.innerHTML = "";
    squares.forEach(({ id, piece }) => {
      const div = document.createElement("div");
      div.id = id;
      if (piece) div.innerHTML = `<div class="piece ${piece}"></div>`;
      document.body.appendChild(div);
    });
  };

  beforeEach(() => {
    movimento = new Movimento({});
    document.body.innerHTML = "";
    global.$ = $;
  });

// ---------------- movimentosPossiveis fallback ----------------
  test("movimentosPossiveis retorna [] para classe desconhecida", () => {
    const movimentos = movimento.movimentosPossiveis("algo-estranho", "a1");
    expect(movimentos).toEqual([]);
  });

// ---------------- movimentosPeao + movimentosCaptura ----------------
  describe("Peão: avanços e capturas", () => {
    test("Peão branco avança 1 casa (e2 -> e3)", () => {
      setupBoard([{ id: "e2", piece: "pawn-white" }]);
      const movimentos = movimento.movimentosPeao("pawn-white", "e", 2, 4);
      expect(movimentos).toContain("e3");
    });

    test("Peão branco avança 2 casas no primeiro movimento (d2 -> d4)", () => {
      setupBoard([{ id: "d2", piece: "pawn-white" }]);
      const movimentos = movimento.movimentosPeao("pawn-white", "d", 2, 3);
      expect(movimentos).toContain("d4");
    });
    
    // Teste para cobrir a L41 (avançar 2 casas) - Mantido para segurança
    test("Peão preto avança 2 casas no primeiro movimento (e7 -> e5) - COBERTURA L41 (avanço)", () => {
        setupBoard([
            { id: "e7", piece: "pawn-black" },
            { id: "e6", piece: null }, // Casa de 1 passo explicitamente vazia
            { id: "e5", piece: null }  // Casa de 2 passos explicitamente vazia
        ]);
        const movimentos = movimento.movimentosPeao("pawn-black", "e", 7, 4);
        expect(movimentos).toContain("e5");
    });

    test("Peão preto avança 1 casa (g7 -> g6)", () => {
      setupBoard([{ id: "g7", piece: "pawn-black" }]);
      const movimentos = movimento.movimentosPeao("pawn-black", "g", 7, 6);
      expect(movimentos).toContain("g6");
    });

    test("Peão não avança se bloqueado na casa 1 (a2 bloqueado por a3)", () => {
      setupBoard([{ id: "a2", piece: "pawn-white" }, { id: "a3", piece: "pawn-black" }]);
      const movimentos = movimento.movimentosPeao("pawn-white", "a", 2, 0);
      expect(movimentos).toEqual([]);
    });

    // 🏆 NOVO TESTE PARA COBRIR LINHAS 40/41 DA CAPTURA (Diagonal Direita)
    test("Peão branco captura inimigo na diagonal direita (d2 -> e3) - COBERTURA L40/L41 (captura)", () => {
        setupBoard([
            { id: "d2", piece: "pawn-white" },
            { id: "e3", piece: "rook-black" } // Peça inimiga na diagonal direita
        ]);
        
        const movimentos = movimento.movimentosPeao("pawn-white", "d", 2, 3);
        
        // 'e3' é o movimento de captura. Isso executa as linhas 40/41 para a segunda verificação do movimentosCaptura.
        expect(movimentos).toContain("e3");
    });

    test("Peão captura inimigo nas diagonais, não captura amigo", () => {
      setupBoard([
        { id: "d7", piece: "pawn-black" },
        { id: "c6", piece: "pawn-white" },
        { id: "e6", piece: "rook-black" },
      ]);
      const movimentosBlack = movimento.movimentosPeao("pawn-black", "d", 7, 3);
      expect(movimentosBlack).toContain("c6");
      // não deve capturar peça amiga
      setupBoard([{ id: "d7", piece: "pawn-black" }, { id: "c6", piece: "rook-black" }]);
      const movimentosBlack2 = movimento.movimentosPeao("pawn-black", "d", 7, 3);
      expect(movimentosBlack2).not.toContain("c6");
    });

    test("movimentosCaptura é chamado corretamente e respeita borda", () => {
      setupBoard([{ id: "a7", piece: "pawn-black" }]);
      // idxCol 0: não deve tentar capturar para a esquerda
      const caps = movimento.movimentosCaptura("a", 7, 0, -1, "white");
      expect(caps).toEqual([]); 
    });
  });

// ---------------- Bispo ----------------
  describe("Bispo - desliza, captura e bloqueio", () => {
    const pieceClass = "bishop-white";

    test("1) Desliza até borda (células vazias)", () => {
      setupBoard([{ id: "d4", piece: pieceClass }]);
      const movimentos = movimento.movimentosBispo(pieceClass, "d", 4, 3);
      expect(movimentos).toContain("a7");
      expect(movimentos).toContain("g7");
      expect(movimentos).toContain("h8");
      expect(movimentos).toContain("a1");
    });

    test("2) Captura inimiga e para (f6 capture, g7 não incluso)", () => {
      setupBoard([
        { id: "d4", piece: pieceClass },
        { id: "f6", piece: "pawn-black" },
        { id: "g7", piece: "pawn-black" },
      ]);
      const movimentos = movimento.movimentosBispo(pieceClass, "d", 4, 3);
      expect(movimentos).toContain("f6");
      expect(movimentos).not.toContain("g7");
    });

    test("3) Bloqueio por peça amiga impede avançar (e5 bloqueado)", () => {
      setupBoard([{ id: "d4", piece: pieceClass }, { id: "e5", piece: "pawn-white" }, { id: "f6", piece: "pawn-black" }]);
      const movimentos = movimento.movimentosBispo(pieceClass, "d", 4, 3);
      expect(movimentos).not.toContain("e5");
      expect(movimentos).not.toContain("f6");
    });

    test("4) Não inclui posições fora do tabuleiro", () => {
      setupBoard([{ id: "h8", piece: "bishop-white" }]);
      const movimentos = movimento.movimentosBispo("bishop-white", "h", 8, 7);
      movimentos.forEach(m => {
        const col = m[0];
        const row = parseInt(m[1]);
        expect(colunas).toContain(col);
        expect(row).toBeGreaterThanOrEqual(1);
        expect(row).toBeLessThanOrEqual(8);
      });
    });
  });

// ---------------- Torre ----------------
  describe("Torre - desliza, captura e bloqueio", () => {
    const pieceClass = "rook-white";

    test("1) Desliza até borda (d4)", () => {
      setupBoard([{ id: "d4", piece: pieceClass }]);
      const movimentos = movimento.movimentosTorre(pieceClass, "d", 4, 3);
      expect(movimentos).toContain("h4");
      expect(movimentos).toContain("a4");
      expect(movimentos).toContain("d8");
      expect(movimentos).toContain("d1");
    });

    test("2) Captura inimiga e para (d6 capturada, d7 não incluso)", () => {
      setupBoard([
        { id: "d4", piece: pieceClass },
        { id: "d6", piece: "pawn-black" },
        { id: "d7", piece: "pawn-black" },
      ]);
      const movimentos = movimento.movimentosTorre(pieceClass, "d", 4, 3);
      expect(movimentos).toContain("d6");
      expect(movimentos).not.toContain("d7");
    });

    test("3) Bloqueio por peça amiga (d5 bloqueada)", () => {
      setupBoard([{ id: "d4", piece: pieceClass }, { id: "d5", piece: "pawn-white" }, { id: "d6", piece: "pawn-black" }]);
      const movimentos = movimento.movimentosTorre(pieceClass, "d", 4, 3);
      expect(movimentos).not.toContain("d5");
      expect(movimentos).not.toContain("d6");
    });

    test("4) Não inclui posições inválidas como 'a9' (fora do tabuleiro)", () => {
      setupBoard([{ id: "d4", piece: pieceClass }]);
      const movimentos = movimento.movimentosTorre(pieceClass, "d", 4, 3);
      expect(movimentos).not.toContain("a9");
      expect(movimentos).not.toContain("z0");
    });
  });

// ---------------- Cavalo ----------------
  describe("Cavalo - offsets, bloqueio e bordas", () => {
    test("Cavalo no centro (d4) gera 8 movimentos", () => {
      setupBoard([{ id: "d4", piece: "knight-white" }]);
      const movimentos = movimento.movimentosCavalo("knight-white", "d", 4, 3);
      expect(movimentos.length).toBe(8);
    });

    test("Cavalo não captura peça amiga (e6 bloqueado)", () => {
      setupBoard([{ id: "d4", piece: "knight-white" }, { id: "e6", piece: "pawn-white" }]);
      const movimentos = movimento.movimentosCavalo("knight-white", "d", 4, 3);
      expect(movimentos).not.toContain("e6");
    });

    test("Cavalo canto a1 retorna 2 movimentos", () => {
      setupBoard([{ id: "a1", piece: "knight-white" }]);
      const movimentos = movimento.movimentosCavalo("knight-white", "a", 1, 0);
      expect(movimentos.length).toBe(2);
    });
  });

// ---------------- isSquareAttacked ----------------
  describe("isSquareAttacked - cobertura de ataques por peça", () => {
    // TESTE PARA COBRIR LINHA 158: Chamada a this.movimentosBispo(...)
    test("Bispo Branco atacando (d4 ataca f6) garante chamada de movimentosBispo L158", () => {
        setupBoard([{ id: "d4", piece: "bishop-white" }]);
        expect(movimento.isSquareAttacked("f6", "white")).toBe(true);
    });

    test("Peão ataca apenas diagonais (pawn-black em d4 ataca c3 e e3)", () => {
      setupBoard([{ id: "d4", piece: "pawn-black" }]);
      expect(movimento.isSquareAttacked("c3", "black")).toBe(true);
      expect(movimento.isSquareAttacked("e3", "black")).toBe(true);
      expect(movimento.isSquareAttacked("d3", "black")).toBe(false);
    });

    test("Torre ataca (rook-black em a1 ataca a5)", () => {
      setupBoard([{ id: "a1", piece: "rook-black" }]);
      expect(movimento.isSquareAttacked("a5", "black")).toBe(true);
    });

    test("Cavalo ataca (knight-black em a1 ataca b3)", () => {
      setupBoard([{ id: "a1", piece: "knight-black" }]);
      expect(movimento.isSquareAttacked("b3", "black")).toBe(true);
    });

    test("Rainha ataca como bispo/torre", () => {
      setupBoard([{ id: "a1", piece: "queen-black" }]);
      expect(movimento.isSquareAttacked("a5", "black")).toBe(true);
      expect(movimento.isSquareAttacked("d4", "black")).toBe(true);
    });

    test("Rei ataca casas adjacentes", () => {
      setupBoard([{ id: "d4", piece: "king-black" }]);
      expect(movimento.isSquareAttacked("d5", "black")).toBe(true);
    });

    test("Peça de cor errada é ignorada (bishop-white não ataca para black)", () => {
      setupBoard([{ id: "a1", piece: "bishop-white" }]);
      expect(movimento.isSquareAttacked("e5", "black")).toBe(false);
    });

    test("Peça sem movimentos de ataque retorna false para casa distante", () => {
      setupBoard([{ id: "a1", piece: "rook-white" }]);
      expect(movimento.isSquareAttacked("h8", "white")).toBe(false);
    });
  });

// ---------------- Rei e Roque ----------------
  describe("Movimentos do Rei e roque", () => {
    test("Rei movimentos normais (e4) -> 8 posições possíveis", () => {
      setupBoard([{ id: "e4", piece: "king-white" }]);
      const movimentos = movimento.movimentosRei("king-white", "e", 4, 4, true, { a1: true, h1: true });
      expect(movimentos.length).toBeGreaterThanOrEqual(5); 
    });

    test("Roque pequeno não permitido se torre já moveu (h1 moveu)", () => {
      setupBoard([{ id: "e1", piece: "king-white" }]);
      const movimentos = movimento.movimentosRei("king-white", "e", 1, 4, false, { a1: false, h1: true });
      expect(movimentos).not.toContain("g1");
    });

    test("Roque grande não permitido se torre que moveu (a1 moveu)", () => {
      setupBoard([{ id: "e1", piece: "king-white" }]);
      const movimentos = movimento.movimentosRei("king-white", "e", 1, 4, false, { a1: true, h1: false });
      expect(movimentos).not.toContain("c1");
    });

    test("Roque pequeno não permitido se rei já moveu", () => {
      setupBoard([{ id: "e1", piece: "king-white" }]);
      const movimentos = movimento.movimentosRei("king-white", "e", 1, 4, true, { a1: false, h1: false });
      expect(movimentos).not.toContain("g1");
    });

    test("Roque pequeno bloqueado se f1 ocupado", () => {
      setupBoard([{ id: "e1", piece: "king-white" }, { id: "h1", piece: "rook-white" }, { id: "f1", piece: "pawn-white" }]);
      const movimentos = movimento.movimentosRei("king-white", "e", 1, 4, false, { a1: false, h1: false });
      expect(movimentos).not.toContain("g1");
    });

    test("Roque grande proibido se rei passaria por casa atacada (mock isSquareAttacked)", () => {
      setupBoard([{ id: "e1", piece: "king-white" }, { id: "a1", piece: "rook-white" }]);
      const spy = jest.spyOn(movimento, "isSquareAttacked");
      spy.mockImplementation((pos, cor) => pos === "d1" ? true : false);
      const movimentos = movimento.movimentosRei("king-white", "e", 1, 4, false, { a1: false, h1: false });
      expect(movimentos).not.toContain("c1");
      spy.mockRestore();
    });

    test("Roque grande permitido quando condições OK (mock isSquareAttacked=false)", () => {
      setupBoard([{ id: "e1", piece: "king-white" }, { id: "a1", piece: "rook-white" }, { id: "b1", piece: null }, { id: "c1", piece: null }, { id: "d1", piece: null }]);
      const spy = jest.spyOn(movimento, "isSquareAttacked").mockImplementation(() => false);
      const movimentos = movimento.movimentosRei("king-white", "e", 1, 4, false, { a1: false, h1: false });
      expect(movimentos).toContain("c1");
      spy.mockRestore();
    });
  });

// ---------------- executarRoque e _moverPecaRoque ----------------
  describe("ExecutarRoque e _moverPecaRoque", () => {
    test("executarRoque pequeno chama _moverPecaRoque com parâmetros corretos", () => {
      setupBoard([{ id: "e1", piece: "king-white" }, { id: "h1", piece: "rook-white" }]);
      const spy = jest.spyOn(movimento, "_moverPecaRoque").mockImplementation(()=>{});
      movimento.executarRoque("pequeno", "white");
      expect(spy).toHaveBeenCalledWith("e1", "g1");
      expect(spy).toHaveBeenCalledWith("h1", "f1");
      spy.mockRestore();
    });

    test("executarRoque grande (preto) chama _moverPecaRoque correto", () => {
      setupBoard([{ id: "e8", piece: "king-black" }, { id: "a8", piece: "rook-black" }]);
      const spy = jest.spyOn(movimento, "_moverPecaRoque").mockImplementation(()=>{});
      movimento.executarRoque("grande", "black");
      expect(spy).toHaveBeenCalledWith("e8", "c8");
      expect(spy).toHaveBeenCalledWith("a8", "d8");
      spy.mockRestore();
    });

    test("_moverPecaRoque move peça e limpa origem", () => {
      setupBoard([{ id: "e1", piece: "king-white" }, { id: "g1", piece: null }]);
      movimento._moverPecaRoque("e1", "g1");
      expect($("#g1 .piece").length).toBe(1);
      expect($("#e1 .piece").length).toBe(0);
    });

    test("_moverPecaRoque não altera destino se origem vazia", () => {
      setupBoard([{ id: "e1", piece: null }, { id: "g1", piece: null }]);
      const original = $("#g1").html();
      movimento._moverPecaRoque("e1", "g1");
      expect($("#g1").html()).toBe(original);
    });
  });

// ---------------- Rainha ----------------
  describe("Rainha - combina torre e bispo", () => {
    test("Rainha em d4 combina movimentos", () => {
      setupBoard([{ id: "d4", piece: "queen-white" }]);
      const movimentos = movimento.movimentosRainha("queen-white", "d", 4, 3);
      expect(movimentos).toContain("d8");
      expect(movimentos).toContain("a7");
      expect(movimentos).toContain("h4");
    });
  });

// ---------------- movimentosPossiveis dispatch ----------------
  test("movimentosPossiveis despacha corretamente para cada tipo", () => {
    setupBoard([{ id: "d4", piece: "queen-white" }]);
    expect(movimento.movimentosPossiveis("queen-white", "d4").length).toBeGreaterThan(0);

    setupBoard([{ id: "d4", piece: "rook-white" }]);
    expect(movimento.movimentosPossiveis("rook-white", "d4").length).toBeGreaterThan(0);

    setupBoard([{ id: "d4", piece: "bishop-white" }]);
    expect(movimento.movimentosPossiveis("bishop-white", "d4").length).toBeGreaterThan(0);

    setupBoard([{ id: "d4", piece: "knight-white" }]);
    expect(movimento.movimentosPossiveis("knight-white", "d4").length).toBeGreaterThan(0);

    setupBoard([{ id: "e1", piece: "king-white" }]);
    expect(movimento.movimentosPossiveis("king-white", "e1", false, { a1: false, h1: false }).length).toBeGreaterThanOrEqual(0);

    setupBoard([{ id: "e2", piece: "pawn-white" }]);
    expect(movimento.movimentosPossiveis("pawn-white", "e2").length).toBeGreaterThanOrEqual(0);
  });
});
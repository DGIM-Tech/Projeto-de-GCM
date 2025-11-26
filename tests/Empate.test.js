// Arquivo: tests/Empate.test.js

// Importa a classe principal, ajustado para sua estrutura (js/classes/)
import { Empate } from '../js/classes/Empate.js';

// MOCKs de dependências (Xeque)
jest.mock('../js/classes/Xeque.js', () => ({
  Xeque: {
   estaEmXeque: jest.fn(),
  },
}));

// Obtendo a versão mockada do Xeque
const { Xeque } = require('../js/classes/Xeque.js'); 

// --- CORREÇÃO DE AMBIENTE: MOCK DO ALERT ---
const mockAlert = jest.fn();
global.alert = mockAlert;

// --- MOCKS DE AMBIENTE (jQuery/document e Movimento) ---
const mockJQuery = jest.fn((selector) => {
    if (typeof selector === 'string' && selector.includes('.king-')) {
        const cor = selector.includes('white') ? 'white' : 'black';
        return [{
            className: `piece king-${cor}`,
            parentElement: { id: 'e4' }
        }];
    }
    return {
        attr: jest.fn(() => 'e4'),
        parent: jest.fn().mockReturnThis() 
    };
});
global.$ = mockJQuery; 

// MOCK da classe Movimento 
const mockMovimento = {
   movimentosPossiveis: jest.fn(),
    isSquareAttacked: jest.fn() 
};

// --- FUNÇÃO AUXILIAR PARA SIMULAR O DOM ---
function setupDOM(pecas) {
    document.body.innerHTML = ''; 
    
    pecas.forEach(p => {
        const peca = document.createElement('div');
        peca.className = `piece ${p.cor} ${p.tipo}`; 
        
        const casa = document.createElement('div');
        casa.appendChild(peca);
        
        document.body.appendChild(casa);
    });
}

// ======================================================================
// PRIMEIRA SUÍTE: Testando a lógica principal de Empate (verificarEmpate)
// ======================================================================

describe('Empate.verificarEmpate (Testes Lógicos)', () => {

   let todosMovimentosPossiveisSpy;
   let materialInsuficienteSpy;

   beforeEach(() => {
        jest.clearAllMocks();
        mockAlert.mockClear();
        Xeque.estaEmXeque.mockClear();
        
        mockMovimento.movimentosPossiveis.mockReturnValue(['a3', 'b3']); 
        
        // Cria os Spies para as funções estáticas e configura o mock padrão
        todosMovimentosPossiveisSpy = jest.spyOn(Empate, 'todosMovimentosPossiveis').mockImplementation(() => {});
        materialInsuficienteSpy = jest.spyOn(Empate, 'materialInsuficiente').mockImplementation(() => false);
    });
    
    afterEach(() => {
        // Restaura as funções mockadas após cada teste nesta suíte
        todosMovimentosPossiveisSpy.mockRestore();
        materialInsuficienteSpy.mockRestore();
    });

    // TE-001: Afogamento (Stalemate)
    test('DEVE retornar TRUE para Empate por AFOGAMENTO (Stalemate)', () => {
        todosMovimentosPossiveisSpy.mockReturnValue([]);
        Xeque.estaEmXeque.mockReturnValue(false);

        const resultado = Empate.verificarEmpate('white', mockMovimento);

        expect(resultado).toBe(true);
        expect(mockAlert).toHaveBeenCalledWith("♟️ EMPATE! Afogamento (Stalemate).");
    });

    // TE-002: Xeque-Mate (Não é Empate)
    test('DEVE retornar FALSE para Xeque-Mate (Sem movimentos E Está em Xeque)', () => {
        todosMovimentosPossiveisSpy.mockReturnValue([]);
        Xeque.estaEmXeque.mockReturnValue(true);

        const resultado = Empate.verificarEmpate('black', mockMovimento);

        expect(resultado).toBe(false);
        expect(mockAlert).not.toHaveBeenCalled(); 
    });

    // TE-003: Jogo em Andamento 
    test('DEVE retornar FALSE para Jogo em Andamento (Movimentos Possíveis)', () => {
        todosMovimentosPossiveisSpy.mockReturnValue(['f2', 'f3']);
        Xeque.estaEmXeque.mockReturnValue(false);

        const resultado = Empate.verificarEmpate('black', mockMovimento);

        expect(resultado).toBe(false);
        expect(mockAlert).not.toHaveBeenCalled();
    });

    // TE-004: Material Insuficiente (Prioridade)
    test('DEVE retornar TRUE para Empate por MATERIAL INSUFICIENTE', () => {
        materialInsuficienteSpy.mockReturnValue(true); 
        todosMovimentosPossiveisSpy.mockReturnValue(['a3', 'b3']); 
        Xeque.estaEmXeque.mockReturnValue(false);

        const resultado = Empate.verificarEmpate('white', mockMovimento);

        expect(resultado).toBe(true);
        expect(mockAlert).toHaveBeenCalledWith("♟️ EMPATE! Material insuficiente para dar xeque-mate.");
    });

    // TE-010: Material Insuficiente (Prioridade sobre Afogamento)
    test('DEVE retornar TRUE para Material Insuficiente, mesmo com Afogamento', () => {
        todosMovimentosPossiveisSpy.mockReturnValue([]); 
        materialInsuficienteSpy.mockReturnValue(true); 
        Xeque.estaEmXeque.mockReturnValue(false);

        const resultado = Empate.verificarEmpate('black', mockMovimento);

        expect(resultado).toBe(true);
        expect(mockAlert).toHaveBeenCalledWith("♟️ EMPATE! Material insuficiente para dar xeque-mate.");
        expect(mockAlert).not.toHaveBeenCalledWith("♟️ EMPATE! Afogamento (Stalemate).");
    });

    // TE-011: Jogo em Andamento (Material Suficiente)
    test('DEVE retornar FALSE para Jogo em Andamento com Material Suficiente', () => {
        todosMovimentosPossiveisSpy.mockReturnValue(['g8']); 
        materialInsuficienteSpy.mockReturnValue(false);
        Xeque.estaEmXeque.mockReturnValue(false);

        const resultado = Empate.verificarEmpate('white', mockMovimento);

        expect(resultado).toBe(false);
        expect(mockAlert).not.toHaveBeenCalled();
    });
});

// ----------------------------------------------------------------------
// SEGUNDA SUÍTE: Testando a lógica de material insuficiente (IMPLEMENTAÇÃO REAL)
// ----------------------------------------------------------------------

describe('Empate.materialInsuficiente (Testes de Cobertura de Material)', () => {

    beforeEach(() => {
        mockAlert.mockClear();
    });

    // TE-005: Rei vs Rei
    test('DEVE retornar TRUE para Rei vs Rei (Material Insuficiente)', () => {
        const pecas = [
            { cor: 'white', tipo: 'king' },
            { cor: 'black', tipo: 'king' }
        ];
        setupDOM(pecas);

        expect(Empate.materialInsuficiente()).toBe(true);
    });

    // TE-006: Rei + Bispo vs Rei
    test('DEVE retornar TRUE para Rei + Bispo vs Rei (Material Insuficiente)', () => {
        const pecas = [
            { cor: 'white', tipo: 'king' },
            { cor: 'white', tipo: 'bishop-light' },
            { cor: 'black', tipo: 'king' }
        ];
        setupDOM(pecas);

        expect(Empate.materialInsuficiente()).toBe(true);
    });

    // TE-007: Rei + Cavalo vs Rei
    test('DEVE retornar TRUE para Rei + Cavalo vs Rei (Material Insuficiente)', () => {
        const pecas = [
            { cor: 'white', tipo: 'king' },
            { cor: 'black', tipo: 'king' },
            { cor: 'black', tipo: 'knight' }
        ];
        setupDOM(pecas);

        expect(Empate.materialInsuficiente()).toBe(true);
    });

    // TE-008: Material Suficiente (Rei + Peão vs Rei)
    test('DEVE retornar FALSE para Rei + Peão vs Rei (Material Suficiente)', () => {
        const pecas = [
            { cor: 'white', tipo: 'king' },
            { cor: 'white', tipo: 'pawn' },
            { cor: 'black', tipo: 'king' }
        ];
        setupDOM(pecas);

        expect(Empate.materialInsuficiente()).toBe(false);
    });

    // TE-009: Material Suficiente (Rei + Torre vs Rei)
    test('DEVE retornar FALSE para Rei + Torre vs Rei (Material Suficiente)', () => {
        const pecas = [
            { cor: 'white', tipo: 'king' },
            { cor: 'black', tipo: 'king' },
            { cor: 'black', tipo: 'rook' }
        ];
        setupDOM(pecas);

        expect(Empate.materialInsuficiente()).toBe(false);
    });
    
    // TE-012: Rei + Bispo vs Rei + Bispo (Material Insuficiente)
    test('DEVE retornar TRUE para Rei + Bispo vs Rei + Bispo (diferentes cores de casas)', () => {
        const pecas = [
            { cor: 'white', tipo: 'king' },
            { cor: 'white', tipo: 'bishop-light' },
            { cor: 'black', tipo: 'king' },
            { cor: 'black', tipo: 'bishop-dark' }
        ];
        setupDOM(pecas);

        expect(Empate.materialInsuficiente()).toBe(true);
    });

    // TE-013: Rei + 2 Bispos de mesma cor vs Rei (Material Suficiente)
    test('DEVE retornar FALSE para Rei + 2 Bispos de mesma cor vs Rei (Suficiente)', () => {
        const pecas = [
            { cor: 'white', tipo: 'king' },
            { cor: 'white', tipo: 'bishop-light' },
            { cor: 'white', tipo: 'bishop-light' }, 
            { cor: 'black', tipo: 'king' }
        ];
        setupDOM(pecas);

        expect(Empate.materialInsuficiente()).toBe(false);
    });
    
    // TE-014: Rei + Cavalo vs Rei + Bispo (Material Insuficiente)
    test('DEVE retornar TRUE para Rei + Cavalo vs Rei + Bispo', () => {
        const pecas = [
            { cor: 'white', tipo: 'king' },
            { cor: 'white', tipo: 'knight' },
            { cor: 'black', tipo: 'king' },
            { cor: 'black', tipo: 'bishop-dark' }
        ];
        setupDOM(pecas);

        expect(Empate.materialInsuficiente()).toBe(true);
    });

    // TE-015: Material Suficiente (Rei + 2 Cavalos vs Rei)
    test('DEVE retornar FALSE para Rei + 2 Cavalos vs Rei (Suficiente)', () => {
        const pecas = [
            { cor: 'white', tipo: 'king' },
            { cor: 'white', tipo: 'knight' },
            { cor: 'white', tipo: 'knight' },
            { cor: 'black', tipo: 'king' }
        ];
        setupDOM(pecas);

        expect(Empate.materialInsuficiente()).toBe(false);
    });

    // TE-016: DEVE retornar FALSE para 3 Cavalos vs Rei (Força default e L113)
    test('TE-016: DEVE retornar FALSE para 3 Cavalos vs Rei (Força default e L113)', () => {
        const pecas = [
            { cor: 'white', tipo: 'king' },
            { cor: 'black', tipo: 'king' },
            { cor: 'white', tipo: 'knight' },
            { cor: 'white', tipo: 'knight' },
            { cor: 'white', tipo: 'knight' } // Total de 3 Cavalos (length=3)
        ];
        setupDOM(pecas); 

        // pecasSemRei.length será 3. Não é 1 ou 2. Deve ir para 'default' (L111) e executar L113.
        expect(Empate.materialInsuficiente()).toBe(false); 
    });
    
    // TE-017: Cobertura da Linha 93 (Rei + Cavalo vs Rei + Cavalo)
    test('TE-019: DEVE retornar FALSE para Rei + Cavalo vs Rei + Cavalo (Material Suficiente)', () => {
        const pecas = [
            { cor: 'white', tipo: 'king' },
            { cor: 'white', tipo: 'knight' },
            { cor: 'black', tipo: 'king' },
            { cor: 'black', tipo: 'knight' }
        ];
        // Este teste verifica a linha 92 (N+N retorna false) e, teoricamente, a L93 (código redundante)
        setupDOM(pecas);

        expect(Empate.materialInsuficiente()).toBe(false); 
    });
});


// ----------------------------------------------------------------------
// TERCEIRA SUÍTE: Testando a lógica de movimentos possíveis (COBERTURA REAL)
// ----------------------------------------------------------------------

describe('Empate.todosMovimentosPossiveis (Testes de Cobertura)', () => {
    
    beforeEach(() => {
        mockMovimento.movimentosPossiveis.mockClear();
    });

    // TE-018: NOVO TESTE DE COBERTURA (Cobre L42 e L53: cenário de lista vazia de peças)
    test('TE-017: DEVE retornar [] se o jogador não tiver peças no tabuleiro', () => {
        const pecas = [
            { cor: 'white', tipo: 'king' },
            { cor: 'white', tipo: 'pawn' }
        ];
        setupDOM(pecas); 

        const resultado = Empate.todosMovimentosPossiveis('black', mockMovimento);

        expect(resultado).toEqual([]);
        expect(mockMovimento.movimentosPossiveis).not.toHaveBeenCalled();
    });
    
    // TE-019: NOVO TESTE DE COBERTURA (Cobre L45-L51: loop de concatenação)
    test('TE-018: DEVE retornar todos os movimentos possíveis de múltiplas peças', () => {
        const pecas = [
            { cor: 'white', tipo: 'king' },
            { cor: 'white', tipo: 'queen' }
        ];
        setupDOM(pecas);
        
        mockMovimento.movimentosPossiveis
            .mockReturnValueOnce(['d1']) 
            .mockReturnValueOnce(['a1', 'a2']); 

        const resultado = Empate.todosMovimentosPossiveis('white', mockMovimento);

        expect(resultado).toEqual(['d1', 'a1', 'a2']);
        expect(mockMovimento.movimentosPossiveis).toHaveBeenCalledTimes(2);
    });

});
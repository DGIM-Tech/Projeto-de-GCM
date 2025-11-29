import { Tabuleiro } from '../js/classes/Tabuleiro.js'; 

// =====================================================
// 🔧 Helper para simular um elemento DOM/jQuery isolado
// =====================================================
const createElementMock = (id, pieceClass = null) => {
    return {
        html: jest.fn(),
        attr: jest.fn((key) => {
            if (key === 'id') return id;
            if (key === 'class' && pieceClass) return pieceClass;
            return null;
        }),
        parent: jest.fn(() => ({
            attr: jest.fn(() => id)
        }))
    };
};

// =====================================================
// 🧪 Mock completo do jQuery
// =====================================================
const mockJQuery = () => {
    const jQClassMock = {
        empty: jest.fn(),
        append: jest.fn(),
        html: jest.fn(),
        each: jest.fn()
    };

    const elementMocks = {};

    const $mock = jest.fn((selector) => {

        // Caso A: $(elementoDOM)
        if (typeof selector === 'object' && selector !== null) {
            return selector;
        }

        // Caso B: Seletores de CLASSE
        if (typeof selector === 'string' && selector.startsWith('.')) {

            // $('.square-board')
            if (selector === '.square-board') {
                jQClassMock.each = jest.fn((callback) => {
                    const mockA1 = createElementMock('a1');
                    const mockC4 = createElementMock('c4');

                    elementMocks['a1'] = mockA1;
                    elementMocks['c4'] = mockC4;

                    callback(0, mockA1);
                    callback(1, mockC4);

                    return jQClassMock;
                });
            }

            // $('.piece')
            if (selector === '.piece') {
                jQClassMock.each = jest.fn((callback) => {
                    const mockA8 = createElementMock('a8', 'piece rook-black');
                    callback(0, mockA8);
                    return jQClassMock;
                });
            }

            return jQClassMock;
        }

        // Caso C: $('a1'), $('c4') etc
        if (typeof selector === 'string' && elementMocks[selector]) {
            return elementMocks[selector];
        }

        return jQClassMock;
    });

    global.$ = $mock;
    return $mock;
};

// =====================================================
// ⚙️ Setup global dos testes
// =====================================================
let tabuleiro;
let $mocked;

beforeEach(() => {
    jest.clearAllMocks();        // ✅ LIMPA ANTES
    tabuleiro = new Tabuleiro();
    $mocked = mockJQuery();      // ✅ recria mocks com implementação
});

// =====================================================
// ✅ Testes de posição válida (PV)
// =====================================================
test('PV-001: Deve retornar TRUE para uma posição válida (a1)', () => {
    expect(tabuleiro.posicaoValida('a1')).toBe(true);
});

test('PV-002: Deve retornar TRUE para a posição limite (h8)', () => {
    expect(tabuleiro.posicaoValida('h8')).toBe(true);
});

test('PV-003: Deve retornar FALSE para entrada não-string', () => {
    expect(tabuleiro.posicaoValida(10)).toBe(false);
});

test('PV-004: Deve retornar FALSE para string com tamanho inválido', () => {
    expect(tabuleiro.posicaoValida('e4a')).toBe(false);
});

test('PV-005: Deve retornar FALSE para coluna inválida (i4)', () => {
    expect(tabuleiro.posicaoValida('i4')).toBe(false);
});

test('PV-006: Deve retornar FALSE para linha abaixo do limite (a0)', () => {
    expect(tabuleiro.posicaoValida('a0')).toBe(false);
});

test('PV-007: Deve retornar FALSE para linha acima do limite (h9)', () => {
    expect(tabuleiro.posicaoValida('h9')).toBe(false);
});

// =====================================================
// ✅ Testes de printBoard (PB)
// =====================================================
test('PB-001: Deve chamar .empty() para limpar o tabuleiro', () => {
    tabuleiro.printBoard();
    expect($mocked('.board').empty).toHaveBeenCalledTimes(1);
});

test('PB-002: Deve chamar .append() 64 vezes (64 casas)', () => {
    tabuleiro.printBoard();
    expect($mocked('.board').append).toHaveBeenCalledTimes(64);
});

// =====================================================
// ✅ Testes de inicializarPecas (IP)
// =====================================================
test('IP-001: Deve inserir peça na casa a1', () => {
    tabuleiro.inicializarPecas();
    expect($mocked('a1').html).toHaveBeenCalledTimes(1);
});

test('IP-002: NÃO deve inserir peça em casa vazia (c4)', () => {
    tabuleiro.inicializarPecas();
    expect($mocked('c4').html).not.toHaveBeenCalled();
});

// =====================================================
// ✅ Teste de inicialização geral
// =====================================================
test('IN-001: Deve chamar printBoard e inicializarPecas', () => {
    const spyPrint = jest.spyOn(tabuleiro, 'printBoard').mockImplementation(() => {});
    const spyInit = jest.spyOn(tabuleiro, 'inicializarPecas').mockImplementation(() => {});

    tabuleiro.inicar();

    expect(spyPrint).toHaveBeenCalledTimes(1);
    expect(spyInit).toHaveBeenCalledTimes(1);

    spyPrint.mockRestore();
    spyInit.mockRestore();
});

// =====================================================
// ✅ GA-001 — getTabuleiroAtual (CORRIGIDO)
// =====================================================
test('GA-001: Deve ler o DOM e extrair tipo e cor da peça (a8)', () => {
    const resultado = tabuleiro.getTabuleiroAtual();

    expect(resultado).toEqual({
        a8: {
            tipo: 'rook',
            cor: 'black',
            posicaoValida: true
        }
    });
});

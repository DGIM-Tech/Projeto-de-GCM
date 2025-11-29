// -------------------------------------------------------
// 1. MOCK DA CLASSE BASE 'JOGADOR' (CORRIGIDO)
// A definição da classe MockJogador é movida para dentro do jest.mock
// -------------------------------------------------------

// Aplica o mock para que JogadorIA use a classe mockada
jest.mock('../js/classes/Jogador.js', () => ({
    // A definição da classe Mock está agora DENTRO da função factory
    Jogador: class MockJogador {
        constructor(nome, cor) {
            this.nome = nome;
            this.cor = cor;
            this.tipo = 'MockHumano'; // Valor que o JogadorIA enxerga
        }
        fazerMovimento() { return Promise.resolve(null); }
    }
}));

// -------------------------------------------------------
// Importação das classes
// -------------------------------------------------------
// A classe JogadorIA importará o mock automaticamente
import { JogadorIA } from '../js/classes/JogadorIA.js'; 

// Importa a classe Jogador (ainda é o mock, mas precisamos dela no escopo)
import { Jogador } from '../js/classes/Jogador.js'; 


// -------------------------------------------------------
// Mocks Globais
// -------------------------------------------------------
global.fetch = jest.fn();
global.Swal = { fire: jest.fn() };
global.$ = jest.fn((selector) => {
    return {
        selector,
        find: jest.fn((q) => {
            return 'peca-mock';
        })
    };
});

// -------------------------------------------------------
// SUITE DE TESTES: CLASSE JOGADORIA
// -------------------------------------------------------
describe('JogadorIA', () => {

    beforeEach(() => {
        jest.clearAllMocks();
        global.fetch.mockReset(); 
    });

    // =====================================================
    // CT-IA-001 – Inicialização
    // =====================================================
    test('CT-IA-001 – Deve inicializar corretamente a JogadorIA', () => {
        const ia = new JogadorIA('branco', 'médio');
        expect(ia.nome).toBe('Computador');
        expect(ia.tipo).toBe('IA');
        expect(ia instanceof Jogador).toBe(true); 
    });

    // =====================================================
    // CT-IA-002, 003, 004 – Profundidade
    // =====================================================
    test('CT-IA-002 – Deve enviar depth = 1 para dificuldade iniciante', async () => {
        fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ move: 'e2e4' }) });
        const ia = new JogadorIA('branco', 'iniciante');
        await ia.fazerMovimento({ _gerarFEN: jest.fn() });
        expect(JSON.parse(fetch.mock.calls[0][1].body).depth).toBe(1);
    });

    test('CT-IA-003 – Deve enviar depth = 6 para dificuldade médio', async () => {
        fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ move: 'g1f3' }) });
        const ia = new JogadorIA('preto', 'médio');
        await ia.fazerMovimento({ _gerarFEN: jest.fn() });
        expect(JSON.parse(fetch.mock.calls[0][1].body).depth).toBe(6);
    });
    
    test('CT-IA-004 – Deve enviar profundidade indefinida para dificuldade inválida', async () => {
        fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ move: 'b1c3' }) });
        const ia = new JogadorIA('branco', 'expert'); 
        await ia.fazerMovimento({ _gerarFEN: jest.fn() });
        expect(JSON.parse(fetch.mock.calls[0][1].body).depth).toBeUndefined(); 
    });

    // =====================================================
    // CT-IA-005, 006 – Erros
    // =====================================================
    test('CT-IA-005 – Deve retornar null se API não retornar movimento', async () => {
        fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ score: 0.1 }) });
        const resultado = await new JogadorIA('preto', 'fácil').fazerMovimento({ _gerarFEN: jest.fn() });
        expect(resultado).toBeNull();
        expect(Swal.fire).toHaveBeenCalledWith('Erro', 'Movimento inválido retornado pela IA', 'error');
    });

    test('CT-IA-006 – Deve retornar null em erro de conexão', async () => {
        fetch.mockRejectedValueOnce(new Error('Erro de rede'));
        const resultado = await new JogadorIA('branco', 'difícil').fazerMovimento({ _gerarFEN: jest.fn() });
        expect(resultado).toBeNull();
        expect(Swal.fire).toHaveBeenCalledWith('Erro de Conexão', 'Não foi possível contatar a IA', 'error');
    });

    // =====================================================
    // CT-IA-007, 008 – Verificações de Requisição
    // =====================================================
    test('CT-IA-007 – Deve chamar _gerarFEN() e enviar no body', async () => {
        const FEN_TESTE = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
        fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ move: 'a2a3' }) });
        const jogoMock = { _gerarFEN: jest.fn().mockReturnValue(FEN_TESTE) };
        await new JogadorIA('branco', 'iniciante').fazerMovimento(jogoMock);
        expect(jogoMock._gerarFEN).toHaveBeenCalled();
        expect(JSON.parse(fetch.mock.calls[0][1].body).fen).toBe(FEN_TESTE);
    });

    test('CT-IA-008 – Deve chamar a API correta', async () => {
        fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ move: 'h2h4' }) });
        await new JogadorIA('preto', 'iniciante').fazerMovimento({ _gerarFEN: jest.fn() });
        expect(fetch).toHaveBeenCalledWith('https://chess-api.com/v1', expect.objectContaining({ method: 'POST' }));
    });
    
    // =====================================================
    // CT-IA-09 – Cobertura do Catch Interno do jQuery
    // =====================================================
    test('CT-IA-09 – Deve cobrir o bloco catch interno quando o jQuery falha', async () => {
        fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ move: 'e2e4' }) });
        const originalJQueryMock = global.$;
        
        // Força o $ a lançar um erro na chamada (antes do find)
        global.$ = jest.fn(() => { throw new Error("Erro simulado do jQuery"); });
        
        const ia = new JogadorIA('branco', 'médio');
        const resultado = await ia.fazerMovimento({ _gerarFEN: jest.fn() });

        expect(resultado).not.toBeNull();
        expect(resultado.peca).toBeNull(); 
        
        // Restaura o mock original
        global.$ = originalJQueryMock;
    });

    // =====================================================
    // CT-IA-010 – Cobertura do Parâmetro Padrão
    // =====================================================
    test('CT-IA-010 – Deve usar "médio" como nível padrão se omitido', () => {
        // 1. Não passamos o segundo argumento (nivelDificuldade)
        const ia = new JogadorIA('preto'); 

        // 2. Esperamos que o valor padrão 'médio' tenha sido atribuído.
        expect(ia.nivelDificuldade).toBe('médio');
    });
});

// -------------------------------------------------------
// SUITE DE TESTES: CLASSE JOGADOR (Usa a classe REAL)
// -------------------------------------------------------
describe('Jogador', () => {
    // CORREÇÃO: Desativa o mock da classe Jogador APENAS para este bloco.
    const { Jogador: JogadorReal } = jest.requireActual('../js/classes/Jogador.js');

    // =====================================================
    // CT-JOG-001 – Inicialização (CORRIGIDO)
    // =====================================================
    test('CT-JOG-001 – Deve inicializar corretamente a Jogador (Humano)', () => {
        const humano = new JogadorReal('Maria', 'preto'); // Usa a classe real

        expect(humano.nome).toBe('Maria');
        expect(humano.cor).toBe('preto');
        expect(humano.tipo).toBe('Humano'); // Espera o valor real ("Humano")
    });

    // =====================================================
    // CT-JOG-002 – Comportamento de Movimento
    // =====================================================
    test('CT-JOG-002 – fazerMovimento deve retornar uma Promise resolvida com null', async () => {
        const humano = new JogadorReal('Jose', 'branco'); // Usa a classe real
        const resultado = humano.fazerMovimento({});

        expect(resultado).toBeInstanceOf(Promise);

        const valorResolvido = await resultado;
        expect(valorResolvido).toBeNull();
    });
});
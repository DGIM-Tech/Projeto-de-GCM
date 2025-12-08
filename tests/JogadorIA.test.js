/**
 * @jest-environment jsdom
 */
import { JogadorIA } from '../js/classes/JogadorIA.js'; 
import { Jogo } from '../js/classes/Jogo.js';
// Importação de Jogador para cobrir a linha 13 em Jogador.js
import { Jogador } from '../js/classes/Jogador.js'; 
import Swal from 'sweetalert2';

// 1. Mocks de SweetAlert2 e Fetch
jest.mock('sweetalert2', () => ({
    fire: jest.fn(),
}));
global.fetch = jest.fn();

// Expor o mock do Swal ao escopo global para evitar ReferenceError na classe de produção
global.Swal = Swal; 


// 2. Mock de objetos de retorno para o jQuery
const mockPieceFound = { isPieceElement: true };
const mockJQueryEmpty = { length: 0 }; // Objeto retornado quando a peça não é encontrada


// 3. Setup e Mocks de Jogo
let ia;
let mockJogo;

// Função auxiliar para criar um mock seguro do elemento JQuery
const createMockJQueryElement = (pieceResult) => ({
    // A função find é recriada para cada teste, garantindo que não seja redefinida
    find: jest.fn((selector) => {
        if (selector === '.piece') {
            return pieceResult;
        }
        return mockJQueryEmpty; // Retorno padrão para outros seletores internos
    }),
    length: 1
});

beforeEach(() => {
    // Limpa todos os mocks (Swal, fetch, $) antes de cada teste
    jest.clearAllMocks();
    
    // ✅ CORREÇÃO CRÍTICA: Re-define o mock global $ para garantir a estrutura correta
    global.$ = jest.fn((selector) => {
        if (selector === '#e2') {
            // Caso de Sucesso: Retorna um mock que encontrará a peça (mockPieceFound)
            return createMockJQueryElement(mockPieceFound); 
        }
        if (selector === '#d7') {
            // Caso de Peça Não Encontrada: Retorna um mock que não encontrará a peça (mockJQueryEmpty)
            return createMockJQueryElement(mockJQueryEmpty); 
        }
        // Caso de elemento DOM não encontrado
        return { find: jest.fn(() => mockJQueryEmpty), length: 0 };
    });

    // Configuração de Jogo
    mockJogo = {
        _gerarFEN: jest.fn().mockReturnValue('fen-mockada'), 
        corAtual: 'brancas',
        movimento: {
             movimentosPossiveis: jest.fn().mockReturnValue([]),
        }
    };
    ia = new JogadorIA('brancas', 'médio');

    // Mock padrão de fetch para sucesso
    fetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({ move: 'e2e4' })
    });
});

describe('JogadorIA', () => {

    // Testes de Cobertura para o Constructor (Linha 4 do JogadorIA.js)
    test('Deve usar "médio" como nível padrão se não for fornecido', () => {
        const iaPadrao = new JogadorIA('pretas'); 
        expect(iaPadrao.nivelDificuldade).toBe('médio');
    });

    // Teste de Cobertura para Jogador.js (Linha 13 do Jogador.js)
    test('Jogador deve inicializar corretamente com tipo "Humano"', () => {
        const jogadorHumano = new Jogador('João', 'brancas');
        expect(jogadorHumano.tipo).toBe('Humano');
    });
    
    // ----------------------------------------------------
    // Testes de Inicialização e Profundidade (Depth)
    // ----------------------------------------------------
    describe('Inicialização e Dificuldade', () => {
        test('Deve inicializar corretamente com cor e tipo IA', () => {
            expect(ia.nome).toBe('Computador');
            expect(ia.cor).toBe('brancas');
            expect(ia.tipo).toBe('IA');
            expect(ia.nivelDificuldade).toBe('médio');
        });

        test.each([
            ['iniciante', 1],
            ['fácil', 2],
            ['médio', 5],
            ['difícil', 8]
        ])('Deve usar a profundidade (depth) correta para o nível %s', async (nivel, expectedDepth) => {
            ia = new JogadorIA('pretas', nivel);
            await ia.fazerMovimento(mockJogo);

            const fetchCall = fetch.mock.calls[0][1];
            const receivedBody = JSON.parse(fetchCall.body);
            
            expect(receivedBody).toEqual({
                fen: mockJogo._gerarFEN(), 
                depth: expectedDepth
            });
        });
    });

    // ----------------------------------------------------
    // Testes de Sucesso (Caminho Feliz)
    // ----------------------------------------------------
    describe('fazerMovimento - Sucesso', () => {
        // ✅ TESTE CORRIGIDO
        test('Deve retornar a casa de origem, destino e a peça ao receber um movimento válido', async () => {
            fetch.mockResolvedValueOnce({
                ok: true,
                json: jest.fn().mockResolvedValue({ move: 'e2e4' })
            });
            
            const movimento = await ia.fazerMovimento(mockJogo);

            // Agora o mock está configurado para retornar 'mockPieceFound' para '#e2'
            expect(movimento).toEqual({
                casaOrigem: 'e2',
                casaDestino: 'e4',
                peca: mockPieceFound // Deve receber o objeto mockado
            });
        });

        test('Deve chamar o _gerarFEN do objeto Jogo', async () => {
            await ia.fazerMovimento(mockJogo);
            expect(mockJogo._gerarFEN).toHaveBeenCalledTimes(1);
        });
    });

    // ----------------------------------------------------
    // Testes de Erro (Caminho Excepcional)
    // ----------------------------------------------------
    describe('fazerMovimento - Erros', () => {

        test('Deve tratar erro de rede (falha no fetch) e mostrar Swal (Cobre catch principal)', async () => {
            fetch.mockRejectedValue(new Error('Falha de rede simulada'));

            const movimento = await ia.fazerMovimento(mockJogo);

            expect(movimento).toBeNull(); 
            expect(Swal.fire).toHaveBeenCalledWith(
                'Erro de Conexão',
                'Não foi possível contatar a IA',
                'error'
            );
        });

        test('Deve tratar JSON retornado inválido (sem a propriedade move) e mostrar Swal (Cobre if)', async () => {
            fetch.mockResolvedValueOnce({
                ok: true,
                json: jest.fn().mockResolvedValue({ score: 10 })
            });

            const movimento = await ia.fazerMovimento(mockJogo);

            expect(movimento).toBeNull();
            expect(Swal.fire).toHaveBeenCalledWith(
                'Erro',
                'Movimento inválido retornado pela IA',
                'error'
            );
        });

        // ✅ TESTE CORRIGIDO
        test('Deve retornar peca: {length: 0} quando a peça não for encontrada no DOM', async () => {
            fetch.mockResolvedValueOnce({
                ok: true,
                json: jest.fn().mockResolvedValue({ move: 'd7d5' }) // Movimento da casa d7
            });
            
            // O mock global do $ já está configurado para o seletor '#d7' retornar um objeto JQuery vazio.
            const movimento = await ia.fazerMovimento(mockJogo);

            // A expectativa agora corresponde ao mockJQueryEmpty
            expect(movimento).toEqual({
                casaOrigem: 'd7',
                casaDestino: 'd5',
                peca: mockJQueryEmpty 
            });
            expect(Swal.fire).not.toHaveBeenCalled(); 
        });
        
        test('Deve retornar peca: null se o jQuery lançar uma exceção (catch interno)', async () => {
             fetch.mockResolvedValueOnce({
                ok: true,
                json: jest.fn().mockResolvedValue({ move: 'a1a2' })
            });

            // Sobrescreve o mock global do $ temporariamente para forçar o lançamento de erro
            const originalGlobal$ = globalThis.$;
            globalThis.$ = jest.fn(() => {
                throw new Error('Erro forçado de jQuery/DOM');
            });
            
            const movimento = await ia.fazerMovimento(mockJogo);

            expect(movimento).toEqual({
                casaOrigem: 'a1',
                casaDestino: 'a2',
                peca: null // O catch interno forçou peca = null
            });
            expect(Swal.fire).not.toHaveBeenCalled(); 
            
            // Restaura o mock original após o teste
            globalThis.$ = originalGlobal$; 
        });
        
        test('Deve tratar resposta HTTP não OK (ex: status 500) e cair no catch principal', async () => {
             fetch.mockResolvedValueOnce({
                ok: false, // Força o lançamento de erro
                json: jest.fn().mockResolvedValue({})
            });

            const movimento = await ia.fazerMovimento(mockJogo);

            expect(movimento).toBeNull();
            expect(Swal.fire).toHaveBeenCalledWith(
                'Erro de Conexão',
                'Não foi possível contatar a IA',
                'error'
            );
        });
    });
});
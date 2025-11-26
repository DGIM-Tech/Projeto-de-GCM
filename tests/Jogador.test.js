// Arquivo: tests/Jogador.test.js

// Importa a classe a ser testada
import { Jogador } from '../js/classes/Jogador.js';

describe('Classe Jogador', () => {

    // ========================================
    //  PRIMEIRA SUÍTE: Testes do Construtor
    // ========================================

    describe('Constructor (Inicialização)', () => {
        
        // JOG-001: Inicialização Válida (Cor Branca)
        test('JOG-001: Deve inicializar o jogador com nome, cor e tipo padrão (Humano)', () => {
            const jogador = new Jogador('Alice', 'white');
            
            expect(jogador.nome).toBe('Alice');
            expect(jogador.cor).toBe('white');
            expect(jogador.tipo).toBe('Humano');
        });

        // JOG-002: Inicialização Válida (Cor Preta)
        test('JOG-002: Deve inicializar corretamente o jogador preto', () => {
            const jogador = new Jogador('Bob', 'black');
            
            expect(jogador.nome).toBe('Bob');
            expect(jogador.cor).toBe('black');
            expect(jogador.tipo).toBe('Humano');
        });

        // JOG-003: Teste de Limite: Nome vazio
        test('JOG-003: Deve aceitar nome vazio, mantendo a cor e o tipo', () => {
            const jogador = new Jogador('', 'white');
            
            expect(jogador.nome).toBe('');
            expect(jogador.cor).toBe('white');
        });

        // JOG-004: Cor Inválida (Validação de tipo de dado)
        test('JOG-004: Deve armazenar a cor, mesmo que seja um valor inválido ("red")', () => {
            const jogador = new Jogador('Charlie', 'red');
            
            expect(jogador.cor).toBe('red');
            expect(jogador.tipo).toBe('Humano'); 
        });

        // JOG-005: Nome Omitido
        test('JOG-005: Deve armazenar undefined se o nome for omitido/undefined', () => {
            const jogador = new Jogador(undefined, 'white');
            
            expect(jogador.nome).toBeUndefined();
            expect(jogador.cor).toBe('white');
        });
    });

    // ============================================================
    // SEGUNDA SUÍTE: Testes de Comportamento (fazerMovimento)
    // ============================================================

    describe('fazerMovimento', () => {
        let jogador;
        beforeEach(() => {
            jogador = new Jogador('Testador', 'white');
        });

        // JOG-006: Verificar o retorno de uma Promise resolvida
        test('JOG-006: Deve retornar uma Promise resolvida para null', async () => {
            const resultado = jogador.fazerMovimento(null);
            
            // 1. Deve ser uma Promise
            expect(resultado).toBeInstanceOf(Promise);

            // 2. Deve resolver para null
            await expect(resultado).resolves.toBeNull();
        });

        // JOG-007: Verificar o retorno com um objeto jogo mockado
        test('JOG-007: Deve resolver para null, ignorando o objeto jogo (mock)', async () => {
            const mockJogo = { tabuleiro: [], estado: 'em andamento' };
            const resultado = jogador.fazerMovimento(mockJogo);

            await expect(resultado).resolves.toBeNull();
        });

        // JOG-008: Verificar se a função é assíncrona (thenable)
        test('JOG-008: O retorno deve ser um objeto "thenable" (Promise)', () => {
            const resultado = jogador.fazerMovimento(null);
            
            // Verifica se o objeto tem o método .then, característico de Promises
            expect(typeof resultado.then).toBe('function');
            expect(typeof resultado.catch).toBe('function');
        });
    });
});
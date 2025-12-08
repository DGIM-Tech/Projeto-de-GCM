/**
 * @jest-environment jsdom
 */
import { Jogo } from '../js/classes/Jogo.js';
import { Jogador } from '../js/classes/Jogador.js';

// Importa os módulos para que possamos mockar suas implementações
import { Tabuleiro } from '../js/classes/Tabuleiro.js';
import { Movimento } from '../js/classes/Movimento.js';
import { Xeque } from '../js/classes/Xeque.js';

import Swal from 'sweetalert2';

// ----------------------------------------------------
// 1. Mocks de Dependências
// ----------------------------------------------------

// Mock básico para Tabuleiro (o objeto que a instância de Jogo deve receber)
const mockTabuleiro = {
    inicar: jest.fn(),
    _tabuleiro: {},
};
// Mock para Movimento
const mockMovimento = {
    movimentosPossiveis: jest.fn().mockReturnValue({}),
};
// Mock para Xeque (vazio por enquanto)
const mockXeque = {};

// Mock do jQuery para simular o DOM
const mockJQueryElement = {
    // ✅ CORREÇÃO 1: Adicionar .mockReturnThis() para garantir o encadeamento
    attr: jest.fn().mockReturnThis(),
    addClass: jest.fn().mockReturnThis(),
    removeClass: jest.fn().mockReturnThis(),
    off: jest.fn().mockReturnThis(),
    on: jest.fn().mockReturnThis(),
    hasClass: jest.fn().mockReturnValue(true),
    trigger: jest.fn(),
    parent: jest.fn().mockReturnThis(),
    find: jest.fn().mockReturnThis(),
};

// ✅ CORREÇÃO 2: Definir o mock de $ de forma robusta e em múltiplos escopos globais
const $ = jest.fn((selector) => {
    // Garante que qualquer chamada $() (como $('.board') ou $('#e4')) retorne o elemento mockado
    return mockJQueryElement;
});

// Configuração para métodos estáticos do jQuery (como $.fn.on)
$.fn = {
    off: jest.fn().mockReturnThis(),
    on: jest.fn().mockReturnThis(),
    // Adicione outros métodos do .fn se o seu código Jogo.js usar
};

// Define o mock em todos os escopos globais possíveis para estabilidade assíncrona
global.$ = $;
global.jQuery = $;
global.window.$ = $;
global.window.jQuery = $;


// Mock do Swal
jest.mock('sweetalert2', () => ({
    fire: jest.fn(),
}));
global.Swal = Swal;

// Mocking as classes importadas
jest.mock('../js/classes/Tabuleiro.js');
jest.mock('../js/classes/Movimento.js');
jest.mock('../js/classes/Xeque.js');


// ----------------------------------------------------
// 2. Classes Mockadas (IA e Humano)
// ----------------------------------------------------
class MockJogadorIA extends Jogador {
    constructor(cor) {
        super('Computador', cor);
        this.tipo = 'IA';
        this.cor = cor;
        this.fazerMovimento = jest.fn();
    }
}

class MockJogadorHumano extends Jogador {
    constructor(cor) {
        super('Humano', cor);
        this.tipo = 'Humano';
        this.cor = cor;
    }
}


// ----------------------------------------------------
// 3. Setup do Teste
// ----------------------------------------------------
let jogadorBrancas;
let jogadorPretas;
let jogo;

// Variáveis para manter a referência aos Spies
let registrarEventosSpy;
let atualizarHistoricoSpy;
let proximoTurnoSpy;
let tentarMoverPecaSpy;

beforeEach(() => {
    jest.clearAllMocks();

    // ✅ CORREÇÃO 3: Definir o retorno dos construtores. 
    // Isso garante que jogo.tabuleiro.inicar funcione e que a referência seja a esperada.
    Tabuleiro.mockImplementation(() => mockTabuleiro);
    Movimento.mockImplementation(() => mockMovimento);
    Xeque.mockImplementation(() => mockXeque); // Adiciona mock do Xeque também

    jogadorBrancas = new MockJogadorHumano('white');
    jogadorPretas = new MockJogadorHumano('black');

    // Mocks dos métodos internos do Jogo que não queremos executar
    const mockInternalMethods = {
        _registrarEventos: jest.fn(),
        atualizarInterfaceHistorico: jest.fn(),
        proximoTurno: jest.fn(),
        _tentarMoverPeca: jest.fn(),
    };

    // SpyOn CORRETO: Sem o argumento 'get' e usando mockImplementation
    registrarEventosSpy = jest.spyOn(Jogo.prototype, '_registrarEventos').mockImplementation(mockInternalMethods._registrarEventos);
    atualizarHistoricoSpy = jest.spyOn(Jogo.prototype, 'atualizarInterfaceHistorico').mockImplementation(mockInternalMethods.atualizarInterfaceHistorico);
    proximoTurnoSpy = jest.spyOn(Jogo.prototype, 'proximoTurno').mockImplementation(mockInternalMethods.proximoTurno);
    tentarMoverPecaSpy = jest.spyOn(Jogo.prototype, '_tentarMoverPeca').mockImplementation(mockInternalMethods._tentarMoverPeca);

    jogo = new Jogo(jogadorBrancas, jogadorPretas);
});

afterEach(() => {
    // Restaura todos os spies após cada teste, garantindo isolamento
    registrarEventosSpy.mockRestore();
    atualizarHistoricoSpy.mockRestore();
    proximoTurnoSpy.mockRestore();
    tentarMoverPecaSpy.mockRestore();
});

// ----------------------------------------------------
// 4. Testes do Jogo.js
// ----------------------------------------------------
describe('Jogo', () => {

    // ===============================================
    // Constructor (Cobre Linhas: 9-27)
    // ===============================================
    describe('constructor', () => {
        test('Deve inicializar o tabuleiro, movimento e todas as propriedades padrão', () => {
            // ✅ CORREÇÃO AQUI: Agora a referência deve ser a mesma.
            // Se ainda falhar com .toBe(), mude para .toEqual()
            expect(jogo.tabuleiro).toBe(mockTabuleiro);
            expect(jogo.movimento).toBe(mockMovimento);
            expect(jogo.jogadorAtual).toBe(jogadorBrancas);
            expect(jogo.vezDo).toBe('white');

            expect(jogo.clicou).toBe(0);
            expect(jogo.historicoDeJogadas).toEqual([]);
            expect(jogo.gameOver).toBe(false);
            expect(jogo.whiteKingMoved).toBe(false);
            expect(jogo.blackRooksMoved).toEqual({ a8: false, h8: false });
            expect(jogo.enPassantTarget).toBeNull();
        });
    });

    // ===============================================
    // iniciar() (Cobre Linhas: 29-34)
    // ===============================================
    describe('iniciar()', () => {
        test('Deve chamar inicar() do tabuleiro, registrar eventos, atualizar histórico e iniciar o primeiro turno', () => {
            proximoTurnoSpy.mockRestore();
            const spy = jest.spyOn(jogo, 'proximoTurno').mockImplementation(() => { });

            jogo.iniciar();

            // ✅ Estas chamadas agora funcionarão
            expect(jogo.tabuleiro.inicar).toHaveBeenCalledTimes(1);
            expect(registrarEventosSpy).toHaveBeenCalledTimes(1);
            expect(atualizarHistoricoSpy).toHaveBeenCalledTimes(1);
            expect(spy).toHaveBeenCalledTimes(1);

            spy.mockRestore();
        });
    });

    // ===============================================
    // proximoTurno() (Cobre Linhas: 36-58, incluindo a lógica da IA)
    // ===============================================
    describe('proximoTurno() - Lógica da IA', () => {

        test('Se for a vez da IA, deve chamar fazerMovimento e _tentarMoverPeca', async () => {
            const jogadorIA = new MockJogadorIA('white');
            jogadorIA.fazerMovimento.mockResolvedValue({ peca: 'mockPeca', casaOrigem: 'e2', casaDestino: 'e4' });

            jogo = new Jogo(jogadorIA, jogadorPretas);
            jogo.gameOver = false;
            proximoTurnoSpy.mockRestore();

            await jogo.proximoTurno();

            expect(jogadorIA.fazerMovimento).toHaveBeenCalledWith(jogo);

            // ✅ Estas chamadas agora funcionarão com o mock do $ corrigido
            expect(mockJQueryElement.addClass).toHaveBeenCalledWith('ia-thinking');
            expect(mockJQueryElement.removeClass).toHaveBeenCalledWith('ia-thinking');

            expect(jogo.pecaEscolhida).toBe('mockPeca');
            expect(jogo.ultimaCasa).toBe('e2');

            expect(global.$).toHaveBeenCalledWith('#e4');
            expect(tentarMoverPecaSpy).toHaveBeenCalledTimes(1);
        });

        test('Se a IA falhar em retornar um movimento, deve remover o indicador de thinking e dar console.error', async () => {
            const jogadorIA = new MockJogadorIA('white');
            jogadorIA.fazerMovimento.mockResolvedValue(null);

            jogo = new Jogo(jogadorIA, jogadorPretas);
            jogo.gameOver = false;

            const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => { });
            proximoTurnoSpy.mockRestore();

            await jogo.proximoTurno();

            expect(mockJQueryElement.addClass).toHaveBeenCalledWith('ia-thinking');
            expect(mockJQueryElement.removeClass).toHaveBeenCalledWith('ia-thinking');
            expect(tentarMoverPecaSpy).not.toHaveBeenCalled();

            expect(consoleErrorSpy).toHaveBeenCalledWith("A IA falhou em retornar um movimento.");

            consoleErrorSpy.mockRestore();
        });

        test('Se o jogo for gameOver, não deve fazer nada', async () => {
            const jogadorIA = new MockJogadorIA('white');
            jogo = new Jogo(jogadorIA, jogadorPretas);
            jogo.gameOver = true;

            proximoTurnoSpy.mockRestore();

            await jogo.proximoTurno();

            expect(jogadorIA.fazerMovimento).not.toHaveBeenCalled();
            expect(mockJQueryElement.addClass).not.toHaveBeenCalled();
        });

        test('Se for a vez do Humano, deve retornar imediatamente', async () => {
            jogo.gameOver = false;
            jogo.jogadorAtual.tipo = 'Humano';

            proximoTurnoSpy.mockRestore();

            await jogo.proximoTurno();

            expect(mockJQueryElement.addClass).not.toHaveBeenCalled();
            expect(tentarMoverPecaSpy).not.toHaveBeenCalled();
        });
    });

    // ===============================================
    // _mostrarToast() (Cobre Linhas: 60-72)
    // ===============================================
    describe('_mostrarToast()', () => {
        test('Deve chamar Swal.fire com as configurações corretas para tipo "info"', () => {
            jogo._mostrarToast('Teste de Informação');

            expect(Swal.fire).toHaveBeenCalledTimes(1);
            expect(Swal.fire).toHaveBeenCalledWith({
                text: 'Teste de Informação',
                icon: 'info',
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 2500,
                timerProgressBar: true
            });
        });

        test('Deve usar o tipo "error" se especificado', () => {
            jogo._mostrarToast('Teste de Erro', 'error');

            expect(Swal.fire).toHaveBeenCalledTimes(1);
            expect(Swal.fire).toHaveBeenCalledWith(
                expect.objectContaining({ icon: 'error' })
            );
        });
    });
});
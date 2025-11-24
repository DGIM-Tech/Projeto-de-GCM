/**
 * @jest-environment jsdom
 */

import $ from 'jquery';
import { Tabuleiro } from '../js/classes/Tabuleiro'; // ajuste o caminho do arquivo

describe('Classe Tabuleiro', () => {
    let tabuleiro;

    beforeEach(() => {
        // Simula o container do tabuleiro no DOM
        document.body.innerHTML = '<div class="board"></div>';
        tabuleiro = new Tabuleiro();
    });

    test('posicaoValida deve retornar true para posições válidas', () => {
        expect(tabuleiro.posicaoValida('a1')).toBe(true);
        expect(tabuleiro.posicaoValida('h8')).toBe(true);
        expect(tabuleiro.posicaoValida('e4')).toBe(true);
    });

    test('posicaoValida deve retornar false para posições inválidas', () => {
        expect(tabuleiro.posicaoValida('i9')).toBe(false);
        expect(tabuleiro.posicaoValida('a0')).toBe(false);
        expect(tabuleiro.posicaoValida('')).toBe(false);
        expect(tabuleiro.posicaoValida('a')).toBe(false);
        expect(tabuleiro.posicaoValida(null)).toBe(false);
    });

    test('printBoard deve criar 64 casas com id correto e cores alternadas', () => {
        tabuleiro.printBoard();
        const squares = $('.square-board');
        expect(squares.length).toBe(64);

        // Verifica primeira e última casa
        expect($('#a8').length).toBe(1);
        expect($('#h1').length).toBe(1);
        expect($('#a8').hasClass('light') || $('#a8').hasClass('dark')).toBe(true);
    });

    test('inicializarPecas deve colocar peças corretas nas posições iniciais', () => {
        tabuleiro.printBoard();
        tabuleiro.inicializarPecas();

        // Verifica peças brancas e pretas
        expect($('#a2 .piece').hasClass('pawn-white')).toBe(true);
        expect($('#e8 .piece').hasClass('king-black')).toBe(true);
    });

    test('inicar deve imprimir tabuleiro e inicializar peças', () => {
        tabuleiro.inicar();
        expect($('.square-board').length).toBe(64);
        expect($('#d1 .piece').hasClass('queen-white')).toBe(true);
        expect($('#g8 .piece').hasClass('knight-black')).toBe(true);
    });

    test('getTabuleiroAtual deve retornar objeto com todas as peças', () => {
        tabuleiro.inicar();
        const atual = tabuleiro.getTabuleiroAtual();

        expect(atual['a2']).toEqual({ tipo: 'pawn', cor: 'white', posicaoValida: true });
        expect(atual['e8']).toEqual({ tipo: 'king', cor: 'black', posicaoValida: true });
        expect(Object.keys(atual).length).toBe(32); // 16 peças brancas + 16 pretas
    });
});

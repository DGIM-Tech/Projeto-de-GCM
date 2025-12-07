/**
 * @jest-environment jsdom
 */
import { Jogo } from '../js/classes/Jogo.js';
import $ from 'jquery';

// Mock Swal (modal/alert)
jest.mock('sweetalert2', () => ({
    fire: jest.fn(() => Promise.resolve({ isConfirmed: true }))
}));

beforeEach(() => {
    document.body.innerHTML = `
        <div class="board"></div>
        <div class="stats"><div class="notation"></div></div>
        <div class="capturadas-brancas"></div>
        <div class="capturadas-pretas"></div>
        <div id="promotionModal" style="display:none;">
            <button class="promote" data-piece="queen"></button>
        </div>
    `;
});
test('Deve permitir que um peão branco avance uma casa', () => {
    const jogador1 = { nome: 'Jogador1', tipo: 'Humano', cor: 'white' };
    const jogador2 = { nome: 'Jogador2', tipo: 'Humano', cor: 'black' };
    const jogo = new Jogo(jogador1, jogador2);

    jogo.iniciar();

    // Seleciona um peão em e2
    const peca = $('<div class="piece pawn-white"></div>');
    $('#e2').html(peca);

    jogo.pecaEscolhida = peca;
    jogo.ultimaCasa = 'e2';
    jogo.clicou = 1;

    const destino = $('<div class="square-board" id="e3"></div>');
    $('body').append(destino);

    jogo._tentarMoverPeca($('#e3'));

    expect($('#e3').find('.piece').length).toBe(1);
    expect($('#e2').find('.piece').length).toBe(0);
});


test('Deve capturar uma peça adversária', () => {
    const jogador1 = { nome: 'Jogador1', tipo: 'Humano', cor: 'white' };
    const jogador2 = { nome: 'Jogador2', tipo: 'Humano', cor: 'black' };
    const jogo = new Jogo(jogador1, jogador2);

    jogo.iniciar();

    $('#e2').html('<div class="piece pawn-white"></div>');
    $('#e3').html('<div class="piece pawn-black"></div>');

    jogo.pecaEscolhida = $('#e2 .piece');
    jogo.ultimaCasa = 'e2';
    jogo.clicou = 1;

    jogo._tentarMoverPeca($('#e3'));

    expect($('#e3 .piece').hasClass('pawn-white')).toBe(true);
    expect($('.capturadas-pretas').children().length).toBe(1);
});


test('Deve executar roque pequeno para rei branco', () => {
    const jogador1 = { nome: 'Jogador1', tipo: 'Humano', cor: 'white' };
    const jogador2 = { nome: 'Jogador2', tipo: 'Humano', cor: 'black' };
    const jogo = new Jogo(jogador1, jogador2);

    $('#e1').html('<div class="piece king-white"></div>');
    $('#h1').html('<div class="piece rook-white"></div>');

    jogo.vezDo = 'white';
    const infoRoque = jogo._tratarRoque($('#e1 .piece'), 'e1', 'g1');

    expect(infoRoque.isRoquePequeno).toBe(true);
    expect($('#f1 .piece').hasClass('rook-white')).toBe(true);
});


test('Deve executar roque pequeno para rei branco', () => {
    const jogador1 = { nome: 'Jogador1', tipo: 'Humano', cor: 'white' };
    const jogador2 = { nome: 'Jogador2', tipo: 'Humano', cor: 'black' };
    const jogo = new Jogo(jogador1, jogador2);

    $('#e1').html('<div class="piece king-white"></div>');
    $('#h1').html('<div class="piece rook-white"></div>');

    jogo.vezDo = 'white';
    const infoRoque = jogo._tratarRoque($('#e1 .piece'), 'e1', 'g1');

    expect(infoRoque.isRoquePequeno).toBe(true);
    expect($('#f1 .piece').hasClass('rook-white')).toBe(true);
});


// test('Deve registrar jogadas corretamente', () => {
//     const jogador1 = { nome: 'Jogador1', tipo: 'Humano', cor: 'white' };
//     const jogador2 = { nome: 'Jogador2', tipo: 'Humano', cor: 'black' };
//     const jogo = new Jogo(jogador1, jogador2);

//     $('#e2').html('<div class="piece pawn-white"></div>');
//     jogo.pecaEscolhida = $('#e2 .piece');
//     jogo.ultimaCasa = 'e2';
//     jogo.clicou = 1;

//     $('#e3').html('<div class="square-board" id="e3"></div>');

//     jogo._tentarMoverPeca($('#e3'));
//     expect(jogo.historicoDeJogadas.length).toBe(1);
//     expect(jogo.historicoDeJogadas[0].descricao).toContain('e2 → e3');
// });

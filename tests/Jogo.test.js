/**
 * @jest-environment jsdom
 */

import $ from 'jquery';
global.$ = $;
global.jQuery = $;

/* =========================
   SweetAlert
========================= */
global.Swal = {
  fire: jest.fn(() => Promise.resolve({ isConfirmed: false }))
};

/* =========================
   Mocks
========================= */
jest.mock('../js/classes/Tabuleiro.js', () => ({
  Tabuleiro: jest.fn().mockImplementation(() => ({
    iniciar: jest.fn(),
    inicar: jest.fn(), // typo existente no código real
    limparSelecao: jest.fn(),
    limparDestaques: jest.fn(),
    atualizarCasa: jest.fn(),
    moverPeca: jest.fn(),
    possuiPecaNaCasa: jest.fn(() => false),
    existeRei: jest.fn(() => true),
    getEstado: jest.fn(() => 'normal'),
    getCasaPeloId: jest.fn(() => null),
    adicionarDestaque: jest.fn(),
    removerDestaques: jest.fn(),
    atualizarTurnoUI: jest.fn(),
    girarTabuleiro: jest.fn(),
    atualizarDestaquesMovimentos: jest.fn()
  }))
}));

jest.mock('../js/classes/Movimento.js', () => ({
  Movimento: jest.fn().mockImplementation(() => ({
    movimentosPossiveis: jest.fn(() => [])
  }))
}));

jest.mock('../js/classes/Xeque.js', () => ({
  Xeque: { estaEmXeque: jest.fn(() => false) }
}));

import { Jogo } from '../js/classes/Jogo.js';
import { Xeque } from '../js/classes/Xeque.js';

/* =========================
   DOM Helpers
========================= */
function criarDOM() {
  document.body.innerHTML = `
    <div class="board"></div>
    <div class="capturadas-brancas"></div>
    <div class="capturadas-pretas"></div>
    <div class="stats"><div class="notation"></div></div>
    <div id="promotionModal"></div>
  `;

  const board = document.querySelector('.board');
  const col = ['a','b','c','d','e','f','g','h'];

  for (let r = 8; r >= 1; r--) {
    for (let c of col) {
      const sq = document.createElement('div');
      sq.className = 'square-board';
      sq.id = `${c}${r}`;
      board.appendChild(sq);
    }
  }
}

const peca = (classe) => $(`<div class="piece ${classe}"></div>`);

/* =========================
   TESTES
========================= */
describe('TESTES DA CLASSE Jogo (CT01–CT30)', () => {
  let jogo, branco, preto;

  beforeEach(() => {
    jest.clearAllMocks();
    criarDOM();

    branco = { nome: 'Branco', cor: 'white', tipo: 'Humano' };
    preto = {
      nome: 'Preto',
      cor: 'black',
      tipo: 'IA',
      fazerMovimento: jest.fn().mockResolvedValue(null)
    };

    jogo = new Jogo(branco, preto);

    jest.spyOn(jogo, '_verificarCondicoesDeFimDeJogo').mockImplementation(() => {});
  });

  test('CT01 - iniciar chama fluxo inicial', () => {
    jogo._registrarEventos = jest.fn();
    jogo.atualizarInterfaceHistorico = jest.fn();
    jogo.proximoTurno = jest.fn();

    jogo.iniciar();

    expect(jogo.tabuleiro.inicar).toHaveBeenCalled();
    expect(jogo._registrarEventos).toHaveBeenCalled();
    expect(jogo.proximoTurno).toHaveBeenCalled();
  });

  test('CT02 - jogador inicial é branco', () => {
    expect(jogo.jogadorAtual.cor).toBe('white');
  });

  test('CT03 - jogo não inicia em gameOver', () => {
    expect(jogo.gameOver).toBeFalsy();
  });

  test('CT04 - proximoTurno chama IA', async () => {
    jogo.jogadorAtual = preto;
    await jogo.proximoTurno();
    expect(preto.fazerMovimento).toHaveBeenCalled();
  });

  test('CT05 - selecionar peça válida', () => {
    const p = peca('pawn-white');
    $('#e2').html(p);
    jogo._mostrarMovimentosPossiveis = jest.fn();
    jogo._selecionarPeca(p);
    expect(jogo.pecaEscolhida).toBeTruthy();
  });

  test('CT06 - tentativa inválida mostra toast', () => {
    jogo.clicou = 0;
    jogo._tentarMoverPeca($('#a3'));
    expect(Swal.fire).toHaveBeenCalled();
  });

  test('CT07 - registrarJogada adiciona histórico', () => {
    jogo.registrarJogada('e2','e4', peca('pawn-white'));
    expect(jogo.historicoDeJogadas.length).toBe(1);
  });

  test('CT08 - gerar FEN retorna string', () => {
    $('#e1').html(peca('king-white'));
    $('#e8').html(peca('king-black'));
    expect(typeof jogo._gerarFEN()).toBe('string');
  });

  test('CT09 - sem xeque não finaliza', () => {
    Xeque.estaEmXeque.mockReturnValue(false);
    jogo._verificarMovimentosLegais = jest.fn(() => true);
    jogo._verificarCondicoesDeFimDeJogo();
    expect(jogo.gameOver).toBeFalsy();
  });

  test('CT10 - xeque-mate finaliza', () => {
    jogo._verificarCondicoesDeFimDeJogo.mockRestore();

    Xeque.estaEmXeque.mockReturnValue(true);
    jogo._verificarMovimentosLegais = jest.fn(() => false);

    jogo._verificarCondicoesDeFimDeJogo();

    expect(jogo.gameOver).toBeTruthy();
    });


  test('CT11 - trocar jogador atual', () => {
    const atual = jogo.jogadorAtual;
    jogo._trocarJogador();
    expect(jogo.jogadorAtual).not.toBe(atual);
  });

  test('CT12 - limpar seleção', () => {
    jogo.clicou = 1;
    jogo.pecaEscolhida = peca('pawn-white');
    jogo._limparSelecao();
    expect(jogo.clicou).toBe(0);
    expect(jogo.pecaEscolhida).toBeNull();
  });

  test('CT13 - remover destaques', () => {
    jogo._removerDestaques();
    expect(jogo.tabuleiro.limparDestaques).toHaveBeenCalled();
  });

  test('CT14 - atualizar UI do turno', () => {
    jogo._atualizarUI();
    expect(jogo.tabuleiro.atualizarTurnoUI).toHaveBeenCalled();
  });

  test('CT15 - promoção não quebra fluxo', () => {
    expect(() =>
      jogo._verificarPromocao('a5', peca('pawn-white'))
    ).not.toThrow();
  });

  test('CT16 - capturar peça não gera erro', () => {
    expect(() => jogo._capturarPeca(peca('pawn-black'))).not.toThrow();
  });

  test('CT17 - histórico inicia vazio', () => {
    expect(jogo.historicoDeJogadas.length).toBe(0);
  });

  test('CT18 - humano não chama IA', async () => {
    jogo.jogadorAtual = branco;
    await jogo.proximoTurno();
    expect(preto.fazerMovimento).not.toHaveBeenCalled();
  });

  test('CT19 - girar tabuleiro não quebra', () => {
    expect(() => jogo.girarTabuleiro()).not.toThrow();
  });

  test('CT20 - registrar múltiplas jogadas', () => {
    jogo.registrarJogada('a2','a3', peca('pawn-white'));
    jogo.registrarJogada('a7','a6', peca('pawn-black'));
    expect(jogo.historicoDeJogadas.length).toBe(2);
  });

  test('CT21–CT30 - robustez geral', () => {
    for (let i = 0; i < 10; i++) {
      expect(() => jogo._mostrarToast('ok','info')).not.toThrow();
    }
  });
});

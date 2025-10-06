import { Jogo } from './classes/Jogo.js';


// INICIALIZAÇÃO E MODAL 
$(function () {
    // PREPARAÇÃO DO LAYOUT LATERAL
    
    // Injeta o cabeçalho e o contêiner de peças capturadas (no HTML, div.stats)
    $('.stats').append('<div class="capturadas"><h3>Peças Capturadas</h3><div class="capturadas-list"></div></div>');
    
    // 1. Inicializa o Jogo
    const jogo = new Jogo();
    jogo.iniciar();
    $('.board').data('jogo', jogo); 
});

// Handler do Modal de Promoção
$('body').on('click', '#promotionModal .promote', function() {
    let piece = $(this).data('piece'); 
    let squareId = $('#promotionModal').data('square');
    let color = $('#promotionModal').data('color');
    const jogo = $('.board').data('jogo'); 
    
    const ultimaCasa = jogo.ultimaCasa;
    const pecaCapturada = $(`#${squareId}`).find('.piece');
    const pecaAntiga = jogo.pecaEscolhida;

    // Gera notação de promoção
    const notacaoPromocao = jogo.gerarNotacaoAlgébrica(
        ultimaCasa,
        squareId,
        pecaAntiga,
        pecaCapturada,
        false, 
        false, 
        piece
    );
    
    // Atualiza a peça no tabuleiro
    $('#' + squareId).html(`<div class="piece ${piece}-${color}"></div>`);

    // Registra a jogada (inclui a promoção)
    jogo.registrarJogada(notacaoPromocao);
    
    // Troca a vez
    jogo.vezDo = (jogo.vezDo === 'white') ? 'black' : 'white';
    jogo.clicou = 0;

    $('#promotionModal').hide();
});

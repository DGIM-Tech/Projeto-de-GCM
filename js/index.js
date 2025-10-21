// js/index.js

import { Jogo } from './classes/Jogo.js';
import { Jogador } from './classes/Jogador.js';
import { JogadorIA } from './classes/JogadorIA.js';

let jogoAtual = null;
let ultimaConfiguracao = {};

/**
 * Inicia uma nova partida.
 */
function iniciarNovaPartida(modo, opcoes = {}) {
    console.log(`🚀 Iniciando novo jogo no modo: ${modo}`, opcoes);
    ultimaConfiguracao = { modo, opcoes };

    $('.board').empty();
    $('.stats .capturadas .capturadas-list').empty();
    $('.stats .notation').empty();

    let jogador1, jogador2;

    if (modo === 'amigo') {
        jogador1 = new Jogador('Jogador 1', 'brancas');
        jogador2 = new Jogador('Jogador 2', 'pretas');
    } 
    else if (modo === 'computador') {
        const { nivelDificuldade, corJogador } = opcoes;
        
        if (corJogador === 'brancas') {
            jogador1 = new Jogador('Você', 'brancas');
            jogador2 = new JogadorIA('pretas', nivelDificuldade);
        } else {
            jogador1 = new JogadorIA('brancas', nivelDificuldade);
            jogador2 = new Jogador('Você', 'pretas');
        }
    }

    jogoAtual = new Jogo(jogador1, jogador2);
    $('.board').data('jogo', jogoAtual);
    jogoAtual.iniciar();
}

/**
 * Reinicia a partida com a última configuração.
 */
function reiniciarPartida() {
    console.log("🔄 Reiniciando partida...");
    if (ultimaConfiguracao.modo) {
        iniciarNovaPartida(ultimaConfiguracao.modo, ultimaConfiguracao.opcoes);
    } else {
        Swal.fire('Atenção', 'Você precisa iniciar uma partida antes de poder reiniciar!', 'warning');
    }
}

/**
 * Volta para a tela de menu inicial.
 */
function voltarParaInicio() {
    document.getElementById('modalDesistir').style.display = 'none';
    document.getElementById('modalEmpate').style.display = 'none';
    document.querySelector('.box').classList.remove('ativo');
    document.querySelector('.controles').classList.remove('ativo');
    document.getElementById('telaInicial').style.display = 'flex';
}
window.voltarParaInicio = voltarParaInicio;


// --- LÓGICA DA INTERFACE ---

document.addEventListener('DOMContentLoaded', () => {
    
    const telaInicial = document.getElementById('telaInicial');
    const box = document.querySelector('.box');
    const controles = document.querySelector('.controles');

    function mostrarInterfaceJogo() {
        telaInicial.style.display = 'none';
        box.classList.add('ativo');
        controles.classList.add('ativo');
    }

    // --- BOTÃO 'JOGAR CONTRA UM AMIGO' (Continua igual, está correto) ---
    document.getElementById('btnAmigo').addEventListener('click', () => {
        mostrarInterfaceJogo();
        iniciarNovaPartida('amigo');
    });

    // --- BOTÃO 'JOGAR CONTRA O COMPUTADOR' (LÓGICA CORRIGIDA) ---
    document.getElementById('btnComputador').addEventListener('click', () => {
        // 1. ESCONDE O MENU IMEDIATAMENTE PARA EVITAR O BUG.
        telaInicial.style.display = 'none';

        // 2. Mostra o menu de configuração da partida.
        Swal.fire({
            title: '<strong>Configurar Partida</strong>',
            icon: 'info',
            html: `
                <h3>Dificuldade da IA:</h3>
                <label><input type="radio" name="dificuldade" value="iniciante"> 👶 Iniciante</label>
                <label><input type="radio" name="dificuldade" value="fácil"> 🙂 Fácil</label>
                <label><input type="radio" name="dificuldade" value="médio" checked> 🤔 Médio</label>
                <label><input type="radio" name="dificuldade" value="difícil"> 😈 Difícil</label>

                <h3>Escolha sua cor:</h3>
                <label><input type="radio" name="cor" value="brancas" checked> ⚪ Brancas (Você começa)</label>
                <label><input type="radio" name="cor" value="pretas"> ⚫ Pretas</label>
            `,
            showCloseButton: true,
            showCancelButton: true,
            focusConfirm: false,
            confirmButtonText: '▶️ Jogar!',
            cancelButtonText: 'Cancelar',
            preConfirm: () => {
                return {
                    dificuldade: document.querySelector('input[name="dificuldade"]:checked').value,
                    corJogador: document.querySelector('input[name="cor"]:checked').value
                }
            }
        }).then((result) => {
            // 3. Este código só roda DEPOIS que o usuário interage com o menu.
            if (result.isConfirmed) {
                // Se o usuário clicou "Jogar!":
                const { dificuldade, corJogador } = result.value;
                // A tela inicial já está escondida, só precisamos mostrar o tabuleiro.
                box.classList.add('ativo');
                controles.classList.add('ativo');
                // Inicia o jogo no modo correto com as opções escolhidas.
                iniciarNovaPartida('computador', { 
                    nivelDificuldade: dificuldade, 
                    corJogador: corJogador 
                });
            } else {
                // Se o usuário clicou "Cancelar" ou fechou a janela,
                // mostramos o menu inicial de novo.
                telaInicial.style.display = 'flex';
            }
        });
    });

    // --- BOTÕES DE CONTROLE DO JOGO ---
    document.getElementById('btnDesistir').addEventListener('click', () => {
        document.getElementById('modalDesistir').style.display = 'flex';
    });
    document.getElementById('btnEmpate').addEventListener('click', () => {
        document.getElementById('modalEmpate').style.display = 'flex';
    });
    document.getElementById('btnReiniciar').addEventListener('click', () => {
        reiniciarPartida();
    });

    // --- CÓDIGO JQUERY (sem alterações) ---
    $(function () {
        $('.stats .capturadas').append('<h3>Peças Capturadas</h3><div class="capturadas-list"></div>');
    });

    $('body').on('click', '#promotionModal .promote', function() {
        const jogo = $('.board').data('jogo');
        if (!jogo) return;

        let piece = $(this).data('piece'); 
        let squareId = $('#promotionModal').data('square');
        let color = $('#promotionModal').data('color');
        
        jogo.promoverPeao(squareId, piece, color);
        
        $('#promotionModal').hide();
    });
});
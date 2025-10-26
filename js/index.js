// js/index.js

import { Jogo } from './classes/Jogo.js';
import { Jogador } from './classes/Jogador.js';
import { JogadorIA } from './classes/JogadorIA.js';
import { Promocao } from './classes/Promocao.js';

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
    window.jogoAtual = jogoAtual; // Torna global para acesso fácil
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

    // --- BOTÃO 'JOGAR CONTRA UM AMIGO' ---
    document.getElementById('btnAmigo').addEventListener('click', () => {
        mostrarInterfaceJogo();
        iniciarNovaPartida('amigo');
    });

    // --- BOTÃO 'JOGAR CONTRA O COMPUTADOR' ---
    document.getElementById('btnComputador').addEventListener('click', () => {
        telaInicial.style.display = 'none';

        Swal.fire({
            title: '<strong>Configurar Partida</strong>',
            icon: 'info',
            html: `
                <h3>Dificuldade da IA:</h3>
                <label><input type="radio" name="dificuldade" value="iniciante" checked> 👶 Iniciante</label>
                <label><input type="radio" name="dificuldade" value="fácil"> 🙂 Fácil</label>
                <label><input type="radio" name="dificuldade" value="médio" > 🤔 Médio</label>
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
            if (result.isConfirmed) {
                const { dificuldade, corJogador } = result.value;
                box.classList.add('ativo');
                controles.classList.add('ativo');
                iniciarNovaPartida('computador', {
                    nivelDificuldade: dificuldade,
                    corJogador: corJogador
                });
            } else {
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

    // --- CÓDIGO DO MODAL DE PROMOÇÃO CORRIGIDO ---
    $(document).on('click', '#promotionModal .promote', function () {

        // 1. Verifica se o jogo existe e se está esperando uma promoção
        if (!window.jogoAtual || !window.jogoAtual.movimentoPendente) {
            console.error("Erro: jogoAtual ou movimentoPendente não definido");
            $('#promotionModal').hide();
            return;
        }

        // 2. Pega a peça escolhida (ex: "queen", "rook")
        const novoTipoPeca = $(this).data('piece');

        // 3. Esconde o modal
        $('#promotionModal').hide();

        // 4. CHAMA A LÓGICA DE CONCLUSÃO (Parte 3)
        window.jogoAtual.promocaoConcluida(novoTipoPeca);
    });

    // Inicialização do jQuery
    $(function () {
        $('.stats .capturadas').append('<h3>Peças Capturadas</h3><div class="capturadas-list"></div>');
    });
});
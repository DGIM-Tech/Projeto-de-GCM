// js/index.js
import { Jogo } from './classes/Jogo.js';
import { Jogador } from './classes/Jogador.js';
import { JogadorIA } from './classes/JogadorIA.js';

let jogoAtual = null;
let ultimaConfiguracao = {};

/** Inicia nova partida */
function iniciarNovaPartida(modo, opcoes = {}) {
    $('.board').empty();
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
    else if (modo === 'restaurar' && opcoes.estado) {
        jogoAtual = new Jogo();
        jogoAtual.carregarEstado(opcoes.estado);
        return;
    }

    jogoAtual = new Jogo(jogador1, jogador2);
    window.jogoAtual = jogoAtual;
    $('.board').data('jogo', jogoAtual);
    jogoAtual.iniciar();

    ultimaConfiguracao = { modo, opcoes };
}

/** Reinicia a partida */
function reiniciarPartida() {
    if (ultimaConfiguracao.modo) {
        iniciarNovaPartida(ultimaConfiguracao.modo, ultimaConfiguracao.opcoes);
    } else {
        Swal.fire('Atenção', 'Nenhum jogo para reiniciar!', 'warning');
    }
}

/** Reinicia automaticamente ao desistir ou empatar */
function finalizarPartida(mensagem) {
    Swal.fire({
        title: mensagem,
        text: "A partida será reiniciada automaticamente.",
        icon: "info",
        confirmButtonText: "Ok"
    }).then(() => {
        localStorage.removeItem('estadoJogo');
        reiniciarPartida();
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const telaInicial = document.getElementById('telaInicial');
    const box = document.querySelector('.box');
    const controles = document.querySelector('.controles');

    function mostrarInterfaceJogo() {
        telaInicial.style.display = 'none';
        box.classList.add('ativo');
        controles.classList.add('ativo');
    }

    // 🔹 Verifica jogo salvo no cache
    const estadoSalvo = localStorage.getItem('estadoJogo');
    if (estadoSalvo) {
        try {
            const dados = JSON.parse(estadoSalvo);
            if (dados && dados.tabuleiro) {
                Swal.fire({
                    title: 'Continuar jogo anterior?',
                    text: 'Deseja retomar o jogo salvo?',
                    icon: 'question',
                    showCancelButton: true,
                    confirmButtonText: 'Sim',
                    cancelButtonText: 'Novo jogo'
                }).then((result) => {
                    if (result.isConfirmed) {
                        mostrarInterfaceJogo();
                        iniciarNovaPartida('restaurar', { estado: dados });
                    } else {
                        localStorage.removeItem('estadoJogo');
                        telaInicial.style.display = 'flex';
                    }
                });
            }
        } catch {
            localStorage.removeItem('estadoJogo');
        }
    }

    // --- Botões iniciais ---
    document.getElementById('btnAmigo').addEventListener('click', () => {
        mostrarInterfaceJogo();
        iniciarNovaPartida('amigo');
    });

    document.getElementById('btnComputador').addEventListener('click', () => {
        telaInicial.style.display = 'none';
        Swal.fire({
            title: '<strong>Configurar Partida</strong>',
            icon: 'info',
            html: `
                <h3>Dificuldade da IA:</h3>
                <label><input type="radio" name="dificuldade" value="iniciante" checked> 👶 Iniciante</label>
                <label><input type="radio" name="dificuldade" value="fácil"> 🙂 Fácil</label>
                <label><input type="radio" name="dificuldade" value="médio"> 🤔 Médio</label>
                <label><input type="radio" name="dificuldade" value="difícil"> 😈 Difícil</label>
                <h3>Escolha sua cor:</h3>
                <label><input type="radio" name="cor" value="brancas" checked> ⚪ Brancas</label>
                <label><input type="radio" name="cor" value="pretas"> ⚫ Pretas</label>
            `,
            showCancelButton: true,
            confirmButtonText: '▶️ Jogar!',
            cancelButtonText: 'Cancelar',
            preConfirm: () => ({
                dificuldade: document.querySelector('input[name="dificuldade"]:checked').value,
                corJogador: document.querySelector('input[name="cor"]:checked').value
            })
        }).then((result) => {
            if (result.isConfirmed) {
                mostrarInterfaceJogo();
                iniciarNovaPartida('computador', {
                    nivelDificuldade: result.value.dificuldade,
                    corJogador: result.value.corJogador
                });
            } else {
                telaInicial.style.display = 'flex';
            }
        });
    });

    // --- Botões de controle ---
    document.getElementById('btnDesistir').addEventListener('click', () => {
        finalizarPartida('Você desistiu da partida.');
    });
    document.getElementById('btnEmpate').addEventListener('click', () => {
        finalizarPartida('A partida terminou em empate.');
    });
    document.getElementById('btnReiniciar').addEventListener('click', () => {
        reiniciarPartida();
    });
});
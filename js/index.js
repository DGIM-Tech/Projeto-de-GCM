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

    //limpa as peças capturadas
    $('.capturadas-brancas').empty();
    $('.capturadas-pretas').empty();

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
        if (!window.jogoAtual) {
            Swal.fire('Atenção', 'Nenhum jogo em andamento!', 'warning');
            return;
        }

        const desistente = window.jogoAtual.jogadorAtual;
        const corDesistente = desistente.cor.toLowerCase(); // "brancas" ou "pretas"
        const vencedor = (corDesistente === 'brancas') ? 'Pretas' : 'Brancas';

        // Mensagem enxuta e natural
        const mensagem = `As ${corDesistente.charAt(0).toUpperCase() + corDesistente.slice(1)} desistiram da partida. As ${vencedor} venceram!`;

        finalizarPartida(mensagem, "warning");
    });
    document.getElementById('btnEmpate').addEventListener('click', () => {
        if (!window.jogoAtual) {
            Swal.fire('Atenção', 'Nenhum jogo em andamento!', 'warning');
            return;
        }

        Swal.fire({
            title: 'Você aceita o empate?',
            text: 'Se aceitar, a partida será encerrada. Caso contrário, ela continuará normalmente.',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Sim',
            cancelButtonText: 'Não'
        }).then((result) => {
            if (result.isConfirmed) {
                finalizarPartida('A partida terminou em empate.', 'info');
            } else {
                Swal.fire({
                    title: 'Empate recusado',
                    text: 'A partida continuará normalmente.',
                    icon: 'info',
                    timer: 2000,
                    showConfirmButton: false
                });
            }
        });
    });
    document.getElementById('btnVoltarMenu').addEventListener('click', () => {
        Swal.fire({
            title: 'Voltar à tela inicial?',
            text: 'A partida atual será encerrada.',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Sim',
            cancelButtonText: 'Não'
        }).then((result) => {
            if (result.isConfirmed) {
                // Remove qualquer estado de jogo salvo
                localStorage.removeItem('estadoJogo');

                // Esconde o tabuleiro e mostra a tela inicial
                document.querySelector('.box').classList.remove('ativo');
                document.querySelector('.controles').classList.remove('ativo');
                document.getElementById('telaInicial').style.display = 'flex';

                // Limpa o tabuleiro e estatísticas
                $('.board').empty();
                $('.stats .notation').empty();
                $('.capturadas-brancas').empty();
                $('.capturadas-pretas').empty();

                // Reseta a variável de jogo
                window.jogoAtual = null;
            }
        });
    });
});
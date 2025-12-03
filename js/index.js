// js/index.js
import { Jogo } from './classes/Jogo.js';
import { Jogador } from './classes/Jogador.js';
import { JogadorIA } from './classes/JogadorIA.js';
import { Tutorial } from './classes/Tutorial.js';

let jogoAtual = null;
let ultimaConfiguracao = {};

/** Inicia nova partida */
function iniciarNovaPartida(modo, opcoes = {}) {
    // Limpa a interface
    $('.board').empty();
    $('.stats .notation').empty();
    $('.capturadas-brancas').empty();
    $('.capturadas-pretas').empty();

    // --- MODO TUTORIAL ---
    if (modo === 'tutorial') {
        console.log("Iniciando Modo Tutorial...");

        // Cria jogadores fictícios para o motor do jogo funcionar
        const p1 = new Jogador('Aluno', 'brancas');
        const p2 = new Jogador('Professor', 'pretas');
        
        jogoAtual = new Jogo(p1, p2);

        // Configura globais
        window.jogoAtual = jogoAtual;
        $('.board').data('jogo', jogoAtual);
        
        // Desenha o tabuleiro inicial
        jogoAtual.iniciar();

        // Inicia a Classe Tutorial (O roteiro está DENTRO do arquivo Tutorial.js)
        const tutorial = new Tutorial(jogoAtual);
        tutorial.iniciar();

        return; // Sai da função para não carregar lógica de jogo normal
    }

    // --- OUTROS MODOS ---

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

    // Inicia jogo normal
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

// --- EVENTOS DO DOM ---
document.addEventListener('DOMContentLoaded', () => {
    const telaInicial = document.getElementById('telaInicial');
    const box = document.querySelector('.box');
    const controles = document.querySelector('.controles');

    function mostrarInterfaceJogo() {
        telaInicial.style.display = 'none';
        box.classList.add('ativo');
        controles.classList.add('ativo');
    }

    // 1. Botão Amigo
    document.getElementById('btnAmigo').addEventListener('click', () => {
        mostrarInterfaceJogo();
        iniciarNovaPartida('amigo');
    });

    // 2. Botão Computador
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

    // 3. Botão Tutorial (CORRIGIDO)
    document.getElementById('btnTutorial').addEventListener('click', () => {
        mostrarInterfaceJogo();
        iniciarNovaPartida('tutorial');
    });

    // 4. Botões de Controle
    document.getElementById('btnDesistir').addEventListener('click', () => {
        if (!window.jogoAtual) return;
        
        const desistente = window.jogoAtual.jogadorAtual;
        const corDesistente = desistente.cor.toLowerCase();
        const vencedor = (corDesistente === 'brancas') ? 'Pretas' : 'Brancas';
        
        finalizarPartida(`As ${corDesistente} desistiram. ${vencedor} venceram!`);
    });

    document.getElementById('btnEmpate').addEventListener('click', () => {
        if (!window.jogoAtual) return;
        
        Swal.fire({
            title: 'Propor Empate',
            text: 'Aceita o empate?',
            showCancelButton: true,
            confirmButtonText: 'Sim'
        }).then((result) => {
            if (result.isConfirmed) finalizarPartida('Empate acordado.');
        });
    });

    document.getElementById('btnVoltarMenu').addEventListener('click', () => {
        Swal.fire({
            title: 'Voltar ao Menu?',
            text: 'O jogo atual será perdido.',
            showCancelButton: true,
            confirmButtonText: 'Sim'
        }).then((result) => {
            if (result.isConfirmed) {
                localStorage.removeItem('estadoJogo');
                box.classList.remove('ativo');
                controles.classList.remove('ativo');
                telaInicial.style.display = 'flex';
                
                $('.board').empty();
                window.jogoAtual = null;
            }
        });
    });

});
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
            title: '⚙️ Configurar Partida',
            html: `
        <div class="config-modal">

            <div class="config-section">
                <h4>Dificuldade da IA</h4>
                <div class="config-options">
                    <label><input type="radio" name="dificuldade" value="iniciante" checked> Iniciante</label>
                    <label><input type="radio" name="dificuldade" value="fácil">  Fácil</label>
                    <label><input type="radio" name="dificuldade" value="médio">  Médio</label>
                    <label><input type="radio" name="dificuldade" value="difícil">  Difícil</label>
                </div>
            </div>

            <div class="config-section">
                <h4>Escolha sua Cor</h4>
                <div class="config-options">
                    <label><input type="radio" name="cor" value="brancas" checked> ⚪ Brancas</label>
                    <label><input type="radio" name="cor" value="pretas"> ⚫ Pretas</label>
                </div>
            </div>

        </div>
        `,
            width: 420,
            background: "#f7f7f7",
            showCancelButton: true,
            confirmButtonText: '🎮 Jogar!',
            cancelButtonText: '❌ Cancelar',
            confirmButtonColor: "#0E7886",
            cancelButtonColor: "#555",
            borderRadius: "12px",
            allowOutsideClick: false,
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

                // =====================================================
                // 1) DEFINIR A PERSPECTIVA
                // =====================================================
                window.perspectivaPretas = result.value.corJogador === "pretas";

                // =====================================================
                // 2) REDESENHAR O TABULEIRO
                // =====================================================
                if (window.jogo && typeof jogo.printBoard === "function") {
                    jogo.printBoard();
                }

                // =====================================================
                // 3) ATUALIZAR AS LETRAS E NÚMEROS
                // =====================================================
                atualizarLabels();

                // =====================================================
                // 4) ROTAÇÃO DO TABULEIRO (APENAS CSS)
                // =====================================================
                const boardEl = document.querySelector('.board');
                if (result.value.corJogador === "brancas") {
                    boardEl.classList.remove("girarPretas");
                } else {
                    boardEl.classList.add("girarPretas");
                }

                // =====================================================
                // 5) REMOVER QUALQUER ROTAÇÃO NAS PEÇAS (MOBILE)
                // Isso garante que apenas o CSS do tabuleiro controle a rotação
                // =====================================================
                if (window.innerWidth <= 768) {
                    // Remove qualquer transformação inline das peças
                    const pecas = document.querySelectorAll('.piece');
                    pecas.forEach(peca => {
                        peca.style.transform = '';
                    });
                }

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

function atualizarLabels() {
    const letrasNormal = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    const letrasInvertido = [...letrasNormal].reverse();

    const numerosNormal = ['8', '7', '6', '5', '4', '3', '2', '1'];
    const numerosInvertido = [...numerosNormal].reverse();

    // Se o jogador escolheu as pretas:
    // → Pretas ficam embaixo
    // → Letras devem inverter
    // → Números devem inverter
    const usarLetras = window.perspectivaPretas ? letrasInvertido : letrasNormal;
    const usarNumeros = window.perspectivaPretas ? numerosInvertido : numerosNormal;

    // Atualiza as letras superior e inferior
    document.querySelectorAll('.letters-top span')
        .forEach((el, i) => el.textContent = usarLetras[i]);

    document.querySelectorAll('.letters-bottom span')
        .forEach((el, i) => el.textContent = usarLetras[i]);

    // Atualiza os números laterais
    document.querySelectorAll('.numbers-left span')
        .forEach((el, i) => el.textContent = usarNumeros[i]);

    document.querySelectorAll('.numbers-right span')
        .forEach((el, i) => el.textContent = usarNumeros[i]);
}
window.atualizarLabels = atualizarLabels;
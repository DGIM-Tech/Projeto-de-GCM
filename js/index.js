// js/index.js
import { Jogo } from './classes/Jogo.js';
import { Jogador } from './classes/Jogador.js';
import { JogadorIA } from './classes/JogadorIA.js';
import { Tutorial } from './classes/Tutorial.js';

let jogoAtual = null;
let ultimaConfiguracao = {};

/** Inicia nova partida */
function iniciarNovaPartida(modo, opcoes = {}) {
    $('.board').empty();
    $('.stats .notation').empty();
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
    else if (modo === 'tutorial') {
        // No modo tutorial, a IA não deve jogar
        jogador1 = new Jogador('Você', 'brancas');
        jogador2 = new JogadorIA('IA Tutorial', 'iniciante'); // IA fica parada
    }

    jogoAtual = new Jogo(jogador1, jogador2);
    
    if (modo === 'tutorial') {
        jogoAtual.jogadorAtual = jogador1; // Garante que é sempre sua vez
        jogoAtual.trocarTurno = () => {}; // Desativa a troca de turno
    }

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

    // ... (O resto do seu código de carregar jogo salvo, botões de amigo e computador continua igual) ...
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
    
    // 🔹 Botão Tutorial
    document.getElementById('btnTutorial').addEventListener('click', () => {
        iniciarModoTutorial();
    });

    // --- Botões de controle ---
    // ... (Seus botões de Desistir, Empate e Reiniciar continuam iguais) ...
    document.getElementById('btnDesistir').addEventListener('click', () => {
        if (!window.jogoAtual) {
            Swal.fire('Atenção', 'Nenhum jogo em andamento!', 'warning');
            return;
        }
        const desistente = window.jogoAtual.jogadorAtual;
        const corDesistente = desistente.cor.toLowerCase();
        const vencedor = (corDesistente === 'brancas') ? 'Pretas' : 'Brancas';
        const mensagem = `As ${corDesistente.charAt(0).toUpperCase() + corDesistente.slice(1)} desistiram da partida. As ${vencedor} venceram!`;
        finalizarPartida(mensagem);
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
                finalizarPartida('A partida terminou em empate.');
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

    document.getElementById('btnReiniciar').addEventListener('click', () => {
        reiniciarPartida();
    });


    // --- FUNÇÃO TUTORIAL ATUALIZADA ---
    function iniciarModoTutorial() {
        mostrarInterfaceJogo();
        iniciarNovaPartida('tutorial'); // Começa um jogo travado para o tutorial

        const tutorial = new Tutorial(jogoAtual);

        // Lista de passos muito mais completa
        tutorial.passos = [
            // 1. Introdução
            { mensagem: "Bem-vindo ao tutorial de Xadrez! Vamos aprender como cada peça se move. Começaremos com o PEÃO.", acao: null },
            
            // 2. Peão (Pawn)
            { mensagem: "O PEÃO só anda para frente. Na sua primeira jogada, ele pode andar 1 ou 2 casas. Clique no peão da casa 'e2'.", 
              acao: () => tutorial.esperarSelecaoPeca('pawn', 'white') },
            
            { mensagem: "Ótimo! Veja as casas 'e3' e 'e4' destacadas. Mova o peão para 'e4' (2 casas).", 
              acao: () => tutorial.esperarMovimento(['e4']) }, // Usuário move e2->e4
            
            // 3. Cavalo (Knight)
            { mensagem: "Excelente! Agora o CAVALO. Ele se move em 'L' (2 casas em uma direção e 1 para o lado) e pode pular outras peças. Clique no cavalo em 'g1'.", 
              acao: () => tutorial.esperarSelecaoPeca('knight', 'white') },
            
            { mensagem: "Perfeito! Mova o cavalo para 'f3'.", 
              acao: () => tutorial.esperarMovimento(['f3']) }, // Move g1->f3

            // 4. Bispo (Bishop)
            { mensagem: "Agora o BISPO. Ele se move na diagonal, quantas casas quiser, mas não pode pular peças. Clique no bispo em 'f1'.", 
              acao: () => tutorial.esperarSelecaoPeca('bishop', 'white') },
            
            { mensagem: "Note que o peão em 'e2' não está mais lá, então o caminho está livre! Mova o bispo para 'c4'.", 
              acao: () => tutorial.esperarMovimento(['c4']) }, // Move f1->c4

            // 5. Dama (Queen)
            { mensagem: "Esta é a DAMA (ou Rainha), a peça mais poderosa! Ela se move como a TORRE (reto) e o BISPO (diagonal) juntos. Clique na Dama em 'd1'.", 
              acao: () => tutorial.esperarSelecaoPeca('queen', 'white') },
            
            { mensagem: "Veja quantos movimentos! Ela pode ir para 'f3' ou 'g4' ou 'h5' na diagonal. Mova-a para 'h5'.", 
              acao: () => tutorial.esperarMovimento(['f3', 'g4', 'h5', 'e2', 'd2', 'd3']) }, // Permite vários movimentos legais

            // 6. Rei (King)
            { mensagem: "Este é o REI, a peça mais importante. Ele só pode andar 1 casa em qualquer direção. Clique no Rei em 'e1'.", 
              acao: () => tutorial.esperarSelecaoPeca('king', 'white') },
            
            { mensagem: "O Rei está um pouco preso agora, pois suas peças estão no caminho. Mova-o para 'e2'.", 
              acao: () => tutorial.esperarMovimento(['e2']) }, // Move e1->e2

            // 7. Torre (Rook)
            { mensagem: "Finalmente, a TORRE. Ela anda reto (horizontal ou vertical), quantas casas quiser. A torre em 'h1' está presa, mas a torre em 'a1' não. Clique nela.", 
              acao: () => tutorial.esperarSelecaoPeca('rook', 'white') },
            
            { mensagem: "O caminho está bloqueado pelo peão 'a2'. Teremos que mover o peão 'a2' primeiro. Clique no peão 'a2'.",
              acao: () => tutorial.esperarSelecaoPeca('pawn', 'white') },

            { mensagem: "Mova o peão 'a2' para 'a3' para abrir caminho para a torre.",
              acao: () => tutorial.esperarMovimento(['a3', 'a4']) },
            
            { mensagem: "Agora sim! Clique na torre em 'a1' novamente.",
              acao: () => tutorial.esperarSelecaoPeca('rook', 'white') },

            { mensagem: "Veja, agora ela pode se mover! Mova a torre para 'a2'.",
              acao: () => tutorial.esperarMovimento(['a2']) },

            // 8. Conclusão
            { mensagem: "O objetivo do jogo é atacar o Rei do oponente ('XEQUE') de forma que ele não possa escapar ('XEQUE-MATE').", 
              acao: null },
            { mensagem: "Você aprendeu o básico de todas as peças! O resto é prática e estratégia. Bom jogo!", 
              acao: null }
        ];

        tutorial.iniciar();
    }
});
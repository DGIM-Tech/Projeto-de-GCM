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
        jogoAtual.trocarTurno = () => { }; // Desativa a troca de turno
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


// --- FUNÇÃO TUTORIAL ATUALIZADA E APRIMORADA ---
function iniciarModoTutorial() {
    mostrarInterfaceJogo();
    iniciarNovaPartida('tutorial'); // Modo tutorial = jogo travado

    const tutorial = new Tutorial(jogoAtual);

    tutorial.passos = [
        // 1. Introdução
        {
            mensagem: "🎓 Bem-vindo ao tutorial de Xadrez! Vamos aprender como cada peça se move. Começaremos com o PEÃO.",
            acao: null
        },

        // 2. Peão (Pawn)
        {
            mensagem: "O PEÃO só anda para frente. Na primeira jogada, ele pode andar 1 ou 2 casas. Clique no peão da casa 'e2'.",
            acao: () => tutorial.esperarSelecaoPeca('pawn', 'white', 'e2')
        },
        {
            mensagem: "Ótimo! Veja as casas 'e3' e 'e4' destacadas. Mova o peão para 'e4' (2 casas).",
            acao: () => tutorial.esperarMovimento(['e4'])
        },

        // 3. Cavalo (Knight)
        {
            mensagem: "Excelente! Agora o CAVALO. Ele se move em 'L' (2 casas em uma direção e 1 para o lado) e pode pular outras peças. Clique no cavalo em 'g1'.",
            acao: () => tutorial.esperarSelecaoPeca('knight', 'white', 'g1')
        },
        {
            mensagem: "Perfeito! Mova o cavalo para 'f3'.",
            acao: () => tutorial.esperarMovimento(['f3'])
        },

        // 4. Bispo (Bishop)
        {
            mensagem: "Agora o BISPO. Ele se move na diagonal, quantas casas quiser, mas não pode pular peças. Clique no bispo em 'f1'.",
            acao: () => tutorial.esperarSelecaoPeca('bishop', 'white', 'f1')
        },
        {
            mensagem: "Note que o peão em 'e2' não está mais lá, então o caminho está livre! Mova o bispo para 'c4'.",
            acao: () => tutorial.esperarMovimento(['c4'])
        },

        // 5. Dama (Queen)
        {
            mensagem: "Esta é a DAMA (ou Rainha), a peça mais poderosa! Ela se move como a TORRE e o BISPO juntos, mas não pode pular outras peças. Clique na Dama em 'd1'.",
            acao: () => tutorial.esperarSelecaoPeca('queen', 'white', 'd1')
        },
        {
            mensagem: "As casas livres são 'e2', 'f3', 'g4' e 'h5'. Mova a Dama para 'h5'.",
            acao: () => tutorial.esperarMovimento(['e2', 'f3', 'g4', 'h5'])
        },

        // 6. Torre (Rook)
        {
            mensagem: "Agora vamos ver a TORRE. Ela anda reto — horizontal ou vertical — quantas casas quiser. Clique na torre em 'a1'.",
            acao: () => tutorial.esperarSelecaoPeca('rook', 'white', 'a1')
        },
        {
            mensagem: "O caminho está bloqueado pelo peão 'a2'. Vamos movê-lo primeiro. Clique no peão 'a2'.",
            acao: () => tutorial.esperarSelecaoPeca('pawn', 'white', 'a2')
        },
        {
            mensagem: "Mova o peão 'a2' para 'a3' para liberar caminho para a torre.",
            acao: () => tutorial.esperarMovimento(['a3', 'a4'])
        },
        {
            mensagem: "Perfeito! Clique na torre em 'a1' novamente.",
            acao: () => tutorial.esperarSelecaoPeca('rook', 'white', 'a1')
        },
        {
            mensagem: "Veja, agora ela pode se mover! Mova a torre para 'a3'.",
            acao: () => tutorial.esperarMovimento(['a3'])
        },

        // 7. Rei (King)
        {
            mensagem: "Agora o REI 👑 — a peça mais importante! Ele só pode andar 1 casa em qualquer direção. Clique no Rei em 'e1'.",
            acao: () => tutorial.esperarSelecaoPeca('king', 'white', 'e1')
        },
        {
            mensagem: "O Rei pode ir para casas vizinhas. Mova-o para 'e2'.",
            acao: () => tutorial.esperarMovimento(['e2'])
        },

        // 8. Roque (Castling)
        {
            mensagem: "Excelente! Existe um movimento especial chamado *Roque*. Ele protege o Rei movendo-o junto com a Torre. Vamos fazer o Roque pequeno.",
            acao: null
        },
        {
            mensagem: "Clique no Rei em 'e1' novamente para iniciar o Roque.",
            acao: () => tutorial.esperarSelecaoPeca('king', 'white', 'e1')
        },
        {
            mensagem: "Agora mova o Rei duas casas para o lado — até 'g1'.",
            acao: () => tutorial.esperarMovimento(['g1'])
        },
        {
            mensagem: "Perfeito! A Torre de 'h1' pula automaticamente para 'f1'.",
            acao: () => {
                const $rei = $('#e1 .piece.king-white');
                const $torre = $('#h1 .piece.rook-white');
                if ($rei.length && $torre.length) {
                    $('#g1').html($rei.clone());
                    $('#f1').html($torre.clone());
                    $('#e1, #h1').empty();
                }
                tutorial.passosAtuais++;
                tutorial.mostrarPasso();
            }
        },

        // 9. Objetivo final
        {
            mensagem: "♟️ O objetivo do Xadrez é colocar o Rei do oponente em xeque-mate — quando ele é atacado e não pode escapar.",
            acao: null
        },
        {
            mensagem: "🎉 Parabéns! Você aprendeu o movimento de todas as peças, o roque e o objetivo do jogo. Agora é hora de praticar de verdade!",
            acao: null
        }
    ];

    tutorial.iniciar();
}
});
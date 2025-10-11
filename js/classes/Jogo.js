import { Tabuleiro } from './Tabuleiro.js';
import { Movimento } from './Movimento.js';
import { Xeque } from './Xeque.js'; // Importa o detector de xeque
import { XequeMate } from './XequeMate.js';
import { Empate } from './Empate.js';

export class Jogo {
    constructor() {
        this.tabuleiro = new Tabuleiro();
        this.movimento = new Movimento();
        this.vezDo = 'white';
        this.clicou = 0;
        this.pecaEscolhida = null;
        this.ultimaCasa = '';

        // Histórico de Jogadas
        this.historicoDeJogadas = []; 

        // Flags de movimento para Roque
        this.whiteKingMoved = false;
        this.blackKingMoved = false;
        this.whiteRooksMoved = {a:false,h:false};
        this.blackRooksMoved = {a:false,h:false};
    }

    iniciar() {
        this.tabuleiro.inicar();
        this.registrarEventos();

        // Interface do histórico
        $('.stats .notation').html('<h3>Histórico de Jogadas</h3><div class="notation-content"><table><thead><tr><th>#</th><th>Brancas</th><th>Pretas</th></tr></thead><tbody></tbody></table></div>');
    }

    gerarNotacaoAlgébrica(origem, destino, peca, pecaCapturada, isRoquePequeno, isRoqueGrande, promocaoPara) {
        const classePeca = peca.attr('class').split(' ')[1];
        const tipoPeca = classePeca.split('-')[0];
        const isCaptura = pecaCapturada.length > 0;
        
        let notacao = '';
        
        const nomePeca = {
            'pawn': 'Peão',
            'knight': 'Cavalo',
            'bishop': 'Bispo',
            'rook': 'Torre',
            'queen': 'Rainha',
            'king': 'Rei'
        }[tipoPeca];

        if (isRoquePequeno) return 'Roque-Pequeno (O-O)'; 
        if (isRoqueGrande) return 'Roque-Grande (O-O-O)'; 

        notacao += nomePeca + ' ' + origem + '-' + destino;

        if (isCaptura) notacao += ' (Captura)';

        if (promocaoPara) {
            const nomePromocao = promocaoPara.charAt(0).toUpperCase() + promocaoPara.slice(1);
            notacao += ` (Promove a ${nomePromocao})`;
        }
        
        return notacao;
    }

    registrarJogada(notacao) {
        this.historicoDeJogadas.push(notacao);
        this.atualizarInterfaceHistorico();
    }

    atualizarInterfaceHistorico() {
        $('.stats .notation .notation-content').remove();

        let html = '<div class="notation-content"><table><thead><tr><th>#</th><th>Brancas</th><th>Pretas</th></tr></thead><tbody>';
        let moveIndex = 0;

        for (let i = 0; i < this.historicoDeJogadas.length; i += 2) {
            moveIndex++;
            const notacaoBrancas = this.historicoDeJogadas[i];
            const notacaoPretas = this.historicoDeJogadas[i + 1] || ''; 
            
            html += `<tr>`;
            html += `<td class="move-number">${moveIndex}.</td>`;
            html += `<td class="brancas-move">${notacaoBrancas}</td>`;
            html += `<td class="pretas-move">${notacaoPretas || '...'}</td>`; 
            html += `</tr>`;
        }
        
        html += '</tbody></table></div>';
        $('.stats .notation').html('<h3>Histórico de Jogadas</h3>' + html);
    }

    registrarEventos() {
        const self = this;

        // === CLICAR NA PEÇA ===
        $('body').on('click', '.piece', function () {
            let classe = $(this).attr('class');
            let casaId = $(this).parent().attr('id');

            // ⚠️ Verifica se está em xeque
            const emXeque = Xeque.estaEmXeque(self.vezDo);

            // Se está em xeque e a peça não é o rei da vez, bloqueia
            if (emXeque && (!classe.includes('king') || !classe.includes(self.vezDo))) {
                alert("⚠️ Você está em xeque! Somente o rei pode se mover.");
                return;
            }

            if (classe.includes(self.vezDo)) {
                self.clicou = 1;
                self.ultimaCasa = casaId;
                self.pecaEscolhida = $(this);
                $('.square-board').removeClass('possible');

                let jaMoveuRei = (self.vezDo === 'white') ? self.whiteKingMoved : self.blackKingMoved;
                let jaMoveuTorres = (self.vezDo === 'white') ? self.whiteRooksMoved : self.blackRooksMoved;

                let moves = self.movimento.movimentosPossiveis(classe, casaId, jaMoveuRei, jaMoveuTorres);
                moves.forEach(m => $('#' + m).addClass('possible'));
            } else if (self.clicou === 1 && $(this).parent().hasClass('possible')) {
                $(this).parent().trigger('click');
            } else {
                alert("⚠️ Não é sua vez! Escolha uma peça " + self.vezDo);
            }
        });

        // === CLICAR NO QUADRADO ===
        $('body').on('click', '.square-board', function () {
            if (self.clicou === 1) {
                let idCasa = $(this).attr('id');
                
                if (idCasa !== self.ultimaCasa && $(this).hasClass('possible')) {
                    let pecaCapturada = $(this).find('.piece');
                    let moveRei = self.pecaEscolhida.hasClass('king');
                    
                    let notacaoFinal = '';
                    let isRoquePequeno = false;
                    let isRoqueGrande = false;
                    let promocaoPara = null;

                    // Captura
                    if (pecaCapturada.length > 0) {
                        $('.stats .capturadas-list').append(pecaCapturada); 
                    }

                    // Move Rei e trata Roque
                    if (moveRei) {
                        let origemCol = self.ultimaCasa[0];
                        let destinoCol = idCasa[0];
                        let linha = parseInt(idCasa[1]);
                        let torreOrigem, torreDestino;

                        if (origemCol === 'e' && destinoCol === 'g') { 
                            isRoquePequeno = true; torreOrigem = 'h' + linha; torreDestino = 'f' + linha; 
                        }
                        if (origemCol === 'e' && destinoCol === 'c') { 
                            isRoqueGrande = true; torreOrigem = 'a' + linha; torreDestino = 'd' + linha; 
                        }

                        if (torreOrigem && torreDestino) {
                            let $torre = $('#' + torreOrigem).find('.piece');
                            $('#' + torreDestino).html($torre);
                            $('#' + torreOrigem).empty();
                            if (self.vezDo === 'white') self.whiteRooksMoved[torreOrigem[0]] = true;
                            else self.blackRooksMoved[torreOrigem[0]] = true;
                        }
                        if (self.vezDo === 'white') self.whiteKingMoved = true;
                        else self.blackKingMoved = true;
                    }

                    // Move peça
                    $(this).html(self.pecaEscolhida);
                    $('#' + self.ultimaCasa).empty();
                    $('.square-board').removeClass('possible');

                    // ===== PROMOÇÃO =====
                    if ((self.pecaEscolhida.hasClass('pawn-white') && parseInt(idCasa[1]) === 8) ||
                        (self.pecaEscolhida.hasClass('pawn-black') && parseInt(idCasa[1]) === 1)) {
                        
                        $('#promotionModal').data('square', idCasa); 
                        $('#promotionModal').data('color', self.pecaEscolhida.hasClass('white') ? 'white' : 'black');
                        $('.board').data('jogo', self); 
                        $('#promotionModal').show();
                        
                    } else {
                        // Notação e troca de vez
                        notacaoFinal = self.gerarNotacaoAlgébrica(
                            self.ultimaCasa, idCasa, self.pecaEscolhida, pecaCapturada,
                            isRoquePequeno, isRoqueGrande, promocaoPara
                        );
                        self.registrarJogada(notacaoFinal);
                        
                        // Troca vez
                        self.vezDo = (self.vezDo === 'white') ? 'black' : 'white';
                        self.clicou = 0;

                        // Verifica se o novo jogador está em xeque
                        if (Xeque.estaEmXeque(self.vezDo)) {
                            const corTexto = (self.vezDo === 'white') ? 'Brancas' : 'Pretas';
                            alert(`♟️ ${corTexto} estão em XEQUE!`);
                        }

                    }

                        // Verifica se está em xeque
                        if (Xeque.estaEmXeque(self.vezDo)) {
                        const corTexto = self.vezDo === 'white' ? 'Brancas' : 'Pretas';
                        alert(`♟️ ${corTexto} estão em XEQUE!`);

                        // Verifica se está em xeque-mate
                        if (XequeMate.estaEmXequeMate(self.vezDo)) {
                            alert(`🏁 XEQUE-MATE! ${(self.vezDo === 'white') ? 'Pretas' : 'Brancas'} vencem o jogo!`);
                            $('body').off('click');
                        }
                    }

                    // Verifica se está em empate
                    if (Empate.verificarEmpate(self.vezDo, self.movimento)) {
                        $('body').off('click'); // encerra o jogo
                    }

                    // Marca torre como movida
                    if (self.pecaEscolhida.hasClass('rook') && !isRoquePequeno && !isRoqueGrande) {
                        if (self.vezDo === 'white') self.whiteRooksMoved[self.ultimaCasa[0]] = true;
                        else self.blackRooksMoved[self.ultimaCasa[0]] = true;
                    }
                }
            }
        });
    }
}

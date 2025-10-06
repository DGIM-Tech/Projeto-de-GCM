
import { Tabuleiro } from './Tabuleiro.js';
import { Movimento } from './Movimento.js';

export class Jogo {
    constructor() {
        this.tabuleiro = new Tabuleiro();
        this.movimento = new Movimento();
        this.vezDo = 'white';
        this.clicou = 0;
        this.pecaEscolhida = null;
        this.ultimaCasa = '';

        // RF05: Histórico de Jogadas
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
    }
    
    // NOVO: Gera a notação no formato descritivo: [Tipo de peça] [Origem]-[Destino]
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

        if (isCaptura) {
            notacao += ' (Captura)';
        }

        if (promocaoPara) {
            const nomePromocao = promocaoPara.charAt(0).toUpperCase() + promocaoPara.slice(1);
            notacao += ` (Promove a ${nomePromocao})`;
        }
        
        return notacao;
    }
    
    // NOVO: Registra a jogada no array e atualiza a interface (RF05)
    registrarJogada(notacao) {
        this.historicoDeJogadas.push(notacao);
        this.atualizarInterfaceHistorico();
    }

    // NOVO: Renderiza o histórico em formato de tabela (linhas separadas por jogada)
    atualizarInterfaceHistorico() {
        // Remove o wrapper anterior para evitar duplicação antes de injetar a tabela
        $('.stats .notation .notation-content').remove();

        // Inicia a estrutura da tabela
        let html = '<div class="notation-content"><table><thead><tr><th>#</th><th>Brancas</th><th>Pretas</th></tr></thead><tbody>';
        let moveIndex = 0;

        for (let i = 0; i < this.historicoDeJogadas.length; i += 2) {
            moveIndex++;
            const notacaoBrancas = this.historicoDeJogadas[i];
            const notacaoPretas = this.historicoDeJogadas[i + 1] || ''; 
            
            html += `<tr>`;
            
            html += `<td class="move-number">${moveIndex}.</td>`;
            html += `<td class="brancas-move">${notacaoBrancas}</td>`;
            
            if (notacaoPretas) {
                html += `<td class="pretas-move">${notacaoPretas}</td>`;
            } else {
                html += `<td class="pretas-move">...</td>`; 
            }
            
            html += `</tr>`;
        }
        
        html += '</tbody></table></div>';
        
        // ATUALIZA: Injeta o cabeçalho e a tabela no elemento .notation
        $('.stats .notation').html('<h3>Histórico de Jogadas</h3>' + html);
    }

    registrarEventos() {
        const self = this;

        // clicar em peça
        $('body').on('click', '.piece', function () {
            let classe = $(this).attr('class');
            let casaId = $(this).parent().attr('id');

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

        // clicar em quadrado
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

                    // ===== Promoção de Peão =====
                    if ((self.pecaEscolhida.hasClass('pawn-white') && parseInt(idCasa[1]) === 8) ||
                        (self.pecaEscolhida.hasClass('pawn-black') && parseInt(idCasa[1]) === 1)) {
                        
                        $('#promotionModal').data('square', idCasa); 
                        $('#promotionModal').data('color', self.pecaEscolhida.hasClass('white') ? 'white' : 'black');
                        $('.board').data('jogo', self); 
                        $('#promotionModal').show();
                        
                    } else {
                        // Movimento Normal/Roque: Gera notação, registra e troca a vez
                        notacaoFinal = self.gerarNotacaoAlgébrica(
                            self.ultimaCasa, idCasa, self.pecaEscolhida, pecaCapturada,
                            isRoquePequeno, isRoqueGrande, promocaoPara
                        );
                        self.registrarJogada(notacaoFinal);
                        
                        // Troca vez
                        self.vezDo = (self.vezDo === 'white') ? 'black' : 'white';
                        self.clicou = 0;
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
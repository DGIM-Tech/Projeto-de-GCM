class Tabuleiro {
	constructor() {
		this.initialPosition = {
			a8: 'rook-black', b8: 'knight-black', c8: 'bishop-black', d8: 'queen-black',
			e8: 'king-black', f8: 'bishop-black', g8: 'knight-black', h8: 'rook-black',

			a7: 'pawn-black', b7: 'pawn-black', c7: 'pawn-black', d7: 'pawn-black',
			e7: 'pawn-black', f7: 'pawn-black', g7: 'pawn-black', h7: 'pawn-black',

			a2: 'pawn-white', b2: 'pawn-white', c2: 'pawn-white', d2: 'pawn-white',
			e2: 'pawn-white', f2: 'pawn-white', g2: 'pawn-white', h2: 'pawn-white',

			a1: 'rook-white', b1: 'knight-white', c1: 'bishop-white', d1: 'queen-white',
			e1: 'king-white', f1: 'bishop-white', g1: 'knight-white', h1: 'rook-white'
		};
	}

	printBoard() {
		var light = 1;
		var columns = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
		for (var l = 8; l >= 1; --l) {
			for (var c = 0; c < columns.length; ++c) {
				var sq = columns[c] + l;
				var lightdark = (light == 1) ? 'light' : 'dark';
				$('.board').append('<div class="square-board ' + lightdark + '" id="' + sq + '"></div>');
				light ^= 1;
			}
			light ^= 1;
		}
	}

	inicializarPecas() {
		$('.square-board').each((_, square) => {
			const sq = $(square).attr('id');
			if (this.initialPosition.hasOwnProperty(sq)) {
				$(square).html(`<div class="piece ${this.initialPosition[sq]}"></div>`)
			}
		});
	}

	inicar() {
		this.printBoard();
		this.inicializarPecas();
	}
}

// ---------- Movimentos ----------
class Movimento {
	constructor() {
		this.colunas = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
	}

	// ======= PEÃO =======
	movimentosPeao(pieceClass, coluna, linha, idxCol) {
		let movimentos = [];

		if (pieceClass.includes('pawn-white')) {
			let destino1 = coluna + (linha + 1);
			if ($('#' + destino1 + ' .piece').length === 0) {
				movimentos.push(destino1);
				if (linha === 2) {
					let destino2 = coluna + (linha + 2);
					if ($('#' + destino2 + ' .piece').length === 0) {
						movimentos.push(destino2);
					}
				}
			}
			movimentos.push(...this.movimentosCaptura(coluna, linha, idxCol, 1, 'black'));
		}

		if (pieceClass.includes('pawn-black')) {
			let destino1 = coluna + (linha - 1);
			if ($('#' + destino1 + ' .piece').length === 0) {
				movimentos.push(destino1);
				if (linha === 7) {
					let destino2 = coluna + (linha - 2);
					if ($('#' + destino2 + ' .piece').length === 0) {
						movimentos.push(destino2);
					}
				}
			}
			movimentos.push(...this.movimentosCaptura(coluna, linha, idxCol, -1, 'white'));
		}

		return movimentos;
	}

	movimentosCaptura(coluna, linha, idxCol, direcao, corInimiga) {
		let movimentos = [];
		if (idxCol > 0) {
			let destino = this.colunas[idxCol - 1] + (linha + direcao);
			if ($('#' + destino + ' .piece').length > 0 &&
				$('#' + destino + ' .piece').attr('class').includes(corInimiga)) {
				movimentos.push(destino);
			}
		}
		if (idxCol < 7) {
			let destino = this.colunas[idxCol + 1] + (linha + direcao);
			if ($('#' + destino + ' .piece').length > 0 &&
				$('#' + destino + ' .piece').attr('class').includes(corInimiga)) {
				movimentos.push(destino);
			}
		}
		return movimentos;
	}

	// ======= BISPO =======
	movimentosBispo(pieceClass, coluna, linha, idxCol) {
		let movimentos = [];
		let corPeca = pieceClass.includes('white') ? 'white' : 'black';

		const direcoes = [
			[1, 1], [-1, 1], [1, -1], [-1, -1]
		];

		for (const [colDelta, rowDelta] of direcoes) {
			for (let step = 1; step <= 7; step++) {
				let newIdxCol = idxCol + colDelta * step;
				let newLinha = linha + rowDelta * step;

				if (newIdxCol < 0 || newIdxCol > 7 || newLinha < 1 || newLinha > 8) break;

				let destinoId = this.colunas[newIdxCol] + newLinha;
				let $pecaDestino = $('#' + destinoId + ' .piece');

				if ($pecaDestino.length === 0) {
					movimentos.push(destinoId);
				} else {
					let classePecaDestino = $pecaDestino.attr('class');
					if (!classePecaDestino.includes(corPeca)) {
						movimentos.push(destinoId);
					}
					break;
				}
			}
		}

		return movimentos;
	}

	// ======= TORRE =======
	movimentosTorre(pieceClass, coluna, linha, idxCol) {
		let movimentos = [];
		let corPeca = pieceClass.includes('white') ? 'white' : 'black';

		const direcoes = [
			[1, 0], [-1, 0], [0, 1], [0, -1]
		];

		for (const [colDelta, rowDelta] of direcoes) {
			for (let step = 1; step <= 7; step++) {
				let newIdxCol = idxCol + colDelta * step;
				let newLinha = linha + rowDelta * step;

				if (newIdxCol < 0 || newIdxCol > 7 || newLinha < 1 || newLinha > 8) break;

				let destinoId = this.colunas[newIdxCol] + newLinha;
				let $pecaDestino = $('#' + destinoId + ' .piece');

				if ($pecaDestino.length === 0) {
					movimentos.push(destinoId);
				} else {
					let classePecaDestino = $pecaDestino.attr('class');
					if (!classePecaDestino.includes(corPeca)) {
						movimentos.push(destinoId);
					}
					break;
				}
			}
		}

		return movimentos;
	}

	// ======= CAVALO =======
	movimentosCavalo(pieceClass, coluna, linha, idxCol) {
		let movimentos = [];
		let corPeca = pieceClass.includes('white') ? 'white' : 'black';

		const offsets = [
			[1, 2], [2, 1], [-1, 2], [-2, 1],
			[1, -2], [2, -1], [-1, -2], [-2, -1]
		];

		for (const [colDelta, rowDelta] of offsets) {
			let newIdxCol = idxCol + colDelta;
			let newLinha = linha + rowDelta;

			if (newIdxCol < 0 || newIdxCol > 7 || newLinha < 1 || newLinha > 8) continue;

			let destinoId = this.colunas[newIdxCol] + newLinha;
			let $pecaDestino = $('#' + destinoId + ' .piece');

			if ($pecaDestino.length === 0 || !$pecaDestino.attr('class').includes(corPeca)) {
				movimentos.push(destinoId);
			}
		}

		return movimentos;
	}

	// ======= REI =======
	movimentosRei(pieceClass, coluna, linha, idxCol, jaMoveuRei, jaMoveuTorres) {
		let movimentos = [];
		let corPeca = pieceClass.includes('white') ? 'white' : 'black';

		const offsets = [
			[1, 0], [-1, 0], [0, 1], [0, -1],
			[1, 1], [1, -1], [-1, 1], [-1, -1]
		];

		for (const [colDelta, rowDelta] of offsets) {
			let newIdxCol = idxCol + colDelta;
			let newLinha = linha + rowDelta;
			if (newIdxCol < 0 || newIdxCol > 7 || newLinha < 1 || newLinha > 8) continue;
			let destinoId = this.colunas[newIdxCol] + newLinha;
			let $pecaDestino = $('#' + destinoId + ' .piece');
			if ($pecaDestino.length === 0 || !$pecaDestino.attr('class').includes(corPeca)) {
				movimentos.push(destinoId);
			}
		}

		// ===== ROQUE =====
		// if (!jaMoveuRei) {
		// 	// Pequeno
		// 	if (!jaMoveuTorres['h'] &&
		// 		$('#' + this.colunas[idxCol + 1] + linha).children().length === 0 &&
		// 		$('#' + this.colunas[idxCol + 2] + linha).children().length === 0) {
		// 		movimentos.push(this.colunas[idxCol + 2] + linha);
		// 	}
		// 	// Grande
		// 	if (!jaMoveuTorres['a'] &&
		// 		$('#' + this.colunas[idxCol - 1] + linha).children().length === 0 &&
		// 		$('#' + this.colunas[idxCol - 2] + linha).children().length === 0 &&
		// 		$('#' + this.colunas[idxCol - 3] + linha).children().length === 0) {
		// 		movimentos.push(this.colunas[idxCol - 2] + linha);
		// 	}
		// }

		return movimentos;
	}

	// ======= RAINHA =======
	movimentosRainha(pieceClass, coluna, linha, idxCol) {
			// Combina movimentos da torre e do bispo
			let movimentos = [];
			movimentos.push(...this.movimentosTorre(pieceClass, coluna, linha, idxCol));
			movimentos.push(...this.movimentosBispo(pieceClass, coluna, linha, idxCol));
			return movimentos;
	}

	// ======= MÉTODO PRINCIPAL =======
	movimentosPossiveis(pieceClass, squareId, jaMoveuRei = false, jaMoveuTorres = {a:false,h:false}) {
		let coluna = squareId[0];
		let linha = parseInt(squareId[1]);
		let idxCol = this.colunas.indexOf(coluna);

		if (pieceClass.includes('pawn')) return this.movimentosPeao(pieceClass, coluna, linha, idxCol);
		if (pieceClass.includes('bishop')) return this.movimentosBispo(pieceClass, coluna, linha, idxCol);
		if (pieceClass.includes('rook')) return this.movimentosTorre(pieceClass, coluna, linha, idxCol);
		if (pieceClass.includes('knight')) return this.movimentosCavalo(pieceClass, coluna, linha, idxCol);
		if (pieceClass.includes('king')) return this.movimentosRei(pieceClass, coluna, linha, idxCol, jaMoveuRei, jaMoveuTorres);
		if (pieceClass.includes('queen')) return this.movimentosRainha(pieceClass, coluna, linha, idxCol);

		return [];
	}
}

// ---------- Jogo ----------
class Jogo {
	constructor() {
		this.tabuleiro = new Tabuleiro();
		this.movimento = new Movimento();
		this.vezDo = 'white';
		this.clicou = 0;
		this.pecaEscolhida = null;
		this.ultimaCasa = '';

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

	registrarEventos() {
		const self = this;

		// clicar em peça
		$('body').on('click', '.piece', function () {
			let classe = $(this).attr('class');
			let casaId = $(this).parent().attr('id');

			if (!classe.includes(self.vezDo)) {
				// captura? Se não tiver movimento permitido para captura, alert
				if (!$(this).parent().hasClass('possible')) {
					alert("⚠️ Não é sua vez! Escolha uma peça " + self.vezDo);
					return;
				}
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
			}
		});

		// clicar em quadrado
		$('body').on('click', '.square-board', function () {
			if (self.clicou === 1) {
				let idCasa = $(this).attr('id');
				if (idCasa !== self.ultimaCasa && $(this).hasClass('possible')) {
					let pecaCapturada = $(this).find('.piece');
					let moveRei = self.pecaEscolhida.hasClass('king');

					// Captura
					if (pecaCapturada.length > 0) {
						$('.capturadas').append(pecaCapturada);
					}

					// Move Rei e trata Roque
					if (moveRei) {
						let origemCol = self.ultimaCasa[0];
						let destinoCol = idCasa[0];
						let linha = parseInt(idCasa[1]);
						let torreOrigem, torreDestino;

						// Roque pequeno
						if (origemCol === 'e' && destinoCol === 'g') {
							torreOrigem = 'h' + linha;
							torreDestino = 'f' + linha;
						}

						// Roque grande
						if (origemCol === 'e' && destinoCol === 'c') {
							torreOrigem = 'a' + linha;
							torreDestino = 'd' + linha;
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

						$('#promotionModal').data('square', idCasa); // salva a casa atual
						$('#promotionModal').data('color', self.pecaEscolhida.hasClass('white') ? 'white' : 'black');
						$('#promotionModal').show();
					} else {
						$(this).html(self.pecaEscolhida); // movimento normal
					}

					// Marca torre como movida
					if (self.pecaEscolhida.hasClass('rook')) {
						if (self.vezDo === 'white') self.whiteRooksMoved[self.ultimaCasa[0]] = true;
						else self.blackRooksMoved[self.ultimaCasa[0]] = true;
					}

					// Troca vez
					self.vezDo = (self.vezDo === 'white') ? 'black' : 'white';
					self.clicou = 0;
				}
			}
		});
	}
}

// ---------- Inicialização ----------
$(function () {
	$('body').append('<div class="capturadas"><h3>Capturadas</h3></div>');
	const jogo = new Jogo();
	jogo.iniciar();
});

$('body').on('click', '#promotionModal .promote', function() {
    let piece = $(this).data('piece'); // queen, rook, bishop, knight
    let squareId = $('#promotionModal').data('square');
    let color = $('#promotionModal').data('color');

    $('#' + squareId).html(`<div class="piece ${piece}-${color}"></div>`);

    $('#promotionModal').hide();
});

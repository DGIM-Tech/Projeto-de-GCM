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

	// Monta o tabuleiro
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

	// Coloca peças iniciais
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
			// Peão branco
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
			// Capturas
			movimentos.push(...this.movimentosCaptura(coluna, linha, idxCol, 1, 'black'));
		}

		if (pieceClass.includes('pawn-black')) {
			// Peão preto
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
			// Capturas
			movimentos.push(...this.movimentosCaptura(coluna, linha, idxCol, -1, 'white'));
		}

		return movimentos;
	}

	movimentosCaptura(coluna, linha, idxCol, direcao, corInimiga) {
		let movimentos = [];
		// esquerda
		if (idxCol > 0) {
			let destino = this.colunas[idxCol - 1] + (linha + direcao);
			if ($('#' + destino + ' .piece').length > 0 &&
				$('#' + destino + ' .piece').attr('class').includes(corInimiga)) {
				movimentos.push(destino);
			}
		}
		// direita
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
						movimentos.push(destinoId); // captura
					}
					break;
				}
			}
		}

		return movimentos;
	}

	// ======= MÉTODO PRINCIPAL =======
	movimentosPossiveis(pieceClass, squareId) {
		let coluna = squareId[0];
		let linha = parseInt(squareId[1]);
		let idxCol = this.colunas.indexOf(coluna);

		if (pieceClass.includes('pawn')) {
			return this.movimentosPeao(pieceClass, coluna, linha, idxCol);
		}
		if (pieceClass.includes('bishop')) {
			return this.movimentosBispo(pieceClass, coluna, linha, idxCol);
		}


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
	}

	iniciar() {
		this.tabuleiro.inicar();
		this.registrarEventos();
	}

	registrarEventos() {
		const self = this;

		// clicou numa peça
		$('body').on('click', '.piece', function () {
			let classe = $(this).attr('class');
			let casaId = $(this).parent().attr('id');

			if (classe.includes(self.vezDo)) {
				self.clicou = 1;
				self.ultimaCasa = casaId;
				self.pecaEscolhida = $(this);
				$('.square-board').removeClass('possible');
				if (!classe.includes(self.vezDo)) {
						alert("⚠️ Não é sua vez! Escolha uma peça " + self.vezDo);
						return;
					}
				let moves = self.movimento.movimentosPossiveis(classe, casaId);
				moves.forEach(m => $('#' + m).addClass('possible'));
			}


			if (!classe.includes(self.vezDo)) {
				alert("⚠️ Não é sua vez! Escolha uma peça " + self.vezDo);
				return;
			}

		});

		// clicou em um quadrado
		$('body').on('click', '.square-board', function () {
			if (self.clicou === 1) {
				let idCasa = $(this).attr('id');

				if (idCasa !== self.ultimaCasa && $(this).hasClass('possible')) {
					// se tiver peça inimiga -> captura
					let pecaCapturada = $(this).find('.piece');
					if (pecaCapturada.length > 0) {
						// manda pra área das capturadas
						$('.capturadas').append(pecaCapturada);
					}

					// move a peça
					$(this).html(self.pecaEscolhida);
					$('#' + self.ultimaCasa).empty();
					$('.square-board').removeClass('possible');

					// troca vez
					self.vezDo = (self.vezDo === 'white') ? 'black' : 'white';
					self.clicou = 0;
					// ⚠️ Só avisa se tentar selecionar peça adversária
					
				}
			}
		});
	}
}

// ---------- Inicialização ----------
$(function () {
	// cria container pras capturas
	$('body').append('<div class="capturadas"><h3>Capturadas</h3></div>');

	const jogo = new Jogo();
	jogo.iniciar();
});

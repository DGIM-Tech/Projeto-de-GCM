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
	movimentosPossiveis(pieceClass, squareId) {
		let movimentos = [];
		let coluna = squareId[0];
		let linha = parseInt(squareId[1]);
		let colunas = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
		let idxCol = colunas.indexOf(coluna);

		// Peão branco
		if (pieceClass.indexOf('pawn-white') >= 0) {
			let destino1 = coluna + (linha + 1);
			if ($('#' + destino1 + ' .piece').length === 0) {
				movimentos.push(destino1);
				// movimento duplo
				if (linha === 2) {
					let destino2 = coluna + (linha + 2);
					if ($('#' + destino2 + ' .piece').length === 0) {
						movimentos.push(destino2);
					}
				}
			}
			// captura diagonal
			if (idxCol > 0) {
				let diagEsq = colunas[idxCol - 1] + (linha + 1);
				if ($('#' + diagEsq + ' .piece').length > 0 &&
					$('#' + diagEsq + ' .piece').attr('class').includes('black')) {
					movimentos.push(diagEsq);
				}
			}
			if (idxCol < 7) {
				let diagDir = colunas[idxCol + 1] + (linha + 1);
				if ($('#' + diagDir + ' .piece').length > 0 &&
					$('#' + diagDir + ' .piece').attr('class').includes('black')) {
					movimentos.push(diagDir);
				}
			}
		}

		// Peão preto
		if (pieceClass.indexOf('pawn-black') >= 0) {
			let destino1 = coluna + (linha - 1);
			if ($('#' + destino1 + ' .piece').length === 0) {
				movimentos.push(destino1);
				// movimento duplo
				if (linha === 7) {
					let destino2 = coluna + (linha - 2);
					if ($('#' + destino2 + ' .piece').length === 0) {
						movimentos.push(destino2);
					}
				}
			}
			// captura diagonal
			if (idxCol > 0) {
				let diagEsq = colunas[idxCol - 1] + (linha - 1);
				if ($('#' + diagEsq + ' .piece').length > 0 &&
					$('#' + diagEsq + ' .piece').attr('class').includes('white')) {
					movimentos.push(diagEsq);
				}
			}
			if (idxCol < 7) {
				let diagDir = colunas[idxCol + 1] + (linha - 1);
				if ($('#' + diagDir + ' .piece').length > 0 &&
					$('#' + diagDir + ' .piece').attr('class').includes('white')) {
					movimentos.push(diagDir);
				}
			}
		}

		return movimentos;
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

				let moves = self.movimento.movimentosPossiveis(classe, casaId);
				moves.forEach(m => $('#' + m).addClass('possible'));
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

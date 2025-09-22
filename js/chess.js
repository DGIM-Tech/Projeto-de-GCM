class Tabuleiro {
	constructor() {
		this.initialPosition = {
			a8: 'rook-black',
			b8: 'knight-black',
			c8: 'bishop-black',
			d8: 'queen-black',
			e8: 'king-black',
			f8: 'bishop-black',
			g8: 'knight-black',
			h8: 'rook-black',

			a7: 'pawn-black',
			b7: 'pawn-black',
			c7: 'pawn-black',
			d7: 'pawn-black',
			e7: 'pawn-black',
			f7: 'pawn-black',
			g7: 'pawn-black',
			h7: 'pawn-black',

			a2: 'pawn-white',
			b2: 'pawn-white',
			c2: 'pawn-white',
			d2: 'pawn-white',
			e2: 'pawn-white',
			f2: 'pawn-white',
			g2: 'pawn-white',
			h2: 'pawn-white',

			a1: 'rook-white',
			b1: 'knight-white',
			c1: 'bishop-white',
			d1: 'queen-white',
			e1: 'king-white',
			f1: 'bishop-white',
			g1: 'knight-white',
			h1: 'rook-white'
		};
	}

	// Monta o tabuleiro (os 64 quadrados)
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
	/// Colocar as peça nas posiçao inicias
	inicializarPecas() {
		$('.square-board').each((_, square) => {
			const sq = $(square).attr('id');
			if (this.initialPosition.hasOwnProperty(sq)) {
				$(square).html(`<div class="piece ${this.initialPosition[sq]}"></div>`)
			}
		});

	}
	// Método para iniciar o jogo (monta o tabuleiro e posiciona as peças)
	inicar() {
		this.printBoard();
		this.inicializarPecas();
	}
}
// funçao aprao uso


class Movimento {
	movimentosPossiveis(pieceClass, squareId) {
		let movimentos = [];
		let coluna = squareId[0];
		let linha = parseInt(squareId[1]);
		if (pieceClass.indexOf('pawn-white') >= 0) {
			// peo branco para anda casa acima
			let destino = coluna + (linha + 1)
			if ($('#' + destino + ' .piece').length === 0) {
				movimentos.push(destino);
			}
		}
		if (pieceClass.indexOf('pawn-black') >= 0) {
			// peao preto anda para baxo
			let destino = coluna + (linha - 1)
			if ($('#' + destino + ' .piece').length === 0) {
				movimentos.push(destino);
			}
		}
		return movimentos;
	}


}
class Jogo {
	constructor() {
		this.tabuleiro = new Tabuleiro();
		this.movimento = new Movimento();
		this.jogador = 'white';
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
		$('body').on('click', '.piece', function () {
			let classe = $(this).attr('class');
			let casaId = $(this).parent().attr('id');
			if (classe.indexOf(self.vezDo) >= 0) {
				self.clicou = 1;
				self.ultimaCasa = casaId;
				self.pecaEscolhida = $(this);
				$('.square-board').removeClass('possible');
				let moves = self.movimento.movimentosPossiveis(classe, casaId);
				moves.forEach(m => $('#' + m).addClass('possible'));
				self.vezDo = (self.vezDo === 'white') ? 'black' : 'white';

				// alert('Movimento válido! Vez de: ' + self.vezDo);
			} else {
				alert('Jogada inválida');
			}

		});
		$('body').on('click', '.square-board', function () {
			if (self.clicou === 1) {
				let idCasa = $(this).attr('id');
				if (idCasa !== self.ultimaCasa) {
					if ($(this).hasClass('possible')) {
						// move a peça
						$(this).html(self.pecaEscolhida);
						$('#' + self.ultimaCasa).empty();
						$('.square-board').removeClass('possible');
						self.clicou = 0;
						// alert('Movimento válido!');
					} else {
						alert('Jogada inválida');
					}
				}
			}
		});
	}
}

$(function () {
	const jogo = new Jogo();
	jogo.iniciar();
});
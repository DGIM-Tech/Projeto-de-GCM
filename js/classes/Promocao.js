// js/classes/Promocao.js
export class Promocao {

    // Método estático para verificar se um movimento resulta em promoção
    static verificar(peca, destino) {
        // A peça deve ser um peão
        if (peca.tipo !== 'p') {
            return false;
        }
        
        const fileiraDestino = parseInt(destino[1]);

        // Peão Branco (p) atinge a fileira 8
        if (peca.cor === 'branca' && fileiraDestino === 8) {
            return true;
        }

        // Peão Preto (P) atinge a fileira 1
        if (peca.cor === 'preta' && fileiraDestino === 1) {
            return true;
        }

        return false;
    }

    // Método para aplicar a promoção
    static aplicar(tabuleiro, coordenada, novoTipoPeca) {
        
        const pecaPromovida = tabuleiro.getPeca(coordenada); 

        if (pecaPromovida && pecaPromovida.tipo === 'p') {
            
            // 1. ATUALIZAÇÃO LÓGICA CONCEITUAL
            tabuleiro.atualizarPecaPromovida(coordenada, novoTipoPeca); // <--- CHAMA O NOVO MÉTODO

            // 2. Atualiza a representação visual (DOM)
            const squareDiv = document.querySelector(`#${coordenada}`);
            if (squareDiv) {
                const pieceElement = squareDiv.querySelector('.piece');
                if (pieceElement) {
                    
                    // Novo tipo de peça no formato de classe ('queen')
                    const novoTipoCompleto = tabuleiro.mapTipoParaClasse(novoTipoPeca.toLowerCase());
                    
                    // Remove a classe 'pawn' e adiciona a nova
                    pieceElement.classList.remove('pawn'); 
                    pieceElement.classList.add(novoTipoCompleto); 
                    
                    // Remova e adicione a classe da cor (necessário para alguns CSS, mas redundante se for apenas 'white'/'black')
                    // Isso garante que o JQuery .hasClass('pawn') não ache a peça mais.
                    // Se você usa classes como 'w-pawn', ajuste esta lógica de classes.
                }
            }
            return true;
        }
        return false;
    }
}
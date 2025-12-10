import { Jogador } from './Jogador.js';

export class JogadorIA extends Jogador {
  constructor(cor, nivelDificuldade = 'médio') {
    super('Computador', cor);
    this.tipo = 'IA';
    this.nivelDificuldade = nivelDificuldade;
  }

  async fazerMovimento(jogo) {
    const depthMap = {
      fácil: 1,
      médio: 5,
      difícil: 8
    };

    const depth = depthMap[this.nivelDificuldade];

    try {
      const fen = jogo._gerarFEN();

      const response = await fetch('https://chess-api.com/v1', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fen, depth })
      });

      // Se a resposta HTTP não for 2xx, o fluxo deve ir para o catch (embora fetch só lance erro em falha de rede)
      // Se você quiser tratar erros HTTP aqui, adicione:
      if (!response.ok) throw new Error("API retornou erro HTTP"); 
      
      const data = await response.json();

      if (!data || typeof data.move !== 'string') {
        Swal.fire('Erro', 'Movimento inválido retornado pela IA', 'error');
        return null;
      }

      const casaOrigem = data.move.slice(0, 2);
      const casaDestino = data.move.slice(2, 4);

      // ✅ CORREÇÃO: Simplifica a lógica de acesso ao jQuery. 
      // O 'globalThis.$' e a manipulação do DOM devem estar dentro do try/catch.
      let peca = null;
      try {
        // Usa o operador ?. (optional chaining) para evitar falhas se globalThis.$ for null/undefined.
        // Se globalThis.$ for null, o resultado será null e não lançará exceção.
        peca = globalThis.$?.('#' + casaOrigem)?.find?.('.piece') ?? null;
      } catch (e) {
        // Este catch pega erros na execução do jQuery/DOM, garantindo que peca seja null.
        peca = null;
      }

      return {
        casaOrigem,
        casaDestino,
        peca
      };

    } catch (erro) {
      // Este catch lida com falhas de rede (fetch) ou erros de parse do JSON.
      Swal.fire(
        'Erro de Conexão',
        'Não foi possível contatar a IA',
        'error'
      );
      return null;
    }
  }
}

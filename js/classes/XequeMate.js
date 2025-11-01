// js/classes/XequeMate.js - CLASSE COMPLETA CORRIGIDA

import { Xeque } from './Xeque.js';

export class XequeMate {
    /**
     * Verifica se um jogador está em xeque-mate
     */
    static estaEmXequeMate(cor, jogo) {
        console.log(`Verificando xeque-mate para ${cor}`);
        
        // Primeiro verifica se está em xeque
        if (!Xeque.estaEmXeque(cor, jogo.movimento)) {
            console.log(`Não é xeque-mate: ${cor} não está em xeque`);
            return false;
        }

        // Se está em xeque, verifica se tem movimentos legais
        const temMovimentosLegais = jogo._verificarMovimentosLegais(cor);
        
        if (!temMovimentosLegais) {
            console.log(`XEQUE-MATE confirmado para ${cor}`);
            return true;
        }
        
        console.log(`Não é xeque-mate: ${cor} tem movimentos legais`);
        return false;
    }

    /**
     * Verifica se há afogamento (rei não está em xeque mas não tem movimentos legais)
     */
    static estaAfogado(cor, jogo) {
        console.log(`Verificando afogamento para ${cor}`);
        
        // Se está em xeque, não é afogamento
        if (Xeque.estaEmXeque(cor, jogo.movimento)) {
            console.log(`Não é afogamento: ${cor} está em xeque`);
            return false;
        }

        // Se não tem movimentos legais e não está em xeque, é afogamento
        const temMovimentosLegais = jogo._verificarMovimentosLegais(cor);
        
        if (!temMovimentosLegais) {
            console.log(`AFOGAMENTO confirmado para ${cor}`);
            return true;
        }
        
        console.log(`Não é afogamento: ${cor} tem movimentos legais`);
        return false;
    }
}
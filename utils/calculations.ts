import type { DailySale, CommissionTier } from '../types';
import { COMMISSION_TIERS } from '../constants';
import { formatCurrencyBRL } from './formatters';

export const calculateMonthlyTotals = (dailySales: DailySale[]) => {
  return dailySales.reduce(
    (totals, sale) => {
      totals.totalIndividual += sale.individualSale;
      totals.totalStore += sale.storeSale;
      return totals;
    },
    { totalIndividual: 0, totalStore: 0 }
  );
};

export const calculateCommission = (
  totalIndividual: number,
  totalStore: number,
  storeGoal: number
) => {
  if (storeGoal <= 0) {
    return { amount: 0, rate: 0, eligible: false, reason: 'A meta da loja não foi definida.', tier: null };
  }
  
  if (totalIndividual <= 0) {
    return { amount: 0, rate: 0, eligible: false, reason: 'Nenhuma venda individual registrada.', tier: null };
  }

  const tier = COMMISSION_TIERS.find(t => totalIndividual >= t.min && totalIndividual <= t.max);

  if (!tier) {
    const highestTier = COMMISSION_TIERS[COMMISSION_TIERS.length - 1];
    if (totalIndividual > highestTier.max) {
         return { amount: 0, rate: 0, eligible: false, reason: `Suas vendas (${formatCurrencyBRL(totalIndividual)}) excedem a faixa máxima da tabela.`, tier: null };
    }
    return { amount: 0, rate: 0, eligible: false, reason: `Suas vendas (${formatCurrencyBRL(totalIndividual)}) não atingiram a primeira faixa de comissão.`, tier: null };
  }

  const storePerformance = totalStore / storeGoal;
  const baseCommission = totalIndividual * tier.rate;

  if (storePerformance >= 1) {
    return {
      amount: baseCommission,
      rate: tier.rate,
      eligible: true,
      reason: `Meta da loja batida! Você recebe 100% da sua comissão.`,
      tier: tier
    };
  }

  if (storePerformance >= 0.85) {
    return {
      amount: baseCommission * 0.70,
      rate: tier.rate,
      eligible: true,
      reason: 'Meta mínima (85%) alcançada. Você recebe 70% da sua comissão.',
      tier: tier
    };
  }

  return {
    amount: 0,
    rate: tier.rate,
    eligible: false,
    reason: `A loja não atingiu a meta mínima de 85% (${(storePerformance * 100).toFixed(2)}%).`,
    tier: tier
  };
};

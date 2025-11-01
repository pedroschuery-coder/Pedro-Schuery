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
    return { amount: 0, rate: 0, eligible: false, reason: 'A meta da loja não foi definida.', tier: null, lostAmount: 0 };
  }
  
  if (totalIndividual <= 0) {
    return { amount: 0, rate: 0, eligible: false, reason: 'Nenhuma venda individual registrada.', tier: null, lostAmount: 0 };
  }

  const tier = COMMISSION_TIERS.find(t => totalIndividual >= t.min && totalIndividual <= t.max);

  if (!tier) {
    const highestTier = COMMISSION_TIERS[COMMISSION_TIERS.length - 1];
    if (totalIndividual > highestTier.max) {
         return { amount: 0, rate: 0, eligible: false, reason: `Suas vendas (${formatCurrencyBRL(totalIndividual)}) excedem a faixa máxima da tabela.`, tier: null, lostAmount: 0 };
    }
    return { amount: 0, rate: 0, eligible: false, reason: `Suas vendas (${formatCurrencyBRL(totalIndividual)}) não atingiram a primeira faixa de comissão.`, tier: null, lostAmount: 0 };
  }

  const storePerformance = totalStore / storeGoal;
  const baseCommission = totalIndividual * tier.rate;

  if (storePerformance >= 1) {
    return {
      amount: baseCommission,
      rate: tier.rate,
      eligible: true,
      reason: `Meta da loja batida! Você recebe 100% da sua comissão.`,
      tier: tier,
      lostAmount: 0,
    };
  }

  if (storePerformance >= 0.85) {
    return {
      amount: baseCommission * 0.70,
      rate: tier.rate,
      eligible: true,
      reason: 'Meta mínima (85%) alcançada. Você recebe 70% da sua comissão.',
      tier: tier,
      lostAmount: baseCommission * 0.30,
    };
  }

  return {
    amount: 0,
    rate: tier.rate,
    eligible: false,
    reason: `A loja não atingiu a meta mínima de 85% (${(storePerformance * 100).toFixed(2)}%).`,
    tier: tier,
    lostAmount: baseCommission,
  };
};

export const calculateCommissionInsights = (totalIndividual: number) => {
  const currentTier = COMMISSION_TIERS.find(t => totalIndividual >= t.min && totalIndividual <= t.max);
  const highestTier = COMMISSION_TIERS[COMMISSION_TIERS.length - 1];
  const lowestTier = COMMISSION_TIERS[0];

  if (totalIndividual > highestTier.max) {
    return {
      isOnHighestTier: true,
      nextTier: null,
      amountToNextTier: 0,
    };
  }
  
  if (!currentTier) { // Below first tier
    return {
      isOnHighestTier: false,
      nextTier: lowestTier,
      amountToNextTier: lowestTier.min - totalIndividual,
    };
  }

  const currentTierIndex = COMMISSION_TIERS.findIndex(t => t.min === currentTier.min);
  const nextTier = COMMISSION_TIERS[currentTierIndex + 1];

  if (!nextTier) { // On the highest tier
    return {
      isOnHighestTier: true,
      nextTier: null,
      amountToNextTier: 0,
    };
  }

  return {
    isOnHighestTier: false,
    nextTier: nextTier,
    amountToNextTier: nextTier.min - totalIndividual,
  };
};

export const getRemainingBusinessDaysInMonth = (monthStr: string): number => {
    const today = new Date();
    // Prevent time zone issues by setting time to midday
    today.setHours(12, 0, 0, 0);

    const [year, month] = monthStr.split('-').map(Number);
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1;

    if (year < currentYear || (year === currentYear && month < currentMonth)) {
        return 0;
    }

    const lastDayOfMonth = new Date(year, month, 0).getDate();
    const startDay = (year === currentYear && month === currentMonth) ? today.getDate() : 1;
    let businessDays = 0;

    for(let day = startDay; day <= lastDayOfMonth; day++) {
        const d = new Date(year, month - 1, day);
        if (d.getDay() !== 0 && d.getDay() !== 6) { // Not Sunday or Saturday
            businessDays++;
        }
    }
    return businessDays;
}
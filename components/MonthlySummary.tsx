import React from 'react';
import { Card } from './ui/Card';
import { ProgressBar } from './ui/ProgressBar';
import { formatCurrencyBRL } from '../utils/formatters';
import type { DailySale } from '../types';
import { calculateCommission, calculateMonthlyTotals } from '../utils/calculations';
import { DollarSign, Percent, TrendingUp, Trophy } from 'lucide-react';

interface MonthlySummaryProps {
  dailySales: DailySale[];
  storeGoal: number;
}

const InfoBox: React.FC<{
  icon: React.ReactNode;
  title: string;
  value: string;
  isHighlighted?: boolean;
}> = ({ icon, title, value, isHighlighted = false }) => (
    <div className={`bg-slate-700/50 p-4 rounded-lg flex items-center gap-4 ${isHighlighted ? 'ring-2 ring-emerald-500' : ''}`}>
        <div className={`p-2 rounded-full bg-slate-600/50 ${isHighlighted ? 'text-emerald-400' : 'text-sky-400'}`}>
            {icon}
        </div>
        <div>
            <p className="text-sm text-slate-400">{title}</p>
            <p className={`text-xl font-bold ${isHighlighted ? 'text-emerald-300' : 'text-slate-200'}`}>{value}</p>
        </div>
    </div>
);


export const MonthlySummary: React.FC<MonthlySummaryProps> = ({ dailySales, storeGoal }) => {
  const { totalIndividual, totalStore } = calculateMonthlyTotals(dailySales);
  const commissionResult = calculateCommission(totalIndividual, totalStore, storeGoal);

  const storeGoalPercentage = storeGoal > 0 ? (totalStore / storeGoal) * 100 : 0;
  
  const contributionPercentage = totalStore > 0 ? (totalIndividual / totalStore) * 100 : 0;

  return (
    <Card className="flex flex-col h-full">
      <h2 className="text-2xl font-bold text-slate-200 mb-4">Resumo do Mês</h2>
      
      <div className="mb-6">
        <div className="flex justify-between items-end mb-1">
            <span className="text-sm font-medium text-slate-300">Progresso da Meta da Loja</span>
            <span className="text-sm font-bold text-sky-400">{formatCurrencyBRL(totalStore)} / {formatCurrencyBRL(storeGoal)}</span>
        </div>
        <ProgressBar percentage={storeGoalPercentage} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-grow">
        <InfoBox icon={<TrendingUp size={20} />} title="Suas Vendas" value={formatCurrencyBRL(totalIndividual)} />
        <InfoBox icon={<Percent size={20} />} title="Sua Contribuição" value={`${contributionPercentage.toFixed(2)}%`} />
        <InfoBox icon={<Trophy size={20} />} title="Comissão (Taxa)" value={commissionResult.eligible ? `${(commissionResult.rate * 100).toFixed(2)}%` : 'N/A'} />
        <InfoBox icon={<DollarSign size={20} />} title="Comissão (Valor)" value={formatCurrencyBRL(commissionResult.amount)} isHighlighted />
      </div>

      <div className="mt-6 text-center p-3 rounded-lg bg-slate-900/50 border border-slate-700">
        {commissionResult.eligible ? (
            <p className="text-emerald-400 text-sm">
                {commissionResult.reason ? commissionResult.reason : `Você está elegível para comissão. Faixa atual: ${commissionResult.tier ? formatCurrencyBRL(commissionResult.tier.min) : 'N/A'}.`}
            </p>
        ) : (
            <p className="text-amber-400 text-sm">{commissionResult.reason}</p>
        )}
      </div>

    </Card>
  );
};

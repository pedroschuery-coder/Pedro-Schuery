import React from 'react';
import { Card } from './ui/Card';
import { ProgressBar } from './ui/ProgressBar';
import { formatCurrencyBRL } from '../utils/formatters';
import type { DailySale } from '../types';
import { calculateCommission, calculateMonthlyTotals, calculateCommissionInsights, getRemainingBusinessDaysInMonth } from '../utils/calculations';
import { DollarSign, Percent, TrendingUp, Trophy, Target, Calendar, Hash, AlertTriangle } from 'lucide-react';

interface MonthlySummaryProps {
  dailySales: DailySale[];
  storeGoal: number;
  activeMonth: string;
}

const InfoBox: React.FC<{
  icon: React.ReactNode;
  title: string;
  value: string;
  subValue?: string;
  isPrimary?: boolean;
  isHighlighted?: boolean;
  isWarning?: boolean;
}> = ({ icon, title, value, subValue, isPrimary = false, isHighlighted = false, isWarning = false }) => {
    
    let ringClass = '';
    let textClass = 'text-sky-400';
    let valueTextClass = 'text-slate-200';
    let valueSizeClass = 'text-xl';
    let paddingClass = 'p-4';
    let iconBgClass = 'bg-slate-600/50';

    if (isPrimary) {
        ringClass = 'ring-2 ring-sky-500';
        textClass = 'text-sky-400';
        valueTextClass = 'text-sky-300';
        valueSizeClass = 'text-3xl';
        paddingClass = 'p-6';
    } else if(isHighlighted) {
        ringClass = 'ring-2 ring-emerald-500';
        textClass = 'text-emerald-400';
        valueTextClass = 'text-emerald-300';
        valueSizeClass = 'text-3xl';
        paddingClass = 'p-6';
    } else if (isWarning) {
        ringClass = 'ring-2 ring-amber-500';
        textClass = 'text-amber-400';
        valueTextClass = 'text-amber-300';
    }

    return (
    <div className={`bg-transparent border border-slate-700/50 rounded-lg flex items-center gap-4 ${ringClass} ${paddingClass} h-full`}>
        <div className={`p-3 rounded-full ${iconBgClass} ${textClass}`}>
            {icon}
        </div>
        <div>
            <p className="text-sm text-slate-400">{title}</p>
            <p className={`font-bold ${valueTextClass} ${valueSizeClass}`}>{value}</p>
            {subValue && <p className={`text-xs mt-1 ${isPrimary || isHighlighted ? 'text-slate-400' : 'text-slate-500'}`}>{subValue}</p>}
        </div>
    </div>
)};


export const MonthlySummary: React.FC<MonthlySummaryProps> = ({ dailySales, storeGoal, activeMonth }) => {
  const { totalIndividual, totalStore } = calculateMonthlyTotals(dailySales);
  const commissionResult = calculateCommission(totalIndividual, totalStore, storeGoal);
  const insights = calculateCommissionInsights(totalIndividual);
  const remainingDays = getRemainingBusinessDaysInMonth(activeMonth);

  const storeGoalPercentage = storeGoal > 0 ? (totalStore / storeGoal) * 100 : 0;
  
  const contributionPercentage = totalStore > 0 ? (totalIndividual / totalStore) * 100 : 0;
  
  const salesDays = dailySales.length > 0 ? new Set(dailySales.map(s => s.date)).size : 0;
  const averageDailySale = salesDays > 0 ? totalIndividual / salesDays : 0;

  const requiredStoreDailyAvg = storeGoal > totalStore && remainingDays > 0
    ? (storeGoal - totalStore) / remainingDays
    : 0;

  return (
    <Card className="flex flex-col h-full">
      <h2 className="text-2xl font-bold text-slate-200 mb-4">Resumo do Mês</h2>
      
      <div className="mb-8">
        <div className="flex justify-between items-end mb-1">
            <span className="text-sm font-medium text-slate-300">Progresso da Meta da Loja</span>
            <span className="text-sm font-bold text-sky-400">{formatCurrencyBRL(totalStore)} / {formatCurrencyBRL(storeGoal)} ({storeGoalPercentage.toFixed(2)}%)</span>
        </div>
        <ProgressBar percentage={storeGoalPercentage} />
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <InfoBox 
          icon={<TrendingUp size={28} />} 
          title="Suas Vendas" 
          value={formatCurrencyBRL(totalIndividual)}
          subValue={`(${contributionPercentage.toFixed(2)}% da Loja)`}
          isPrimary 
        />
        <InfoBox 
          icon={<DollarSign size={28} />} 
          title="Comissão (Estimada)" 
          value={formatCurrencyBRL(commissionResult.amount)} 
          isHighlighted
        />
      </div>
      
      {/* Secondary Stats */}
      <h3 className="text-lg font-semibold text-slate-300 mb-4">Detalhes Adicionais</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 flex-grow">
        <InfoBox icon={<Calendar size={20} />} title="Sua Média Diária" value={formatCurrencyBRL(averageDailySale)} subValue={salesDays > 0 ? `baseado em ${salesDays} dias` : ''} />
        
        {commissionResult.lostAmount > 0 && (
          <InfoBox
            icon={<AlertTriangle size={20} />}
            title="Potencial Perdido"
            value={formatCurrencyBRL(commissionResult.lostAmount)}
            subValue="Por performance da loja"
            isWarning
          />
        )}

        {insights.isOnHighestTier || !insights.nextTier ? (
            <InfoBox icon={<Trophy size={20} />} title="Parabéns!" value="Faixa máxima atingida!" />
        ) : (
            <InfoBox icon={<Target size={20} />} title={`Próxima Faixa (${(insights.nextTier.rate * 100).toFixed(2)}%)`} value={formatCurrencyBRL(insights.amountToNextTier)} subValue="restante para atingir" />
        )}

        {requiredStoreDailyAvg > 0 ? (
            <InfoBox icon={<Hash size={20} />} title="Média Diária (Meta Loja)" value={formatCurrencyBRL(requiredStoreDailyAvg)} subValue={`em ${remainingDays} dias úteis`} />
        ) : (
             <InfoBox icon={<Hash size={20} />} title="Média Diária (Meta Loja)" value={"N/A"} subValue="Meta atingida ou mês finalizado"/>
        )}
      </div>

      <div className="mt-6 text-center p-3 rounded-lg bg-transparent border border-slate-700">
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
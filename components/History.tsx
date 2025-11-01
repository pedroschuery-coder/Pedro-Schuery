import React from 'react';
import type { SalesHistory } from '../types';
import { Card } from './ui/Card';
import { formatCurrencyBRL } from '../utils/formatters';
import { calculateMonthlyTotals, calculateCommission } from '../utils/calculations';
import { Calendar } from 'lucide-react';

interface HistoryProps {
  salesHistory: SalesHistory;
  storeGoals: { [month: string]: number };
}

export const History: React.FC<HistoryProps> = ({ salesHistory, storeGoals }) => {
  const sortedMonths = Object.keys(salesHistory).sort().reverse();

  if (sortedMonths.length === 0) {
    return (
      <Card>
        <h2 className="text-2xl font-bold text-slate-200 mb-4 flex items-center gap-2">
          <Calendar size={24} /> Histórico de Vendas
        </h2>
        <p className="text-slate-400">Nenhum histórico de vendas encontrado.</p>
      </Card>
    );
  }

  return (
    <Card>
      <h2 className="text-2xl font-bold text-slate-200 mb-6 flex items-center gap-2">
        <Calendar size={24} /> Histórico de Vendas
      </h2>
      <div className="space-y-6">
        {sortedMonths.map(month => {
          const monthData = salesHistory[month];
          if (!monthData) return null;

          const storeGoal = storeGoals[month] || 0;
          const { totalIndividual, totalStore } = calculateMonthlyTotals(monthData.dailySales);
          const commissionResult = calculateCommission(totalIndividual, totalStore, storeGoal);
          const storeGoalPercentage = storeGoal > 0 ? (totalStore / storeGoal) * 100 : 0;
          const contributionPercentage = totalStore > 0 ? (totalIndividual / totalStore) * 100 : 0;

          return (
            <div key={month} className="p-4 bg-slate-900/50 rounded-lg border border-slate-700">
              <h3 className="text-xl font-semibold text-sky-400 mb-3">
                {new Date(month + '-02').toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-slate-400">Meta da Loja</p>
                  <p className="font-bold text-slate-200">{formatCurrencyBRL(storeGoal)}</p>
                </div>
                <div>
                  <p className="text-slate-400">Vendas da Loja</p>
                  <p className="font-bold text-slate-200">{formatCurrencyBRL(totalStore)} ({storeGoalPercentage.toFixed(2)}%)</p>
                </div>
                <div>
                  <p className="text-slate-400">Suas Vendas (% Contrib.)</p>
                  <p className="font-bold text-slate-200">
                    {formatCurrencyBRL(totalIndividual)}
                    <span className="text-xs font-normal text-slate-400 ml-1">({contributionPercentage.toFixed(2)}%)</span>
                  </p>
                </div>
                <div>
                  <p className="text-slate-400">Comissão Ganha</p>
                  <p className={`font-bold ${commissionResult.amount > 0 ? 'text-emerald-400' : 'text-slate-200'}`}>{formatCurrencyBRL(commissionResult.amount)}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

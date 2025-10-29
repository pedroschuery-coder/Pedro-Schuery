import React, { useMemo } from 'react';
import type { SalesHistory } from '../types';
import { Card } from './ui/Card';
import { formatCurrencyBRL } from '../utils/formatters';
import { calculateMonthlyTotals, calculateCommission } from '../utils/calculations';
import { BarChart, TrendingUp, Calendar, Hash, Trophy, DollarSign, Percent } from 'lucide-react';

interface StatisticsProps {
  salesHistory: SalesHistory;
  activeMonth: string;
}

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode }> = ({ title, value, icon }) => (
    <div className="bg-slate-700/50 p-4 rounded-lg flex items-start gap-4">
        <div className="p-2 rounded-full bg-slate-600/50 text-sky-400">
            {icon}
        </div>
        <div>
            <p className="text-sm text-slate-400">{title}</p>
            <p className="text-2xl font-bold text-slate-100">{value}</p>
        </div>
    </div>
);


export const Statistics: React.FC<StatisticsProps> = ({ salesHistory, activeMonth }) => {
  const activeMonthData = useMemo(() => {
    return salesHistory[activeMonth] || { storeGoal: 0, dailySales: [] };
  }, [salesHistory, activeMonth]);

  const { totalIndividual, totalStore } = calculateMonthlyTotals(activeMonthData.dailySales);
  const commissionResult = calculateCommission(totalIndividual, totalStore, activeMonthData.storeGoal);

  const allTimeStats = useMemo(() => {
    let totalSalesOverall = 0;
    let totalCommissionOverall = 0;
    let totalMonths = 0;
    let bestMonth = { month: '', sales: 0 };
    let totalEntries = 0;

    for (const month in salesHistory) {
      const monthData = salesHistory[month];
      if (!monthData) continue;
      
      totalMonths++;
      totalEntries += monthData.dailySales.length;

      const { totalIndividual: monthIndividual, totalStore: monthStore } = calculateMonthlyTotals(monthData.dailySales);
      const { amount: monthCommission } = calculateCommission(monthIndividual, monthStore, monthData.storeGoal);

      totalSalesOverall += monthIndividual;
      totalCommissionOverall += monthCommission;

      if (monthIndividual > bestMonth.sales) {
        bestMonth = { month, sales: monthIndividual };
      }
    }

    const averageMonthlySales = totalMonths > 0 ? totalSalesOverall / totalMonths : 0;

    return {
      totalSalesOverall,
      totalCommissionOverall,
      averageMonthlySales,
      bestMonth,
      totalMonths,
      totalEntries
    };
  }, [salesHistory]);

  const activeMonthStats = useMemo(() => {
    const salesDays = activeMonthData.dailySales.length;
    const averageDailySale = salesDays > 0 ? totalIndividual / salesDays : 0;
    
    let bestDay = { date: '', sales: 0 };
    activeMonthData.dailySales.forEach(sale => {
      if(sale.individualSale > bestDay.sales) {
        bestDay = { date: sale.date, sales: sale.individualSale };
      }
    });

    return {
      salesDays,
      averageDailySale,
      bestDay
    }
  }, [activeMonthData, totalIndividual]);


  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-200 mb-6 flex items-center gap-2">
        <BarChart size={24} /> Estatísticas
      </h2>
      
      <div className="space-y-8">
        <Card>
          <h3 className="text-xl font-semibold text-sky-400 mb-4">
            Mês Ativo ({new Date(activeMonth + '-02').toLocaleString('pt-BR', { month: 'long', year: 'numeric' })})
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <StatCard title="Dias com Vendas" value={activeMonthStats.salesDays} icon={<Calendar size={24} />} />
            <StatCard title="Média Diária (Sua)" value={formatCurrencyBRL(activeMonthStats.averageDailySale)} icon={<TrendingUp size={24} />} />
            <StatCard title="Melhor Dia" value={activeMonthStats.bestDay.sales > 0 ? formatCurrencyBRL(activeMonthStats.bestDay.sales) : 'N/A'} icon={<Trophy size={24} />} />
            <StatCard title="Suas Vendas (Mês)" value={formatCurrencyBRL(totalIndividual)} icon={<DollarSign size={24} />} />
            <StatCard title="Comissão (Mês)" value={formatCurrencyBRL(commissionResult.amount)} icon={<Percent size={24} />} />
          </div>
        </Card>

        <Card>
          <h3 className="text-xl font-semibold text-emerald-400 mb-4">Geral (Todos os Tempos)</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <StatCard title="Total de Lançamentos" value={allTimeStats.totalEntries} icon={<Hash size={24} />} />
            <StatCard title="Média de Vendas Mensal" value={formatCurrencyBRL(allTimeStats.averageMonthlySales)} icon={<TrendingUp size={24} />} />
            <StatCard 
              title="Melhor Mês" 
              value={allTimeStats.bestMonth.month ? new Date(allTimeStats.bestMonth.month + '-02').toLocaleString('pt-BR', { month: 'short', year: 'numeric' }) : 'N/A'} 
              icon={<Trophy size={24} />} 
            />
            <StatCard title="Suas Vendas (Total)" value={formatCurrencyBRL(allTimeStats.totalSalesOverall)} icon={<DollarSign size={24} />} />
            <StatCard title="Comissão (Total)" value={formatCurrencyBRL(allTimeStats.totalCommissionOverall)} icon={<Percent size={24} />} />
          </div>
        </Card>
      </div>
    </div>
  );
};

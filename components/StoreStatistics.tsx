import React, { useMemo } from 'react';
import type { FullSalesData } from '../types';
import { Card } from './ui/Card';
import { formatCurrencyBRL } from '../utils/formatters';
import { calculateMonthlyTotals, calculateCommission } from '../utils/calculations';
import { TrendingUp, DollarSign, Trophy, Calendar, Users } from 'lucide-react';

interface StoreStatisticsProps {
  fullSalesData: FullSalesData;
  storeGoals: { [month: string]: number };
}

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode }> = ({ title, value, icon }) => (
  <div className="bg-slate-700/50 p-4 rounded-lg flex items-start gap-4">
      <div className="p-2 rounded-full bg-slate-600/50 text-emerald-400">
          {icon}
      </div>
      <div>
          <p className="text-sm text-slate-400">{title}</p>
          <p className="text-2xl font-bold text-slate-100">{value}</p>
      </div>
  </div>
);

export const StoreStatistics: React.FC<StoreStatisticsProps> = ({ fullSalesData, storeGoals }) => {
  const storeStats = useMemo(() => {
    const monthlyAggregates: { 
      [month: string]: { 
        totalStore: number;
        totalIndividual: number; 
        totalCommission: number; 
        activeSellers: number;
      } 
    } = {};

    const allMonths = [...new Set(Object.values(fullSalesData).flatMap(userHistory => Object.keys(userHistory)))];
    
    allMonths.forEach(month => {
        monthlyAggregates[month] = { totalStore: 0, totalIndividual: 0, totalCommission: 0, activeSellers: 0 };
    });

    // 1. Calculate correct totalStore sales for each month by de-duplicating daily store sales across all users.
    allMonths.forEach(month => {
        const salesByDay: { [day: string]: number } = {};
        Object.values(fullSalesData).forEach(userHistory => {
            if (userHistory[month]) {
                userHistory[month].dailySales.forEach(sale => {
                    salesByDay[sale.date] = Math.max(salesByDay[sale.date] || 0, sale.storeSale);
                });
            }
        });
        monthlyAggregates[month].totalStore = Object.values(salesByDay).reduce((sum, day) => sum + day, 0);
    });

    // 2. Iterate through each user to calculate their contributions and aggregate them.
    Object.values(fullSalesData).forEach(userHistory => {
        Object.entries(userHistory).forEach(([month, monthData]) => {
            if (monthData.dailySales.length > 0) {
                const { totalIndividual } = calculateMonthlyTotals(monthData.dailySales);
                
                monthlyAggregates[month].totalIndividual += totalIndividual;
                monthlyAggregates[month].activeSellers += 1;

                const monthGoal = storeGoals[month] || 0;
                const correctTotalStore = monthlyAggregates[month].totalStore;
                const { amount: commission } = calculateCommission(totalIndividual, correctTotalStore, monthGoal);
                
                monthlyAggregates[month].totalCommission += commission;
            }
        });
    });

    // 3. Calculate grand totals from the corrected monthly aggregates
    const grandTotals = Object.values(monthlyAggregates).reduce((acc, data) => {
        acc.grandTotalStoreSales += data.totalStore;
        acc.grandTotalIndividualSales += data.totalIndividual;
        acc.grandTotalCommission += data.totalCommission;
        return acc;
    }, { grandTotalStoreSales: 0, grandTotalIndividualSales: 0, grandTotalCommission: 0 });

    // 4. Find the best month based on total store sales
    let bestMonth = { month: '', sales: 0 };
    Object.entries(monthlyAggregates).forEach(([month, data]) => {
      if (data.totalStore > bestMonth.sales) {
        bestMonth = { month, sales: data.totalStore };
      }
    });

    return {
      monthlyAggregates,
      ...grandTotals,
      bestMonth,
    };
  }, [fullSalesData, storeGoals]);

  const sortedMonths = Object.keys(storeStats.monthlyAggregates).sort().reverse();

  return (
    <Card>
        <h2 className="text-2xl font-bold text-slate-200 mb-6">Estatísticas Gerais da Loja</h2>
        
        <div className="mb-8">
            <h3 className="text-xl font-semibold text-sky-400 mb-4">Resumo Geral (Todo o Período)</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Vendas Totais (Loja)" value={formatCurrencyBRL(storeStats.grandTotalStoreSales)} icon={<TrendingUp size={24} />} />
                <StatCard title="Vendas Totais (Vendedores)" value={formatCurrencyBRL(storeStats.grandTotalIndividualSales)} icon={<Users size={24} />} />
                <StatCard title="Comissões Pagas (Total)" value={formatCurrencyBRL(storeStats.grandTotalCommission)} icon={<DollarSign size={24} />} />
                <StatCard 
                    title="Melhor Mês" 
                    value={storeStats.bestMonth.month ? new Date(storeStats.bestMonth.month + '-02').toLocaleString('pt-BR', { month: 'short', year: 'numeric' }) : 'N/A'} 
                    icon={<Trophy size={24} />} 
                />
            </div>
        </div>

        <div>
            <h3 className="text-xl font-semibold text-sky-400 mb-4 flex items-center gap-2"><Calendar size={20}/> Desempenho por Mês</h3>
             <div className="space-y-4">
                {sortedMonths.length > 0 ? sortedMonths.map(month => {
                    const data = storeStats.monthlyAggregates[month];
                    return (
                        <div key={month} className="p-4 bg-slate-900/50 rounded-lg border border-slate-700">
                            <h4 className="font-semibold text-lg text-slate-200 mb-2">
                                {new Date(month + '-02').toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}
                            </h4>
                             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div>
                                    <p className="text-slate-400">Vendas da Loja</p>
                                    <p className="font-bold text-slate-100">{formatCurrencyBRL(data.totalStore)}</p>
                                </div>
                                <div>
                                    <p className="text-slate-400">Vendas Vendedores</p>
                                    <p className="font-bold text-slate-100">{formatCurrencyBRL(data.totalIndividual)}</p>
                                </div>
                                <div>
                                    <p className="text-slate-400">Comissões Pagas</p>
                                    <p className="font-bold text-emerald-400">{formatCurrencyBRL(data.totalCommission)}</p>
                                </div>
                                <div>
                                    <p className="text-slate-400">Vendedores Ativos</p>
                                    <p className="font-bold text-slate-100">{data.activeSellers}</p>
                                </div>
                            </div>
                        </div>
                    );
                }) : <p className="text-slate-400">Nenhum dado para exibir.</p>}
            </div>
        </div>

    </Card>
  );
};
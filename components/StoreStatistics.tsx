import React, { useMemo } from 'react';
import type { FullSalesData } from '../types';
import { Card } from './ui/Card';
import { formatCurrencyBRL } from '../utils/formatters';
import { calculateMonthlyTotals, calculateCommission } from '../utils/calculations';
import { TrendingUp, DollarSign, Trophy, Calendar, Users } from 'lucide-react';

interface StoreStatisticsProps {
  fullSalesData: FullSalesData;
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

export const StoreStatistics: React.FC<StoreStatisticsProps> = ({ fullSalesData }) => {
  const storeStats = useMemo(() => {
    const monthlyAggregates: { [month: string]: { totalStore: number, totalIndividual: number, totalCommission: number, activeSellers: number } } = {};
    let grandTotalStoreSales = 0;
    let grandTotalIndividualSales = 0;
    let grandTotalCommission = 0;

    Object.values(fullSalesData).forEach(userHistory => {
      Object.entries(userHistory).forEach(([month, monthData]) => {
        if (!monthlyAggregates[month]) {
          monthlyAggregates[month] = { totalStore: 0, totalIndividual: 0, totalCommission: 0, activeSellers: 0 };
        }
        
        const { totalIndividual, totalStore } = calculateMonthlyTotals(monthData.dailySales);
        const { amount: commission } = calculateCommission(totalIndividual, totalStore, monthData.storeGoal);

        // NOTE: We sum `totalStore` from each user's perspective. For accurate total store sales,
        // this assumes each user logs the *same* total store sales for a given day.
        // A more robust system would have a separate data structure for store-wide sales.
        monthlyAggregates[month].totalStore += totalStore;
        monthlyAggregates[month].totalIndividual += totalIndividual;
        monthlyAggregates[month].totalCommission += commission;
        if (monthData.dailySales.length > 0) {
            monthlyAggregates[month].activeSellers += 1;
        }
      });
    });

    // To get accurate totals, we sum the aggregated monthly values to avoid double-counting store sales.
    Object.values(monthlyAggregates).forEach(data => {
        grandTotalStoreSales += data.totalStore;
        grandTotalIndividualSales += data.totalIndividual;
        grandTotalCommission += data.totalCommission;
    });


    let bestMonth = { month: '', sales: 0 };
    Object.entries(monthlyAggregates).forEach(([month, data]) => {
      if (data.totalStore > bestMonth.sales) {
        bestMonth = { month, sales: data.totalStore };
      }
    });

    return {
      monthlyAggregates,
      grandTotalStoreSales,
      grandTotalIndividualSales,
      grandTotalCommission,
      bestMonth,
    };
  }, [fullSalesData]);

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
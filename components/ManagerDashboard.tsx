import React, { useState, useMemo, useEffect } from 'react';
import type { FullSalesData } from '../types';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { ProgressBar } from './ui/ProgressBar';
import { formatCurrencyBRL } from '../utils/formatters';
import { Target, TrendingUp, Calendar, Hash, Users, Crown, Check, X } from 'lucide-react';
// Removed: import { User } from '@supabase/supabase-js'; // Import Supabase's User type

interface ManagerDashboardProps {
  fullSalesData: FullSalesData;
  storeGoals: { [month: string]: number };
  setStoreGoal: (month: string, goal: number) => void;
  activeMonth: string;
}

const StatCard: React.FC<{ title: string; value: string | number; subValue?: string; icon: React.ReactNode, className?: string }> = ({ title, value, subValue, icon, className }) => (
    <div className={`bg-transparent border border-slate-700/50 p-4 rounded-lg flex items-center gap-4 ${className}`}>
        <div className="p-3 rounded-full bg-slate-600/50 text-sky-400">
            {icon}
        </div>
        <div>
            <p className="text-sm text-slate-400">{title}</p>
            <p className="text-2xl font-bold text-slate-100">{value}</p>
            {subValue && <p className="text-xs text-slate-500">{subValue}</p>}
        </div>
    </div>
);

export const ManagerDashboard: React.FC<ManagerDashboardProps> = ({ fullSalesData, storeGoals, setStoreGoal, activeMonth }) => {
  const currentGoal = storeGoals[activeMonth] || 0;
  
  const [goalInput, setGoalInput] = useState<string>(currentGoal.toString());
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    setGoalInput(currentGoal.toString());
    setIsEditing(false);
  }, [currentGoal, activeMonth]);

  const handleSaveGoal = () => {
    const newGoal = parseFloat(goalInput);
    if (!isNaN(newGoal) && newGoal > 0) {
      setStoreGoal(activeMonth, newGoal);
      setIsEditing(false);
    }
  };
    
  const allUsers = useMemo(() => {
    try {
      // In a real app, you'd fetch this from a database. For now, we'll use a mock or cached data.
      // The `allUsers` in localStorage was a custom implementation, let's adapt to Supabase User structure.
      // For manager dashboard, we'll derive user info from fullSalesData keys and user_metadata if available.
      const users: { [email: string]: { name: string, picture: string } } = {};
      Object.keys(fullSalesData).forEach(email => {
        // This is a placeholder. In a real app, you'd have a way to get user metadata for all users.
        // For now, we'll use a simple derivation or a default.
        users[email] = {
          name: email.split('@')[0].replace('.', ' ').replace(/\b\w/g, l => l.toUpperCase()),
          picture: `https://api.dicebear.com/8.x/initials/svg?seed=${email.split('@')[0]}` 
        };
      });
      return users;
    } catch {
      return {};
    }
  }, [fullSalesData]);

  const monthlyStats = useMemo(() => {
    const salesByDay: { [day: string]: { storeSale: number } } = {};
    const sellerTotals: { [email: string]: { name: string, picture: string, total: number } } = {};
    
    Object.entries(fullSalesData).forEach(([email, userHistory]) => {
      const monthData = userHistory[activeMonth];
      if (monthData?.dailySales.length > 0) {
        let userTotal = 0;
        monthData.dailySales.forEach(sale => {
          userTotal += sale.individualSale;
          if (!salesByDay[sale.date]) {
            salesByDay[sale.date] = { storeSale: 0 };
          }
          salesByDay[sale.date].storeSale = Math.max(salesByDay[sale.date].storeSale, sale.storeSale);
        });
        
        const userInfo = allUsers[email] || { 
          name: email.split('@')[0].replace('.', ' ').replace(/\b\w/g, l => l.toUpperCase()),
          picture: `https://api.dicebear.com/8.x/initials/svg?seed=${email.split('@')[0]}` 
        };

        sellerTotals[email] = {
          name: userInfo.name,
          picture: userInfo.picture,
          total: userTotal
        };
      }
    });

    const totalStoreSales = Object.values(salesByDay).reduce((sum, day) => sum + day.storeSale, 0);
    const daysWithSales = Object.keys(salesByDay).length;
    
    const today = new Date();
    const [year, month] = activeMonth.split('-').map(Number);
    let remainingBusinessDays = 0;
    if(today.getFullYear() > year || (today.getFullYear() === year && today.getMonth() + 1 > month)) {
        remainingBusinessDays = 0;
    } else {
        const lastDayOfMonth = new Date(year, month, 0).getDate();
        const startDay = (today.getFullYear() === year && today.getMonth() + 1 === month) ? today.getDate() : 1;
        for(let day = startDay; day <= lastDayOfMonth; day++) {
            const d = new Date(year, month - 1, day);
            if (d.getDay() !== 0 && d.getDay() !== 6) { // Not Sunday or Saturday
                remainingBusinessDays++;
            }
        }
    }

    const requiredDailyAverage = currentGoal > totalStoreSales && remainingBusinessDays > 0 
      ? (currentGoal - totalStoreSales) / remainingBusinessDays 
      : 0;

    const actualDailyAverage = daysWithSales > 0 ? totalStoreSales / daysWithSales : 0;
    const leaderboard = Object.values(sellerTotals).sort((a,b) => b.total - a.total);

    return { totalStoreSales, requiredDailyAverage, actualDailyAverage, leaderboard, daysWithSales };
  }, [fullSalesData, activeMonth, currentGoal, allUsers]);

  const goalPercentage = currentGoal > 0 ? (monthlyStats.totalStoreSales / currentGoal) * 100 : 0;

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
                <Target className="text-sky-400" size={32} />
                <div>
                    <h3 className="text-lg font-semibold text-slate-200">Meta da Loja para o Mês</h3>
                    {!isEditing ? (
                         <p className="text-3xl font-bold text-sky-400">{formatCurrencyBRL(currentGoal)}</p>
                    ) : (
                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">R$</span>
                                <input
                                type="number"
                                value={goalInput}
                                onChange={(e) => setGoalInput(e.target.value)}
                                className="bg-slate-700/50 border border-slate-600 rounded-md py-2 pl-10 pr-4 text-white placeholder-slate-400 focus:ring-2 focus:ring-sky-500"
                                />
                            </div>
                            <Button onClick={handleSaveGoal} className="p-2"><Check size={16}/></Button>
                            <Button variant="secondary" onClick={() => setIsEditing(false)} className="p-2"><X size={16}/></Button>
                        </div>
                    )}
                </div>
            </div>
            {!isEditing && <Button variant="secondary" onClick={() => setIsEditing(true)}>Definir Meta</Button>}
        </div>
      </Card>
      
      <Card>
        <h3 className="text-xl font-semibold text-slate-200 mb-4">Progresso da Meta</h3>
        <div className="flex justify-between items-end mb-1">
            <span className="text-sm font-medium text-slate-300">Vendido</span>
            <span className="text-sm font-bold text-sky-400">{formatCurrencyBRL(monthlyStats.totalStoreSales)} / {formatCurrencyBRL(currentGoal)}</span>
        </div>
        <ProgressBar percentage={goalPercentage} />
         <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <StatCard title="Média Diária (Necessária)" value={formatCurrencyBRL(monthlyStats.requiredDailyAverage)} icon={<Hash size={20} />} subValue="Para dias úteis restantes" />
            <StatCard title="Média Diária (Realizada)" value={formatCurrencyBRL(monthlyStats.actualDailyAverage)} icon={<TrendingUp size={20} />} subValue={`Em ${monthlyStats.daysWithSales} dias com vendas`} />
            <StatCard title="Dias com Vendas" value={monthlyStats.daysWithSales} icon={<Calendar size={20} />} />
         </div>
      </Card>
      
      <Card>
        <h3 className="text-xl font-semibold text-slate-200 mb-4 flex items-center gap-2"><Users size={20} /> Desempenho dos Vendedores</h3>
        <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
            {monthlyStats.leaderboard.length > 0 ? monthlyStats.leaderboard.map((seller, index) => (
                <div key={seller.name} className="flex items-center gap-4 p-3 bg-transparent border border-slate-700/50 rounded-md">
                    <span className={`font-bold text-lg w-8 text-center ${index === 0 ? 'text-yellow-400' : 'text-slate-400'}`}>{index + 1}</span>
                    <img src={seller.picture} alt={seller.name} className="w-10 h-10 rounded-full" />
                    <div className="flex-grow">
                        <p className="font-semibold text-slate-200">{seller.name}</p>
                        <p className="text-sm text-slate-400">Total Vendido</p>
                    </div>
                    <div className="text-right">
                       <p className="font-bold text-lg text-emerald-400">{formatCurrencyBRL(seller.total)}</p>
                       {index === 0 && <Crown size={20} className="text-yellow-400 inline-block -mt-1" />}
                    </div>
                </div>
            )) : <p className="text-center text-slate-400 py-4">Nenhum vendedor com vendas neste mês.</p>}
        </div>
      </Card>
    </div>
  );
};
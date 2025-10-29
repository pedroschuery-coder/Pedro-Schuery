import React, { useState, useMemo, useEffect } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import type { SalesHistory, FullSalesData, DailySale } from './types';
import { useAuth } from './auth';
import { LoginScreen } from './components/LoginScreen';
import { GoalSetter } from './components/GoalSetter';
import { DailyTracker } from './components/DailyTracker';
import { MonthlySummary } from './components/MonthlySummary';
import { History } from './components/History';
import { Statistics } from './components/Statistics';
import { StoreStatistics } from './components/StoreStatistics';
import { LayoutDashboard, List, BarChart, Clock, Plus, Check, X, Store, LogOut } from 'lucide-react';

const getCurrentMonth = () => new Date().toISOString().slice(0, 7);

const App: React.FC = () => {
  const { currentUser, signOut } = useAuth();
  const [fullData, setFullData] = useLocalStorage<FullSalesData>('salesTrackerData', {});
  const [activeMonth, setActiveMonth] = useState<string>(getCurrentMonth());
  const [activeTab, setActiveTab] = useState<'dashboard' | 'entries' | 'history' | 'stats' | 'store'>('dashboard');

  const [isAddingMonth, setIsAddingMonth] = useState(false);
  const [newMonthValue, setNewMonthValue] = useState(getCurrentMonth());

  const salesHistory = useMemo(() => {
    if (!currentUser) return {};
    return fullData[currentUser.email] || {};
  }, [fullData, currentUser]);

  const setSalesHistory = (updater: React.SetStateAction<SalesHistory>) => {
    if (!currentUser) return;
    setFullData(prevFullData => {
      const currentUserOldData = prevFullData[currentUser.email] || {};
      const currentUserNewData = typeof updater === 'function' ? updater(currentUserOldData) : updater;
      return { ...prevFullData, [currentUser.email]: currentUserNewData };
    });
  };

  useEffect(() => {
    if (currentUser && !salesHistory[activeMonth]) {
      setSalesHistory(prev => ({ ...prev, [activeMonth]: { storeGoal: 0, dailySales: [] } }));
    }
  }, [activeMonth, salesHistory, currentUser]);

  const currentMonthData = useMemo(() => salesHistory[activeMonth] || { storeGoal: 0, dailySales: [] }, [salesHistory, activeMonth]);

  const handleSetStoreGoal = (goal: number) => setSalesHistory(prev => ({ ...prev, [activeMonth]: { ...prev[activeMonth] || { dailySales: [] }, storeGoal: goal } }));
  const handleAddSale = (sale: { individualSale: number; storeSale: number; date: string }) => setSalesHistory(prev => ({ ...prev, [activeMonth]: { ...prev[activeMonth], dailySales: [...(prev[activeMonth]?.dailySales || []), { ...sale, id: Date.now() }] } }));
  
  const handleDeleteSale = (saleIdToDelete: number) => {
    setSalesHistory(prevHistory => {
      // Return previous state if the month doesn't exist to avoid creating empty objects
      if (!prevHistory[activeMonth]) {
        return prevHistory;
      }
      
      const newHistory = {
        ...prevHistory,
        [activeMonth]: {
          ...prevHistory[activeMonth],
          dailySales: prevHistory[activeMonth].dailySales.filter(sale => sale.id !== saleIdToDelete),
        },
      };
      
      return newHistory;
    });
  };
  
  const allMonths = useMemo(() => {
    const months = Object.keys(salesHistory);
    if (!months.includes(getCurrentMonth())) months.push(getCurrentMonth());
    return months.sort().reverse();
  }, [salesHistory]);

  const handleAddMonthConfirm = () => {
    if (!newMonthValue) return;
    if (allMonths.includes(newMonthValue)) setActiveMonth(newMonthValue);
    else setSalesHistory(prev => ({ ...prev, [newMonthValue]: { storeGoal: 0, dailySales: [] } }));
    setActiveMonth(newMonthValue);
    setIsAddingMonth(false);
  };

  if (!currentUser) {
    return <LoginScreen />;
  }

  const TabButton = ({ tab, label, icon }: { tab: string; label: string; icon: React.ReactNode }) => (
    <button onClick={() => setActiveTab(tab as any)} className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === tab ? 'bg-sky-600 text-white' : 'text-slate-300 hover:bg-slate-700/50'}`}>
      {icon}<span className="hidden sm:inline">{label}</span>
    </button>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <div className="grid grid-cols-1 lg:grid-cols-3 gap-6"><div className="lg:col-span-2"><MonthlySummary dailySales={currentMonthData.dailySales} storeGoal={currentMonthData.storeGoal} /></div><div><GoalSetter currentGoal={currentMonthData.storeGoal} setStoreGoal={handleSetStoreGoal} /></div></div>;
      case 'entries': return <DailyTracker addSale={handleAddSale} dailySales={currentMonthData.dailySales} deleteSale={handleDeleteSale} activeMonth={activeMonth} />;
      case 'history': return <History salesHistory={salesHistory} />;
      case 'stats': return <Statistics salesHistory={salesHistory} activeMonth={activeMonth} />;
      case 'store': return <StoreStatistics fullSalesData={fullData} />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <h1 className="text-3xl font-bold text-slate-100">Controle de Comissão</h1>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 text-right">
                <div>
                  <div className="font-semibold text-slate-200">{currentUser.name}</div>
                  <div className="text-xs text-slate-400">{currentUser.email}</div>
                </div>
                <img src={currentUser.picture} alt="User" className="w-10 h-10 rounded-full" />
              </div>
              <button onClick={signOut} className="p-2 bg-red-600/50 hover:bg-red-600 rounded-md transition-colors" title="Sair"><LogOut size={16} /></button>
            </div>
          </div>
          <div className="mt-4 flex flex-col sm:flex-row justify-between items-center gap-2">
            <div className="flex items-center gap-2">
              {!isAddingMonth ? (
                <>
                  <div>
                    <label htmlFor="month-select" className="text-sm mr-2 text-slate-400">Mês Ativo:</label>
                    <select id="month-select" value={activeMonth} onChange={e => setActiveMonth(e.target.value)} className="bg-slate-800 border border-slate-700 rounded-md py-1 px-2 text-white focus:ring-2 focus:ring-sky-500">
                      {allMonths.map(month => <option key={month} value={month}>{new Date(month + '-02').toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}</option>)}
                    </select>
                  </div>
                  <button onClick={() => setIsAddingMonth(true)} className="p-2 bg-slate-700 hover:bg-slate-600 rounded-md transition-colors" title="Adicionar Mês"><Plus size={16} /></button>
                </>
              ) : (
                <div className="flex items-center gap-2 bg-slate-800 p-2 rounded-lg border border-slate-700">
                  <input type="month" value={newMonthValue} onChange={e => setNewMonthValue(e.target.value)} className="bg-slate-700 border border-slate-600 rounded-md py-1 px-2 text-white focus:ring-2 focus:ring-sky-500" />
                  <button onClick={handleAddMonthConfirm} className="p-2 bg-emerald-600 hover:bg-emerald-500 rounded-md transition-colors" title="Confirmar"><Check size={16} /></button>
                  <button onClick={() => setIsAddingMonth(false)} className="p-2 bg-red-600 hover:bg-red-500 rounded-md transition-colors" title="Cancelar"><X size={16} /></button>
                </div>
              )}
            </div>
          </div>
        </header>

        <nav className="mb-6 bg-slate-800/50 p-2 rounded-lg border border-slate-700/50 flex flex-wrap gap-2">
            <TabButton tab="dashboard" label="Dashboard" icon={<LayoutDashboard size={16} />} />
            <TabButton tab="entries" label="Lançamentos" icon={<List size={16} />} />
            <TabButton tab="history" label="Histórico" icon={<Clock size={16} />} />
            <TabButton tab="stats" label="Estatísticas" icon={<BarChart size={16} />} />
            <TabButton tab="store" label="Loja" icon={<Store size={16} />} />
        </nav>

        <main>{renderContent()}</main>
      </div>
    </div>
  );
};

export default App;
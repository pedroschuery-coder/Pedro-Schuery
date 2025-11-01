import React, { useState, useMemo, useEffect } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import type { SalesHistory, UserRole, FullSalesData } from './types';
import { RoleSelectionScreen } from './components/RoleSelectionScreen';
import { DailyTracker } from './components/DailyTracker';
import { MonthlySummary } from './components/MonthlySummary';
import { History } from './components/History';
import { Statistics } from './components/Statistics';
import { StoreStatistics } from './components/StoreStatistics';
import { ManagerDashboard } from './components/ManagerDashboard';
import { LayoutDashboard, List, BarChart, Clock, Plus, Check, X, Store, Repeat, LogOut } from 'lucide-react';
import { useAuth } from './auth';
import LoginScreen from './src/components/LoginScreen'; // Caminho de importação corrigido

const getCurrentMonth = () => new Date().toISOString().slice(0, 7);

const App: React.FC = () => {
  const { currentUser, signOut } = useAuth();

  const [fullSalesData, setFullSalesData] = useLocalStorage<FullSalesData>('fullSalesData', {});
  const [storeGoals, setStoreGoals] = useLocalStorage<{ [month: string]: number }>('storeGoalsData', {});

  const salesHistory = useMemo(() => (currentUser ? fullSalesData[currentUser.email!] : {}) || {}, [fullSalesData, currentUser]);
  
  const setSalesHistory = (updater: React.SetStateAction<SalesHistory>) => {
    if (!currentUser) return;
    setFullSalesData(prevFullData => {
      const currentHistory = prevFullData[currentUser.email!] || {};
      const newHistory = typeof updater === 'function' ? updater(currentHistory) : updater;
      return {
        ...prevFullData,
        [currentUser.email!]: newHistory
      };
    });
  };

  const [userRole, setUserRole] = useState<UserRole | null>(() => sessionStorage.getItem('userRole') as UserRole | null);
  const handleSetRole = (role: UserRole) => {
    sessionStorage.setItem('userRole', role);
    setUserRole(role);
  };
  const clearRole = () => {
      sessionStorage.removeItem('userRole');
      sessionStorage.removeItem('currentUser'); // Also clear current user from session storage
      setUserRole(null);
  }

  const [activeMonth, setActiveMonth] = useState<string>(getCurrentMonth());
  const [activeTab, setActiveTab] = useState<'dashboard' | 'entries' | 'history' | 'stats' | 'store'>('dashboard');
  const [isAddingMonth, setIsAddingMonth] = useState(false);
  const [newMonthValue, setNewMonthValue] = useState(getCurrentMonth());
  
  useEffect(() => {
    if (userRole === 'vendedor' && currentUser && !salesHistory[activeMonth]) {
      setSalesHistory(prev => ({ ...prev, [activeMonth]: { storeGoal: 0, dailySales: [] } }));
    }
  }, [activeMonth, salesHistory, userRole, currentUser]);

  const handleSetGlobalStoreGoal = (month: string, goal: number) => {
    setStoreGoals(prev => ({...prev, [month]: goal}));
  };

  const handleAddSale = (sale: { individualSale: number; storeSale: number; date: string }) => {
    setSalesHistory(prev => ({ ...prev, [activeMonth]: { ...prev[activeMonth], dailySales: [...(prev[activeMonth]?.dailySales || []), { ...sale, id: Date.now() }] } }));
  }
  
  const handleUpdateSale = (saleIdToUpdate: number, newSaleData: { individualSale: number; storeSale: number; date: string }) => {
    setSalesHistory(prevHistory => {
      if (!prevHistory[activeMonth]) return prevHistory;
      const newDailySales = prevHistory[activeMonth].dailySales.map(sale => sale.id === saleIdToUpdate ? { ...sale, ...newSaleData } : sale);
      return { ...prevHistory, [activeMonth]: { ...prevHistory[activeMonth], dailySales: newDailySales } };
    });
  };
  
  const allMonths = useMemo(() => {
    const months = userRole === 'gestor' 
      ? Object.keys(storeGoals).concat(Object.values(fullSalesData).flatMap(h => Object.keys(h)))
      : Object.keys(salesHistory);
    const uniqueMonths = [...new Set(months)];
    if (!uniqueMonths.includes(getCurrentMonth())) uniqueMonths.push(getCurrentMonth());
    return uniqueMonths.sort().reverse();
  }, [salesHistory, userRole, storeGoals, fullSalesData]);

  const handleAddMonthConfirm = () => {
    if (!newMonthValue) return;
    if (!allMonths.includes(newMonthValue) && userRole === 'vendedor') {
      setSalesHistory(prev => ({ ...prev, [newMonthValue]: { storeGoal: 0, dailySales: [] } }));
    }
    setActiveMonth(newMonthValue);
    setIsAddingMonth(false);
  };
  
  if (!currentUser) {
    return <LoginScreen />;
  }

  if (!userRole) {
    return <RoleSelectionScreen username={currentUser.user_metadata?.name || currentUser.email!} onSelectRole={handleSetRole} />;
  }

  const AppHeader = ({ children }: {children?: React.ReactNode}) => (
    <header className="mb-8">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-3xl font-bold text-slate-100">Controle de Comissão</h1>
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="text-right">
            <div className="font-semibold text-slate-200">{currentUser.user_metadata?.name || currentUser.email}</div>
            <div className="text-xs text-slate-400">Modo: <span className="font-bold text-sky-400 capitalize">{userRole}</span></div>
          </div>
          <button onClick={clearRole} className="p-2 bg-slate-700 hover:bg-slate-600 rounded-md transition-colors" title="Trocar Perfil"><Repeat size={16} /></button>
          <button onClick={signOut} className="p-2 bg-slate-700 hover:bg-red-600/50 rounded-md transition-colors" title="Sair"><LogOut size={16} /></button>
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
        {children}
      </div>
    </header>
  );

  if (userRole === 'gestor') {
    return (
      <div className="min-h-screen bg-slate-900 text-white p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <AppHeader />
          <main>
            <ManagerDashboard 
              fullSalesData={fullSalesData}
              storeGoals={storeGoals}
              setStoreGoal={handleSetGlobalStoreGoal}
              activeMonth={activeMonth}
            />
          </main>
        </div>
      </div>
    );
  }

  if (userRole === 'vendedor') {
    const currentMonthData = salesHistory[activeMonth] || { dailySales: [] };
    const globalStoreGoal = storeGoals[activeMonth] || 0;

    const TabButton = ({ tab, label, icon }: { tab: string; label: string; icon: React.ReactNode }) => (
      <button onClick={() => setActiveTab(tab as any)} className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === tab ? 'bg-sky-600 text-white' : 'text-slate-300 hover:bg-slate-700/50'}`}>
        {icon}<span className="hidden sm:inline">{label}</span>
      </button>
    );

    const renderContent = () => {
      switch (activeTab) {
        case 'dashboard': return <MonthlySummary dailySales={currentMonthData.dailySales} storeGoal={globalStoreGoal} activeMonth={activeMonth} />;
        case 'entries': return <DailyTracker addSale={handleAddSale} dailySales={currentMonthData.dailySales} updateSale={handleUpdateSale} activeMonth={activeMonth} />;
        case 'history': return <History salesHistory={salesHistory} storeGoals={storeGoals}/>;
        case 'stats': return <Statistics salesHistory={salesHistory} activeMonth={activeMonth} storeGoals={storeGoals}/>;
        case 'store': return <StoreStatistics fullSalesData={fullSalesData} storeGoals={storeGoals} />;
        default: return null;
      }
    };
    
    return (
      <div className="min-h-screen bg-slate-900 text-white p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <AppHeader />
          <nav className="mb-6 bg-transparent p-2 rounded-lg border border-slate-700/50 flex flex-wrap gap-2">
              <TabButton tab="dashboard" label="Dashboard" icon={<LayoutDashboard size={16} />} />
              <TabButton tab="entries" label="Lançamentos" icon={<List size={16} />} />
              <TabButton tab="history" label="Histórico" icon={<Clock size={16} />} />
              <TabButton tab="stats" label="Estatísticas" icon={<BarChart size={16} />} />
              <TabButton tab="store" label="Loja (Outros)" icon={<Store size={16} />} />
          </nav>
          <main>{renderContent()}</main>
        </div>
      </div>
    );
  }

  return null;
};

export default App;
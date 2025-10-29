import React, { useState, useMemo, useEffect } from 'react';
import type { DailySale } from '../types';
import { Card } from './ui/Card';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { formatCurrencyBRL } from '../utils/formatters';
import { PlusCircle, Trash2, List } from 'lucide-react';

interface DailyTrackerProps {
  addSale: (sale: { individualSale: number; storeSale: number; date: string }) => void;
  dailySales: DailySale[];
  deleteSale: (id: number) => void;
  activeMonth: string; // "YYYY-MM"
}

export const DailyTracker: React.FC<DailyTrackerProps> = ({ addSale, dailySales, deleteSale, activeMonth }) => {
  const [individualSale, setIndividualSale] = useState('');
  const [storeSale, setStoreSale] = useState('');
  
  // Helper to get today's date in YYYY-MM-DD format
  const getTodayString = () => new Date().toISOString().slice(0, 10);
  
  const [saleDate, setSaleDate] = useState(getTodayString());

  const { minDate, maxDate } = useMemo(() => {
    const [year, month] = activeMonth.split('-').map(Number);
    const firstDay = new Date(year, month - 1, 1).toISOString().slice(0, 10);
    const lastDay = new Date(year, month, 0).toISOString().slice(0, 10);
    return { minDate: firstDay, maxDate: lastDay };
  }, [activeMonth]);

  // Effect to reset date if it falls outside the new active month's range
  useEffect(() => {
    const today = getTodayString();
    if (today >= minDate && today <= maxDate) {
      setSaleDate(today);
    } else {
      setSaleDate(maxDate); // Default to the last day of the active month if today is not in it
    }
  }, [minDate, maxDate]);


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const indSale = parseFloat(individualSale);
    const strSale = parseFloat(storeSale);

    if (!isNaN(indSale) && indSale > 0 && !isNaN(strSale) && strSale > 0 && saleDate) {
      addSale({
        individualSale: indSale,
        storeSale: strSale,
        date: saleDate,
      });
      setIndividualSale('');
      setStoreSale('');
    } else {
        alert('Por favor, preencha todos os campos com valores numéricos positivos.');
    }
  };
  
  const sortedSales = useMemo(() => {
    return [...dailySales].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [dailySales]);

  const handleDeleteClick = (saleId: number) => {
    if (window.confirm('Tem certeza que deseja excluir este lançamento?')) {
      deleteSale(saleId);
    }
  };

  return (
    <Card className="flex flex-col h-full">
      <h2 className="text-2xl font-bold text-slate-200 mb-4 flex items-center gap-2">
        <List size={24} /> Lançamentos Diários
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4 mb-6 p-4 bg-slate-900/50 rounded-lg border border-slate-700">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            id="individualSale"
            label="Sua Venda"
            type="number"
            step="0.01"
            min="0.01"
            value={individualSale}
            onChange={(e) => setIndividualSale(e.target.value)}
            placeholder="Ex: 2500.50"
            required
          />
          <Input
            id="storeSale"
            label="Venda da Loja"
            type="number"
            step="0.01"
            min="0.01"
            value={storeSale}
            onChange={(e) => setStoreSale(e.target.value)}
            placeholder="Ex: 10000.00"
            required
          />
        </div>
        <div>
          <label htmlFor="saleDate" className="block text-sm font-medium text-slate-300 mb-2">
            Data da Venda
          </label>
          <input
            id="saleDate"
            type="date"
            value={saleDate}
            onChange={(e) => setSaleDate(e.target.value)}
            min={minDate}
            max={maxDate}
            className="w-full bg-slate-700/50 border border-slate-600 rounded-md py-2 px-3 text-white placeholder-slate-400 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition"
            required
          />
        </div>
        <Button type="submit" className="w-full">
          <PlusCircle size={16} /> Adicionar Lançamento
        </Button>
      </form>
      
      <div className="flex-grow overflow-y-auto space-y-3 pr-2 -mr-2" style={{maxHeight: '400px'}}>
        {sortedSales.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-center text-slate-400 py-4">Nenhum lançamento para este mês.</p>
          </div>
        ) : (
          sortedSales.map(sale => (
            <div key={sale.id} className="flex items-center justify-between bg-slate-700/50 p-3 rounded-md transition-colors hover:bg-slate-700">
              <div>
                <p className="font-semibold text-slate-200">{new Date(sale.date).toLocaleDateString('pt-BR', { timeZone: 'UTC', day: '2-digit', month: '2-digit' })}</p>
                <div className="text-sm text-slate-400 mt-1 space-y-1">
                    <p>
                        Sua Venda: <span className="font-medium text-emerald-400">{formatCurrencyBRL(sale.individualSale)}</span>
                    </p>
                    <p>
                        Venda Loja: <span className="font-medium text-sky-400">{formatCurrencyBRL(sale.storeSale)}</span>
                    </p>
                </div>
              </div>
              <Button variant="danger" onClick={() => handleDeleteClick(sale.id)} className="!p-2 h-8 w-8 min-w-0 flex-shrink-0">
                <Trash2 size={16} />
              </Button>
            </div>
          ))
        )}
      </div>
    </Card>
  );
};
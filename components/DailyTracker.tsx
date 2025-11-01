import React, { useState, useMemo, useEffect } from 'react';
import type { DailySale } from '../types';
import { Card } from './ui/Card';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { formatCurrencyBRL } from '../utils/formatters';
import { PlusCircle, Pencil, List, Save, XCircle } from 'lucide-react';

interface DailyTrackerProps {
  addSale: (sale: { individualSale: number; storeSale: number; date: string }) => void;
  dailySales: DailySale[];
  updateSale: (id: number, data: { individualSale: number; storeSale: number; date: string }) => void;
  activeMonth: string; // "YYYY-MM"
}

export const DailyTracker: React.FC<DailyTrackerProps> = ({ addSale, dailySales, updateSale, activeMonth }) => {
  const [individualSale, setIndividualSale] = useState('');
  const [storeSale, setStoreSale] = useState('');
  const [editingSaleId, setEditingSaleId] = useState<number | null>(null);
  
  const getTodayString = () => new Date().toISOString().slice(0, 10);
  
  const [saleDate, setSaleDate] = useState(getTodayString());

  const { minDate, maxDate } = useMemo(() => {
    const [year, month] = activeMonth.split('-').map(Number);
    const firstDay = new Date(year, month - 1, 1).toISOString().slice(0, 10);
    const lastDay = new Date(year, month, 0).toISOString().slice(0, 10);
    return { minDate: firstDay, maxDate: lastDay };
  }, [activeMonth]);

  const resetDate = () => {
    const today = getTodayString();
    if (today >= minDate && today <= maxDate) {
      setSaleDate(today);
    } else {
      setSaleDate(maxDate);
    }
  };

  useEffect(() => {
    if (!editingSaleId) {
      resetDate();
    }
  }, [minDate, maxDate, editingSaleId]);

  const resetForm = () => {
    setIndividualSale('');
    setStoreSale('');
    setEditingSaleId(null);
    resetDate();
  };

  const handleEditClick = (sale: DailySale) => {
    setEditingSaleId(sale.id);
    setIndividualSale(sale.individualSale.toString());
    setStoreSale(sale.storeSale.toString());
    setSaleDate(sale.date);
  };
  
  const handleCancelEdit = () => {
    resetForm();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const indSale = parseFloat(individualSale);
    const strSale = parseFloat(storeSale);

    if (!isNaN(indSale) && indSale > 0 && !isNaN(strSale) && strSale > 0 && saleDate) {
      const saleData = {
        individualSale: indSale,
        storeSale: strSale,
        date: saleDate,
      };
      
      if (editingSaleId !== null) {
        updateSale(editingSaleId, saleData);
      } else {
        addSale(saleData);
      }
      resetForm();
    } else {
        alert('Por favor, preencha todos os campos com valores numéricos positivos.');
    }
  };
  
  const sortedSales = useMemo(() => {
    return [...dailySales].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [dailySales]);


  return (
    <Card className="flex flex-col h-full">
      <h2 className="text-2xl font-bold text-slate-200 mb-4 flex items-center gap-2">
        <List size={24} /> 
        {editingSaleId ? 'Editar Lançamento' : 'Lançamentos Diários'}
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
        <div className="flex flex-col sm:flex-row gap-2">
            <Button type="submit" className="w-full">
                {editingSaleId ? <><Save size={16} /> Salvar Alterações</> : <><PlusCircle size={16} /> Adicionar Lançamento</>}
            </Button>
            {editingSaleId && (
                <Button type="button" variant="secondary" onClick={handleCancelEdit} className="w-full sm:w-auto">
                    <XCircle size={16}/> Cancelar
                </Button>
            )}
        </div>
      </form>
      
      <div className="flex-grow overflow-y-auto space-y-3 pr-2 -mr-2" style={{maxHeight: '400px'}}>
        {sortedSales.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-center text-slate-400 py-4">Nenhum lançamento para este mês.</p>
          </div>
        ) : (
          sortedSales.map(sale => (
            <div key={sale.id} className={`flex items-center justify-between p-3 rounded-md transition-all duration-300 ${editingSaleId === sale.id ? 'bg-sky-900/50 ring-2 ring-sky-500' : 'bg-slate-700/50 hover:bg-slate-700'}`}>
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
              <Button
                  variant="secondary"
                  onClick={() => handleEditClick(sale)}
                  aria-label="Editar lançamento"
                  className="p-2 h-8 w-8 flex-shrink-0"
                  disabled={editingSaleId === sale.id}
                >
                <Pencil size={16} />
              </Button>
            </div>
          ))
        )}
      </div>
    </Card>
  );
};
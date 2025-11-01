import React from 'react';
import type { UserRole } from '../types';
import { Briefcase, BarChartBig } from 'lucide-react';

interface RoleSelectionScreenProps {
  username: string;
  onSelectRole: (role: UserRole) => void;
}

export const RoleSelectionScreen: React.FC<RoleSelectionScreenProps> = ({ username, onSelectRole }) => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-900 text-white p-4">
      <div className="text-center p-8 md:p-12 bg-slate-800/50 rounded-xl border border-slate-700/50 shadow-lg max-w-2xl w-full">
        <h1 className="text-3xl md:text-4xl font-bold mb-2 text-slate-100">Bem-vindo(a), {username}!</h1>
        <p className="text-slate-400 mb-10">Para continuar, selecione o seu perfil.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <button
            onClick={() => onSelectRole('vendedor')}
            className="group p-8 bg-slate-700/50 hover:bg-sky-600/50 rounded-lg border border-slate-600 hover:border-sky-500 transition-all duration-300 transform hover:scale-105"
          >
            <Briefcase className="w-16 h-16 mx-auto mb-4 text-sky-400 group-hover:text-white transition-colors" />
            <h2 className="text-2xl font-semibold text-white">Vendedor</h2>
            <p className="text-slate-400 mt-2">Lançar vendas diárias e acompanhar minhas comissões.</p>
          </button>
          
          <button
            onClick={() => onSelectRole('gestor')}
            className="group p-8 bg-slate-700/50 hover:bg-emerald-600/50 rounded-lg border border-slate-600 hover:border-emerald-500 transition-all duration-300 transform hover:scale-105"
          >
            <BarChartBig className="w-16 h-16 mx-auto mb-4 text-emerald-400 group-hover:text-white transition-colors" />
            <h2 className="text-2xl font-semibold text-white">Gestor</h2>
            <p className="text-slate-400 mt-2">Visualizar estatísticas da loja e definir metas.</p>
          </button>
        </div>
      </div>
    </div>
  );
};
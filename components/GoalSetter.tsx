import React, { useState } from 'react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { formatCurrencyBRL } from '../utils/formatters';
import { Target } from 'lucide-react';

interface GoalSetterProps {
  currentGoal: number;
  setStoreGoal: (goal: number) => void;
}

export const GoalSetter: React.FC<GoalSetterProps> = ({ currentGoal, setStoreGoal }) => {
  const [goalInput, setGoalInput] = useState<string>(currentGoal.toString());
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = () => {
    const newGoal = parseFloat(goalInput);
    if (!isNaN(newGoal) && newGoal > 0) {
      setStoreGoal(newGoal);
      setIsEditing(false);
    }
  };

  return (
    <Card>
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
            <div className="bg-sky-500/10 p-2 rounded-full border border-sky-500/30">
                <Target className="text-sky-400" size={24} />
            </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-200">Meta Mensal da Loja</h3>
            {!isEditing ? (
              <p className="text-2xl font-bold text-sky-400">{formatCurrencyBRL(currentGoal)}</p>
            ) : (
                <div className="relative mt-1">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">R$</span>
                    <input
                        type="number"
                        value={goalInput}
                        onChange={(e) => setGoalInput(e.target.value)}
                        className="w-full bg-slate-700/50 border border-slate-600 rounded-md py-2 pl-10 pr-4 text-white placeholder-slate-400 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition"
                        placeholder="Digite a nova meta"
                    />
              </div>
            )}
          </div>
        </div>
        {isEditing ? (
            <div className="flex gap-2">
                <Button onClick={handleSave}>Salvar</Button>
                <Button variant="secondary" onClick={() => { setIsEditing(false); setGoalInput(currentGoal.toString()); }}>Cancelar</Button>
            </div>
        ) : (
          <Button variant="secondary" onClick={() => setIsEditing(true)}>Editar Meta</Button>
        )}
      </div>
    </Card>
  );
};
import React, { useState, useEffect } from 'react';
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
  const [justSaved, setJustSaved] = useState(false);

  useEffect(() => {
    if (!isEditing) {
      setGoalInput(currentGoal.toString());
    }
  }, [currentGoal, isEditing]);

  const handleSave = () => {
    const newGoal = parseFloat(goalInput);
    if (!isNaN(newGoal) && newGoal > 0) {
      setStoreGoal(newGoal);
      setIsEditing(false);
      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 1200);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setGoalInput(currentGoal.toString());
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  return (
    <Card>
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-grow">
          <div className="bg-sky-500/10 p-2 rounded-full border border-sky-500/30 shrink-0">
            <Target className="text-sky-400" size={24} />
          </div>
          <div className="flex-grow">
            <h3 className="text-lg font-semibold text-slate-200">Meta Mensal da Loja</h3>
            <div className="relative h-10 mt-1">
              {/* Display View */}
              <div className={`absolute inset-0 flex items-center transition-all duration-300 ease-in-out ${isEditing ? 'opacity-0 scale-95 -translate-y-2 pointer-events-none' : 'opacity-100 scale-100 translate-y-0'}`}>
                <p className={`text-2xl font-bold transition-all duration-500 origin-left transform ${justSaved ? 'text-emerald-400 scale-105' : 'text-sky-400 scale-100'}`}>
                  {formatCurrencyBRL(currentGoal)}
                </p>
              </div>

              {/* Edit View */}
              <div className={`absolute inset-0 transition-all duration-300 ease-in-out ${!isEditing ? 'opacity-0 scale-95 translate-y-2 pointer-events-none' : 'opacity-100 scale-100 translate-y-0'}`}>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">R$</span>
                  <input
                    type="number"
                    value={goalInput}
                    onChange={(e) => setGoalInput(e.target.value)}
                    className="w-full bg-slate-700/50 border border-slate-600 rounded-md py-2 pl-10 pr-4 text-white placeholder-slate-400 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition"
                    placeholder="Digite a nova meta"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="relative h-10 w-full sm:w-auto mt-2 sm:mt-0 flex-shrink-0">
          {/* Edit Button */}
          <div className={`absolute inset-0 transition-all duration-300 ease-in-out flex justify-end ${isEditing ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'}`}>
            <Button variant="secondary" onClick={handleEditClick}>Editar Meta</Button>
          </div>

          {/* Save/Cancel Buttons */}
          <div className={`absolute inset-0 transition-all duration-300 ease-in-out flex gap-2 justify-end ${!isEditing ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'}`}>
            <Button onClick={handleSave}>Salvar</Button>
            <Button variant="secondary" onClick={handleCancel}>Cancelar</Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

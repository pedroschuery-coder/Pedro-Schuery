export interface CommissionTier {
  min: number;
  max: number;
  rate: number;
}

export interface DailySale {
  id: number;
  date: string;
  individualSale: number;
  storeSale: number;
}

export interface MonthlyData {
  storeGoal: number;
  dailySales: DailySale[];
}

export interface SalesHistory {
  [month: string]: MonthlyData; // ex: "2024-07"
}

// New types for multi-user support
export interface FullSalesData {
  [email: string]: SalesHistory;
}

export type UserRole = 'vendedor' | 'gestor';

// Fix: Add and export the User interface, which is used in auth.tsx.
export interface User {
  name: string;
  email: string;
  picture: string;
}

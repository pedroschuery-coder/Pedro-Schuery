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
export interface User {
  email: string;
  name: string;
  picture: string;
}

export interface FullSalesData {
  [email: string]: SalesHistory;
}
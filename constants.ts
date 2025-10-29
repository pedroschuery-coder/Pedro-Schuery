
import type { CommissionTier } from './types';

export const COMMISSION_TIERS: CommissionTier[] = [
  { min: 50000.01, max: 60000, rate: 0.0060 },
  { min: 60000.01, max: 70000, rate: 0.0065 },
  { min: 70000.01, max: 80000, rate: 0.0070 },
  { min: 80000.01, max: 90000, rate: 0.0075 },
  { min: 90000.01, max: 100000, rate: 0.0080 },
  { min: 100000.01, max: 110000, rate: 0.0085 },
  { min: 110000.01, max: 120000, rate: 0.0090 },
  { min: 120000.01, max: 130000, rate: 0.0095 },
  { min: 130000.01, max: 140000, rate: 0.0100 },
  { min: 140000.01, max: 150000, rate: 0.0105 },
  { min: 150000.01, max: 160000, rate: 0.0110 },
  { min: 160000.01, max: 170000, rate: 0.0115 },
  { min: 170000.01, max: 180000, rate: 0.0120 },
  { min: 180000.01, max: 190000, rate: 0.0125 },
  { min: 190000.01, max: 200000, rate: 0.0130 },
];

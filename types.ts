export interface Fluid {
  id: string;
  name: string;
  density: number; // kg/m3
  viscosityHint: string;
}

export interface PumpType {
  id: string;
  name: string;
  typicalEfficiency: number; // 0-1 scale
  description: string;
}

export interface CalculationResult {
  hydraulicPowerKw: number;
  shaftPowerKw: number;
  motorPowerKw: number; // Including safety margin
  recommendedIecMotorKw: number; // Nearest standard IEC motor
  flowM3s: number;
  pressureBar: number;
}

export interface RecommendationData {
  flow: number;
  head: number;
  fluidName: string;
  motorPower: number;
  pumpType: string;
}
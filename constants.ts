import { Fluid, PumpType } from './types';

export const FLUIDS: Fluid[] = [
  { id: 'water', name: 'Voda (čistá)', density: 1000, viscosityHint: 'Nízká' },
  { id: 'seawater', name: 'Mořská voda', density: 1025, viscosityHint: 'Nízká' },
  { id: 'oil_light', name: 'Lehký olej', density: 850, viscosityHint: 'Střední' },
  { id: 'oil_heavy', name: 'Těžký olej / Mazut', density: 950, viscosityHint: 'Vysoká' },
  { id: 'gasoline', name: 'Benzín', density: 750, viscosityHint: 'Nízká' },
  { id: 'milk', name: 'Mléko', density: 1030, viscosityHint: 'Střední' },
  { id: 'sludge', name: 'Kal (tekutý)', density: 1200, viscosityHint: 'Vysoká' },
];

export const PUMP_TYPES: PumpType[] = [
  { id: 'centrifugal', name: 'Odstředivé čerpadlo', typicalEfficiency: 0.75, description: 'Běžné pro vodu a nízkou viskozitu.' },
  { id: 'piston', name: 'Pístové čerpadlo', typicalEfficiency: 0.85, description: 'Vysoký tlak, přesné dávkování.' },
  { id: 'gear', name: 'Zubové čerpadlo', typicalEfficiency: 0.80, description: 'Pro oleje a viskózní látky.' },
  { id: 'submersible', name: 'Ponorné čerpadlo', typicalEfficiency: 0.65, description: 'Pro čerpání ze studní a vrtů.' },
  { id: 'screw', name: 'Vřetenové čerpadlo', typicalEfficiency: 0.70, description: 'Šetrné k médiu, pro kaly.' },
];

// Standard IEC 60034 motor power ratings (kW)
export const IEC_MOTOR_POWERS: number[] = [
  0.06, 0.09, 0.12, 0.18, 0.25, 0.37, 0.55, 0.75, 
  1.1, 1.5, 2.2, 3, 4, 5.5, 7.5, 
  11, 15, 18.5, 22, 30, 37, 45, 55, 75, 90, 
  110, 132, 160, 200, 250, 315, 355, 400
];

export const GRAVITY = 9.81; // m/s^2
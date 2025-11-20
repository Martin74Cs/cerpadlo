import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import ResultsChart from './components/ResultsChart';
import MathDisplay from './components/MathDisplay';
import PrintReport from './components/PrintReport';
import { FLUIDS, PUMP_TYPES, GRAVITY, IEC_MOTOR_POWERS } from './constants';
import { CalculationResult } from './types';

const App: React.FC = () => {
  // State for Inputs
  const [selectedFluidId, setSelectedFluidId] = useState<string>(FLUIDS[0].id);
  const [selectedPumpId, setSelectedPumpId] = useState<string>(PUMP_TYPES[0].id);
  const [flowRate, setFlowRate] = useState<number>(10); // m3/h
  const [head, setHead] = useState<number>(20); // meters
  const [efficiency, setEfficiency] = useState<number>(PUMP_TYPES[0].typicalEfficiency * 100); // percent
  const [safetyMargin, setSafetyMargin] = useState<number>(15); // percent
  
  // State for UI
  const [showFormulas, setShowFormulas] = useState<boolean>(false);
  const [showReport, setShowReport] = useState<boolean>(false);
  
  // State for Outputs
  const [result, setResult] = useState<CalculationResult | null>(null);
  
  // Derived values for easy access
  const currentFluid = FLUIDS.find(f => f.id === selectedFluidId) || FLUIDS[0];
  const currentPump = PUMP_TYPES.find(p => p.id === selectedPumpId) || PUMP_TYPES[0];

  const handlePumpChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newPumpId = e.target.value;
    setSelectedPumpId(newPumpId);
    const pump = PUMP_TYPES.find(p => p.id === newPumpId);
    if (pump) {
      setEfficiency(pump.typicalEfficiency * 100);
    }
  };

  const calculate = useCallback(() => {
    // 1. Convert units
    // Flow Q: m3/h -> m3/s
    const flowM3s = flowRate / 3600;
    
    // 2. Hydraulic Power Ph (kW)
    // Ph = (rho * g * Q * H) / 1000
    // rho (kg/m3), g (m/s2), Q (m3/s), H (m)
    const hydraulicPowerKw = (currentFluid.density * GRAVITY * flowM3s * head) / 1000;

    // 3. Shaft Power Ps (kW)
    const effDecimal = efficiency / 100;
    const shaftPowerKw = hydraulicPowerKw / (effDecimal > 0 ? effDecimal : 0.01);

    // 4. Motor Power Pm (kW) with dynamic safety factor
    const marginMultiplier = 1 + (safetyMargin / 100);
    const motorPowerKw = shaftPowerKw * marginMultiplier;

    // 5. Find nearest IEC standard motor (must be >= motorPowerKw)
    const recommendedIecMotorKw = IEC_MOTOR_POWERS.find(p => p >= motorPowerKw) || IEC_MOTOR_POWERS[IEC_MOTOR_POWERS.length - 1];

    // 6. Pressure approx (bar) = (rho * g * H) / 100,000
    const pressureBar = (currentFluid.density * GRAVITY * head) / 100000;

    setResult({
      hydraulicPowerKw,
      shaftPowerKw,
      motorPowerKw,
      recommendedIecMotorKw,
      flowM3s,
      pressureBar
    });
  }, [flowRate, head, efficiency, currentFluid.density, safetyMargin]);

  useEffect(() => {
    calculate();
  }, [calculate]);

  // Show Report View instead of calculator
  if (showReport) {
    return (
      <PrintReport 
        result={result}
        inputs={{
          flowRate,
          head,
          efficiency,
          safetyMargin,
          fluid: currentFluid,
          pump: currentPump
        }}
        onClose={() => setShowReport(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col text-slate-100">
      <Header />

      <main className="flex-grow container mx-auto px-4 py-8">
        
        {/* Tools Bar */}
        <div className="flex justify-end gap-3 mb-6">
          <button 
            onClick={() => setShowFormulas(true)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-sm transition-colors border border-slate-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            Vzorce a Tabulky
          </button>
          <button 
            onClick={() => setShowReport(true)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-sm transition-colors border border-slate-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Tisk výsledků
          </button>
        </div>

        {/* Formulas & Tables Modal */}
        {showFormulas && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm overflow-y-auto">
            <div className="bg-slate-900 rounded-xl max-w-2xl w-full p-6 border border-slate-700 shadow-2xl relative my-8">
              <button 
                onClick={() => setShowFormulas(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <h3 className="text-xl font-bold mb-4 text-white border-b border-slate-800 pb-2">Vzorce pro výpočet</h3>
              <div className="space-y-4 text-slate-300">
                <div className="bg-slate-800 p-4 rounded-lg">
                  <p className="text-xs text-slate-500 mb-1 font-mono uppercase">1. Hydraulický výkon (Ph)</p>
                  <div className="text-blue-400 text-lg">
                    <MathDisplay formula="P_h = \frac{\rho \cdot g \cdot Q \cdot H}{1000}" />
                  </div>
                  <div className="text-xs text-slate-400 mt-2 bg-slate-900/50 p-2 rounded border border-slate-700/50">
                     <MathDisplay text={String.raw`$\rho$ = hustota (kg/m³), $g$ = 9.81 m/s²`} />
                     <MathDisplay text={String.raw`$Q$ = průtok (m³/s), $H$ = výtlak (m)`} />
                  </div>
                </div>
                <div className="bg-slate-800 p-4 rounded-lg">
                  <p className="text-xs text-slate-500 mb-1 font-mono uppercase">2. Výkon na hřídeli (Ps)</p>
                  <div className="text-blue-400 text-lg">
                    <MathDisplay formula="P_s = \frac{P_h}{\eta}" />
                  </div>
                  <div className="text-xs text-slate-400 mt-2 bg-slate-900/50 p-2 rounded border border-slate-700/50">
                     <MathDisplay text={String.raw`$\eta$ = účinnost čerpadla (0.0 - 1.0)`} />
                  </div>
                </div>
                <div className="bg-slate-800 p-4 rounded-lg">
                  <p className="text-xs text-slate-500 mb-1 font-mono uppercase">3. Požadovaný výkon motoru (Pm)</p>
                  <div className="text-blue-400 text-lg">
                    <MathDisplay formula={`P_m = P_s \\cdot ${(1 + safetyMargin / 100).toFixed(2)}`} />
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Včetně bezpečnostní rezervy {safetyMargin}%.
                  </p>
                </div>
              </div>

              <h3 className="text-xl font-bold mt-8 mb-4 text-white border-b border-slate-800 pb-2">Standardní řada motorů IEC (kW)</h3>
              <div className="bg-slate-800 p-4 rounded-lg">
                <p className="text-sm text-slate-400 mb-3">Při návrhu se volí nejbližší vyšší hodnota z této řady:</p>
                <div className="flex flex-wrap gap-2">
                  {IEC_MOTOR_POWERS.map((p) => (
                    <span key={p} className={`text-xs px-2 py-1 rounded border ${result && result.recommendedIecMotorKw === p ? 'bg-blue-600 text-white border-blue-500 font-bold ring-2 ring-blue-400/50' : 'bg-slate-700 text-slate-300 border-slate-600'}`}>
                      {p}
                    </span>
                  ))}
                </div>
              </div>

              <button 
                onClick={() => setShowFormulas(false)}
                className="w-full mt-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Zavřít
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* INPUT SECTION */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-slate-900 rounded-xl shadow-sm border border-slate-800 p-6 sticky top-6">
              <h2 className="text-lg font-bold text-slate-100 mb-6 border-b pb-2 border-slate-800">Vstupní parametry</h2>
              
              {/* Medium */}
              <div className="mb-5">
                <label className="block text-sm font-medium text-slate-300 mb-1">Médium (Tekutina)</label>
                <select 
                  value={selectedFluidId} 
                  onChange={(e) => setSelectedFluidId(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 text-slate-100 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
                >
                  {FLUIDS.map(f => (
                    <option key={f.id} value={f.id}>{f.name} ({f.density} kg/m³)</option>
                  ))}
                </select>
                <p className="text-xs text-slate-500 mt-1">Hustota: {currentFluid.density} kg/m³ | Viskozita: {currentFluid.viscosityHint}</p>
              </div>

              {/* Pump Type */}
              <div className="mb-5">
                <label className="block text-sm font-medium text-slate-300 mb-1">Typ čerpadla</label>
                <select 
                  value={selectedPumpId} 
                  onChange={handlePumpChange}
                  className="w-full bg-slate-800 border border-slate-700 text-slate-100 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
                >
                  {PUMP_TYPES.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
                <p className="text-xs text-slate-500 mt-1">{currentPump.description}</p>
              </div>

              {/* Flow Rate */}
              <div className="mb-5">
                <div className="flex justify-between mb-1">
                  <label className="text-sm font-medium text-slate-300">Požadovaný průtok (Q)</label>
                  <span className="text-sm font-bold text-blue-400">{flowRate} m³/h</span>
                </div>
                <input 
                  type="range" 
                  min="1" 
                  max="500" 
                  step="1"
                  value={flowRate} 
                  onChange={(e) => setFlowRate(Number(e.target.value))}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex space-x-2 mt-2">
                   <input 
                     type="number" 
                     value={flowRate} 
                     onChange={(e) => setFlowRate(Math.max(0, Number(e.target.value)))}
                     className="w-full bg-slate-800 border border-slate-700 text-slate-100 text-sm rounded-lg p-2 focus:border-blue-500 focus:outline-none"
                   />
                   <span className="flex items-center text-sm text-slate-500">m³/h</span>
                </div>
              </div>

              {/* Head */}
              <div className="mb-5">
                <div className="flex justify-between mb-1">
                  <label className="text-sm font-medium text-slate-300">Dopravní výška (H)</label>
                  <span className="text-sm font-bold text-blue-400">{head} m</span>
                </div>
                <input 
                  type="range" 
                  min="1" 
                  max="200" 
                  step="1"
                  value={head} 
                  onChange={(e) => setHead(Number(e.target.value))}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                 <div className="flex space-x-2 mt-2">
                   <input 
                     type="number" 
                     value={head} 
                     onChange={(e) => setHead(Math.max(0, Number(e.target.value)))}
                     className="w-full bg-slate-800 border border-slate-700 text-slate-100 text-sm rounded-lg p-2 focus:border-blue-500 focus:outline-none"
                   />
                   <span className="flex items-center text-sm text-slate-500">m</span>
                </div>
              </div>

              {/* Efficiency */}
              <div className="mb-5">
                <div className="flex justify-between mb-1">
                  <label className="text-sm font-medium text-slate-300">Účinnost čerpadla</label>
                  <span className="text-sm font-bold text-slate-400">{efficiency} %</span>
                </div>
                <input 
                  type="range" 
                  min="10" 
                  max="95" 
                  step="1"
                  value={efficiency} 
                  onChange={(e) => setEfficiency(Number(e.target.value))}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-slate-500"
                />
              </div>

              {/* Safety Margin */}
              <div className="mb-2">
                <div className="flex justify-between mb-1">
                  <label className="text-sm font-medium text-slate-300">Rezerva motoru</label>
                  <span className="text-sm font-bold text-orange-400">{safetyMargin} %</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="50" 
                  step="1"
                  value={safetyMargin} 
                  onChange={(e) => setSafetyMargin(Number(e.target.value))}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Bezpečnostní koeficient k = {(1 + safetyMargin / 100).toFixed(2)}
                </p>
              </div>

            </div>
          </div>

          {/* OUTPUT SECTION */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Main Results Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {/* Hydraulic Power */}
               <div className="bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-800 flex flex-col justify-between relative overflow-hidden">
                  <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-blue-900 rounded-full opacity-20"></div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-400 uppercase">Hydraulický výkon</h3>
                    <p className="text-xs text-slate-500 mt-1">Výkon přenesený do kapaliny (bez ztrát v čerpadle)</p>
                  </div>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-slate-100">{result ? result.hydraulicPowerKw.toFixed(2) : '-'}</span>
                    <span className="text-lg font-medium text-slate-500 ml-2">kW</span>
                  </div>
               </div>

               {/* Motor Power */}
               <div className="bg-gradient-to-br from-blue-700 to-blue-900 p-6 rounded-xl shadow-lg text-white flex flex-col justify-between relative overflow-hidden">
                  <div className="absolute bottom-0 left-0 -mb-6 -ml-6 w-32 h-32 bg-white opacity-5 rounded-full"></div>
                  <div>
                    <h3 className="text-sm font-semibold text-blue-100 uppercase flex items-center gap-2">
                      Minimální Motor
                      <span className="bg-blue-500/30 text-[10px] px-2 py-0.5 rounded-full border border-blue-400/20">vč. rezervy {safetyMargin}%</span>
                    </h3>
                    <p className="text-xs text-blue-200 mt-1 opacity-80">Zahrnuje účinnost čerpadla + rezervu</p>
                  </div>
                  <div className="mt-2">
                    <div className="flex items-baseline">
                        <span className="text-5xl font-bold tracking-tight">{result ? result.motorPowerKw.toFixed(2) : '-'}</span>
                        <span className="text-xl font-medium text-blue-200 ml-2">kW</span>
                    </div>
                    <div className="mt-2 pt-2 border-t border-blue-500/30">
                        <div className="text-xs text-blue-200 uppercase tracking-wider">Doporučený IEC Motor</div>
                        <div className="text-2xl font-bold text-white">{result ? result.recommendedIecMotorKw : '-'} kW</div>
                    </div>
                  </div>
               </div>
            </div>

            {/* Secondary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
               <div className="bg-slate-900 p-4 rounded-lg border border-slate-800">
                  <div className="text-xs text-slate-500">Tlak na výstupu</div>
                  <div className="font-semibold text-slate-200 text-lg">{result ? result.pressureBar.toFixed(1) : '-'} bar</div>
               </div>
               <div className="bg-slate-900 p-4 rounded-lg border border-slate-800">
                  <div className="text-xs text-slate-500">Průtok (L/s)</div>
                  <div className="font-semibold text-slate-200 text-lg">{result ? (result.flowM3s * 1000).toFixed(1) : '-'} l/s</div>
               </div>
               <div className="bg-slate-900 p-4 rounded-lg border border-slate-800">
                  <div className="text-xs text-slate-500">Hmotnostní průtok</div>
                  <div className="font-semibold text-slate-200 text-lg">{result ? (result.flowM3s * currentFluid.density).toFixed(1) : '-'} kg/s</div>
               </div>
                <div className="bg-slate-900 p-4 rounded-lg border border-slate-800">
                  <div className="text-xs text-slate-500">Účinnost</div>
                  <div className="font-semibold text-slate-200 text-lg">{efficiency} %</div>
               </div>
            </div>

            {/* Charts */}
            <div>
                <ResultsChart 
                baseFlow={flowRate}
                baseHead={head}
                density={currentFluid.density}
                efficiency={efficiency / 100}
                theme="dark"
                />
            </div>

          </div>
        </div>
      </main>
      
      <footer className="bg-slate-900 py-6 border-t border-slate-800 mt-auto">
        <div className="container mx-auto px-4 text-center text-slate-500 text-xs">
          <p>&copy; {new Date().getFullYear()} PumpMaster Pro. Výpočty jsou orientační. Pro kritické aplikace konzultujte výrobce.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
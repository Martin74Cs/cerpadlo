import React from 'react';
import { CalculationResult, Fluid, PumpType } from '../types';
import ResultsChart from './ResultsChart';

interface PrintReportProps {
  result: CalculationResult | null;
  inputs: {
    flowRate: number;
    head: number;
    efficiency: number;
    safetyMargin: number;
    fluid: Fluid;
    pump: PumpType;
  };
  onClose: () => void;
}

const PrintReport: React.FC<PrintReportProps> = ({ result, inputs, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  const currentDate = new Date().toLocaleDateString('cs-CZ');
  const currentTime = new Date().toLocaleTimeString('cs-CZ');

  return (
    <div className="min-h-screen bg-gray-100 text-black p-4 md:p-8">
      {/* Control Bar - Not Printed */}
      <div className="max-w-4xl mx-auto mb-6 flex justify-between items-center bg-white p-4 rounded-lg shadow-sm border border-gray-200 print:hidden">
        <h2 className="text-lg font-bold text-gray-800">Náhled tisku</h2>
        <div className="flex gap-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg text-sm transition-colors font-medium"
          >
            Zpět do kalkulačky
          </button>
          <button 
            onClick={handlePrint}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors font-medium flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Vytisknout / Uložit PDF
          </button>
        </div>
      </div>

      {/* A4 Page Container */}
      <div className="max-w-[210mm] mx-auto bg-white shadow-2xl print:shadow-none print:w-full print:max-w-none p-8 md:p-12 min-h-[297mm] relative">
        
        {/* Header */}
        <div className="border-b-2 border-gray-800 pb-4 mb-8 flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-bold text-black tracking-tight">PumpMaster Pro</h1>
            <p className="text-gray-600 mt-1 uppercase tracking-widest text-sm font-semibold">Technický protokol návrhu</p>
          </div>
          <div className="text-right text-sm text-gray-500">
            <div>Datum: {currentDate}</div>
            <div>Čas: {currentTime}</div>
          </div>
        </div>

        {/* Inputs & Basic Data */}
        <div className="mb-8">
          <h3 className="text-lg font-bold border-b border-gray-300 pb-2 mb-4 text-gray-800">Vstupní parametry</h3>
          <div className="grid grid-cols-2 gap-y-4 gap-x-8">
            <div className="flex justify-between border-b border-gray-100 pb-1">
              <span className="text-gray-600">Médium:</span>
              <span className="font-semibold">{inputs.fluid.name} ({inputs.fluid.density} kg/m³)</span>
            </div>
            <div className="flex justify-between border-b border-gray-100 pb-1">
              <span className="text-gray-600">Typ čerpadla:</span>
              <span className="font-semibold">{inputs.pump.name}</span>
            </div>
            <div className="flex justify-between border-b border-gray-100 pb-1">
              <span className="text-gray-600">Požadovaný průtok:</span>
              <span className="font-semibold">{inputs.flowRate} m³/h</span>
            </div>
            <div className="flex justify-between border-b border-gray-100 pb-1">
              <span className="text-gray-600">Dopravní výška (výtlak):</span>
              <span className="font-semibold">{inputs.head} m</span>
            </div>
            <div className="flex justify-between border-b border-gray-100 pb-1">
              <span className="text-gray-600">Účinnost čerpadla:</span>
              <span className="font-semibold">{inputs.efficiency} %</span>
            </div>
            <div className="flex justify-between border-b border-gray-100 pb-1">
              <span className="text-gray-600">Bezpečnostní koeficient:</span>
              <span className="font-semibold">{(1 + inputs.safetyMargin / 100).toFixed(2)} ({inputs.safetyMargin}%)</span>
            </div>
          </div>
        </div>

        {/* Results Highlights */}
        <div className="mb-8">
          <h3 className="text-lg font-bold border-b border-gray-300 pb-2 mb-4 text-gray-800">Výsledky výpočtu</h3>
          
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div className="bg-gray-50 border border-gray-300 p-6 rounded-lg">
              <div className="text-sm text-gray-500 uppercase tracking-wide mb-1">Vypočtený výkon motoru</div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-gray-900">{result?.motorPowerKw.toFixed(2)}</span>
                <span className="text-xl text-gray-600 font-medium">kW</span>
              </div>
              <div className="text-xs text-gray-400 mt-2">Včetně {inputs.safetyMargin}% rezervy</div>
            </div>

            <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg">
              <div className="text-sm text-blue-800 uppercase tracking-wide mb-1 font-semibold">Doporučený standard (IEC)</div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-blue-700">{result?.recommendedIecMotorKw}</span>
                <span className="text-xl text-blue-600 font-medium">kW</span>
              </div>
              <div className="text-xs text-blue-400 mt-2">Nejbližší vyšší standardní motor</div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 text-sm">
             <div className="border border-gray-200 p-3 rounded bg-white">
               <span className="block text-gray-500 text-xs">Hydraulický výkon</span>
               <span className="font-semibold text-lg">{result?.hydraulicPowerKw.toFixed(2)} kW</span>
             </div>
             <div className="border border-gray-200 p-3 rounded bg-white">
               <span className="block text-gray-500 text-xs">Výkon na hřídeli</span>
               <span className="font-semibold text-lg">{result?.shaftPowerKw.toFixed(2)} kW</span>
             </div>
             <div className="border border-gray-200 p-3 rounded bg-white">
               <span className="block text-gray-500 text-xs">Výstupní tlak</span>
               <span className="font-semibold text-lg">{result?.pressureBar.toFixed(1)} bar</span>
             </div>
          </div>
        </div>

        {/* Chart */}
        <div className="mb-8 break-inside-avoid">
          <h3 className="text-lg font-bold border-b border-gray-300 pb-2 mb-4 text-gray-800">Charakteristika</h3>
          <ResultsChart 
            baseFlow={inputs.flowRate}
            baseHead={inputs.head}
            density={inputs.fluid.density}
            efficiency={inputs.efficiency / 100}
            theme="light"
          />
        </div>

        {/* Footer / Signoff */}
        <div className="mt-12 pt-8 border-t border-gray-300 flex justify-between items-center text-xs text-gray-500 print:fixed print:bottom-0 print:left-0 print:w-full print:px-12 print:pb-8 print:border-none">
          <div>
            <p>Vygenerováno aplikací PumpMaster Pro</p>
            <p>Výpočty jsou orientační. Pro realizaci konzultujte projektanta.</p>
          </div>
          <div className="text-right">
            <div className="mb-8 border-b border-gray-400 w-48"></div>
            <p>Podpis / Razítko</p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default PrintReport;
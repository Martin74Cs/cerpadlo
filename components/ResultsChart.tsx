import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Label } from 'recharts';

interface ResultsChartProps {
  baseFlow: number;
  baseHead: number;
  density: number;
  efficiency: number;
  theme?: 'dark' | 'light';
}

const ResultsChart: React.FC<ResultsChartProps> = ({ baseFlow, baseHead, density, efficiency, theme = 'dark' }) => {
  // Generate data points: +/- 50% of the base flow to show the curve
  const data = React.useMemo(() => {
    const points = [];
    const startFlow = Math.max(1, baseFlow * 0.5);
    const endFlow = baseFlow * 1.5;
    const step = (endFlow - startFlow) / 10;

    for (let q = startFlow; q <= endFlow; q += step) {
      // Hydraulic Power Formula: P = (rho * g * Q * H) / (3.6 * 10^6)
      // Q is in m3/h
      const hydPower = (density * 9.81 * q * baseHead) / 3600000;
      const motorPower = (hydPower / efficiency) * 1.15; // Including safety

      points.push({
        flow: parseFloat(q.toFixed(1)),
        power: parseFloat(motorPower.toFixed(2)),
      });
    }
    return points;
  }, [baseFlow, baseHead, density, efficiency]);

  const isLight = theme === 'light';
  
  // Styles based on theme
  const containerClass = isLight 
    ? "h-64 w-full mt-4 bg-white p-4 rounded-xl border border-gray-300 shadow-none" 
    : "h-64 w-full mt-4 bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-sm print:bg-white print:border-gray-300 print:border print:shadow-none";
  
  const titleClass = isLight 
    ? "text-sm font-semibold text-gray-800 mb-4" 
    : "text-sm font-semibold text-slate-400 mb-4 print:text-black";
    
  const axisColor = isLight ? "#475569" : "#64748b"; 
  const gridColor = isLight ? "#e2e8f0" : "#334155";
  const tooltipContentStyle = isLight 
    ? { backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #cbd5e1', color: '#1e293b' }
    : { backgroundColor: '#1e293b', borderRadius: '8px', border: '1px solid #475569', color: '#f1f5f9' };
  const tooltipItemStyle = isLight ? { color: '#1e293b' } : { color: '#f1f5f9' };

  return (
    <div className={containerClass}>
      <h3 className={titleClass}>Závislost výkonu motoru na průtoku (při konst. výtlaku)</h3>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
          <defs>
            <linearGradient id="colorPower" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} className={isLight ? "" : "print:stroke-slate-200"} />
          <XAxis dataKey="flow" stroke={axisColor} fontSize={12} tickFormatter={(val) => `${val}`}>
            <Label value="Průtok (m³/h)" offset={0} position="insideBottom" dy={15} style={{ fill: axisColor, fontSize: 12 }} />
          </XAxis>
          <YAxis stroke={axisColor} fontSize={12}>
            <Label value="Výkon (kW)" angle={-90} position="insideLeft" style={{ fill: axisColor, fontSize: 12 }} />
          </YAxis>
          <Tooltip 
            contentStyle={tooltipContentStyle}
            itemStyle={tooltipItemStyle}
            formatter={(value: number) => [`${value} kW`, 'Motorový výkon']}
            labelFormatter={(label) => `Průtok: ${label} m³/h`}
          />
          <Area type="monotone" dataKey="power" stroke="#3b82f6" fillOpacity={1} fill="url(#colorPower)" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ResultsChart;
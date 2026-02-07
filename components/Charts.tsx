
import React from 'react';
import { ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface WeatherChartProps {
  data: { time: string; rain: number; temp: number; probability: number }[];
}

export const WeatherChart: React.FC<WeatherChartProps> = ({ data }) => {
  return (
    <div className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={data}
          margin={{ top: 10, right: 0, left: -20, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorRain" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.2}/>
            </linearGradient>
            <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f59e0b" stopOpacity={1}/>
              <stop offset="95%" stopColor="#ef4444" stopOpacity={1}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} opacity={0.5} />
          
          <XAxis 
            dataKey="time" 
            stroke="#94a3b8" 
            fontSize={9} 
            tickLine={false} 
            interval={1} 
          />
          
          {/* Left Axis: Temperature */}
          <YAxis 
            yAxisId="left"
            stroke="#f59e0b" 
            fontSize={9} 
            tickLine={false}
            domain={['auto', 'auto']}
            label={{ value: '°C', angle: -90, position: 'insideLeft', fill: '#f59e0b', fontSize: 9, dx: 10 }} 
          />
          
          {/* Right Axis: Rainfall */}
          <YAxis 
            yAxisId="right" 
            orientation="right" 
            stroke="#06b6d4" 
            fontSize={9} 
            tickLine={false}
            label={{ value: 'mm', angle: 90, position: 'insideRight', fill: '#06b6d4', fontSize: 9, dx: -10 }} 
          />
          
          <Tooltip 
            contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px' }}
            itemStyle={{ fontSize: '11px', fontWeight: 'bold' }}
            labelStyle={{ color: '#cbd5e1', marginBottom: '5px', fontSize: '10px' }}
          />
          
          <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '5px' }} iconSize={8} />
          
          {/* Rainfall Bars (Right Axis) */}
          <Bar 
            yAxisId="right"
            dataKey="rain" 
            name="Rainfall" 
            fill="url(#colorRain)" 
            barSize={12}
            radius={[2, 2, 0, 0]}
          />

          {/* Temperature Line (Left Axis) */}
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="temp"
            name="Temp"
            stroke="url(#colorTemp)"
            strokeWidth={2}
            dot={{ r: 2, fill: '#f59e0b', strokeWidth: 0 }}
            activeDot={{ r: 4, fill: '#fff' }}
          />

        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

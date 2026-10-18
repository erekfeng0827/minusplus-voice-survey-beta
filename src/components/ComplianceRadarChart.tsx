import React from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

export interface DimensionScore {
  subject: string;
  score: number;
  fullMark: number;
  benchmark: number;
  status: 'OPTIMAL' | 'COMPLIANT' | 'WARNING';
  description: string;
}

interface ComplianceRadarChartProps {
  scores?: DimensionScore[];
  height?: number;
}

const DEFAULT_SCORES: DimensionScore[] = [
  {
    subject: '降板高度',
    score: 98,
    fullMark: 100,
    benchmark: 85,
    status: 'OPTIMAL',
    description: '客廳230cm、衛廚215cm，符合《降板裁決_v003》',
  },
  {
    subject: '梁下淨高',
    score: 96,
    fullMark: 100,
    benchmark: 80,
    status: 'OPTIMAL',
    description: '大梁淨高265cm避讓無遮擋，通行動線流暢',
  },
  {
    subject: '動線合規',
    score: 92,
    fullMark: 100,
    benchmark: 75,
    status: 'COMPLIANT',
    description: '防爆門90°迴旋半徑無阻擋，玄關通道≥90cm',
  },
  {
    subject: '幾何法規',
    score: 100,
    fullMark: 100,
    benchmark: 85,
    status: 'OPTIMAL',
    description: '嚴格遵守5倍數原則 (280/265/230/215)，無畸零數值',
  },
  {
    subject: '設備配置',
    score: 94,
    fullMark: 100,
    benchmark: 70,
    status: 'COMPLIANT',
    description: '空調出回風與全高衣櫃避開穿透干涉，水電居中對齊',
  },
];

export const ComplianceRadarChart: React.FC<ComplianceRadarChartProps> = ({
  scores = DEFAULT_SCORES,
  height = 280,
}) => {
  const averageScore = Math.round(
    scores.reduce((acc, curr) => acc + curr.score, 0) / scores.length
  );

  return (
    <div className="w-full bg-slate-950/70 border border-slate-800 rounded-xl p-4 flex flex-col items-center">
      <div className="w-full flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <h4 className="text-xs font-bold text-white tracking-wide">
            幾何契約 · 五大維度合規雷達評分
          </h4>
        </div>
        <div className="flex items-center gap-1.5 bg-emerald-950/80 border border-emerald-500/40 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold text-emerald-300">
          <span>綜合評分</span>
          <span className="text-sm text-emerald-400">{averageScore}</span>
          <span className="text-[10px] text-slate-400">/ 100</span>
        </div>
      </div>

      <div className="w-full" style={{ height: `${height}px` }}>
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="72%" data={scores}>
            <PolarGrid stroke="#334155" strokeDasharray="3 3" />
            <PolarAngleAxis
              dataKey="subject"
              tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }}
            />
            <PolarRadiusAxis
              angle={30}
              domain={[0, 100]}
              tick={{ fill: '#64748b', fontSize: 9 }}
              stroke="#1e293b"
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload as DimensionScore;
                  return (
                    <div className="bg-slate-900 border border-slate-700 p-2.5 rounded-lg shadow-xl text-xs space-y-1 z-50">
                      <div className="font-bold text-cyan-300 flex items-center justify-between gap-3">
                        <span>{data.subject}</span>
                        <span className="font-mono text-emerald-400">{data.score} 分</span>
                      </div>
                      <div className="text-[11px] text-slate-300">{data.description}</div>
                      <div className="text-[10px] text-slate-400">
                        基準合格分：{data.benchmark} · 狀態：
                        <span className="text-emerald-400 font-semibold">{data.status}</span>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Radar
              name="室內設計基準"
              dataKey="benchmark"
              stroke="#64748b"
              fill="#475569"
              fillOpacity={0.2}
            />
            <Radar
              name="當前合規得分"
              dataKey="score"
              stroke="#06b6d4"
              fill="#0891b2"
              fillOpacity={0.45}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Dimension Scores Legend Grid */}
      <div className="w-full grid grid-cols-2 sm:grid-cols-5 gap-2 mt-2 pt-2 border-t border-slate-800/80 text-[11px]">
        {scores.map((s) => (
          <div
            key={s.subject}
            className="bg-slate-900/80 border border-slate-800 p-2 rounded-lg flex flex-col justify-between"
          >
            <span className="text-slate-400 font-medium truncate">{s.subject}</span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-sm font-bold font-mono text-cyan-300">{s.score}</span>
              <span className="text-[9px] text-emerald-400 bg-emerald-950/60 px-1 rounded border border-emerald-800/40">
                {s.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

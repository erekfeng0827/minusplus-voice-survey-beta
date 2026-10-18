import React from 'react';
import { ProjectShell } from '../types';

export const WholeHouseShellCanvas: React.FC<{ shell: ProjectShell; compact?: boolean }> = ({ shell, compact = false }) => {
  const pad = Math.max(shell.width, shell.length) * 0.035 || 20;
  const viewBox = `${-pad} ${-pad} ${shell.width + pad * 2} ${shell.length + pad * 2}`;
  return (
    <div className="survey-card flex h-full w-full min-h-0 flex-col overflow-hidden border">
      <div className="survey-border flex items-center justify-between border-b px-3 py-2 text-xs">
        <strong className="survey-text truncate">{shell.sourceFileName}</strong>
        <span className="survey-muted shrink-0">{Math.round(shell.width)} × {Math.round(shell.length)} cm</span>
      </div>
      <div className="min-h-0 flex-1 p-2 sm:p-4">
        <svg viewBox={viewBox} className="h-full w-full" preserveAspectRatio="xMidYMid meet" aria-label="DXF 連續整戶底圖">
          <g fill="none" stroke="currentColor" className="survey-text" strokeWidth={compact ? 2.4 : 1.5} vectorEffect="non-scaling-stroke">
            {shell.segments.map((segment) => segment.points.length > 1 && (
              <polyline key={segment.id} points={segment.points.map((p) => `${p.x},${p.y}`).join(' ')} opacity={segment.layer.includes('牆') ? 1 : 0.55} />
            ))}
          </g>
          <g fill="#E0A83C" fillOpacity="0.06" stroke="#E0A83C" strokeOpacity="0.35" strokeWidth="1" vectorEffect="non-scaling-stroke">
            {shell.zones.map((zone) => <polygon key={zone.id} points={zone.polygon.map((p) => `${p.x},${p.y}`).join(' ')} />)}
          </g>
        </svg>
      </div>
    </div>
  );
};

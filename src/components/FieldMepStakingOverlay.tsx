import React from 'react';
import { RoomData, ElectricalPoint, LightingPoint } from '../types';

interface FieldMepStakingOverlayProps {
  room: RoomData;
  selectedMepId: string | null;
  selectedLightingId: string | null;
  onSelectMep: (id: string | null) => void;
  onSelectLighting: (id: string | null) => void;
  onUpdatePointPosition: (type: 'mep' | 'lighting', id: string, newX: number, newY: number) => void;
  onDeletePoint: (type: 'mep' | 'lighting', id: string) => void;
  activeTool: 'select' | 'socket_110v' | 'socket_220v' | 'switch' | 'network' | 'water_supply' | 'downlight' | 'spotlight' | 'pendant';
}

export const FieldMepStakingOverlay: React.FC<FieldMepStakingOverlayProps> = ({
  room,
  selectedMepId,
  selectedLightingId,
  onSelectMep,
  onSelectLighting,
  onUpdatePointPosition,
  onDeletePoint,
  activeTool,
}) => {
  const mepList = room.electricalPoints || [];
  const lightingList = room.lightingPoints || [];

  // Selected item reference for relative dimension line rendering
  const selectedMep = mepList.find((p) => p.id === selectedMepId);
  const selectedLighting = lightingList.find((p) => p.id === selectedLightingId);

  const activeItem = selectedMep
    ? {
        id: selectedMep.id,
        type: 'mep' as const,
        x: selectedMep.x,
        y: selectedMep.y,
        elevation: selectedMep.elevation,
        name: selectedMep.name,
        category: selectedMep.type,
      }
    : selectedLighting
    ? {
        id: selectedLighting.id,
        type: 'lighting' as const,
        x: selectedLighting.x,
        y: selectedLighting.y,
        elevation: selectedLighting.elevation,
        name: selectedLighting.name,
        category: selectedLighting.type,
      }
    : null;

  // Find the nearest other fixture to draw the relative inter-fixture dimension line
  let nearestOther: { x: number; y: number; name: string; dist: number } | null = null;
  if (activeItem) {
    let minDist = Infinity;
    // Check all other mep items
    mepList.forEach((p) => {
      if (p.id !== activeItem.id) {
        const d = Math.round(Math.hypot(p.x - activeItem.x, p.y - activeItem.y));
        if (d < minDist && d > 0) {
          minDist = d;
          nearestOther = { x: p.x, y: p.y, name: p.name, dist: d };
        }
      }
    });
    // Check all other lighting items
    lightingList.forEach((p) => {
      if (p.id !== activeItem.id) {
        const d = Math.round(Math.hypot(p.x - activeItem.x, p.y - activeItem.y));
        if (d < minDist && d > 0) {
          minDist = d;
          nearestOther = { x: p.x, y: p.y, name: p.name, dist: d };
        }
      }
    });
  }

  return (
    <g className="mep-staking-overlay">
      {/* 1. Dynamic Relative Dimension Lines to 4 Walls when an item is selected */}
      {activeItem && (
        <g className="relative-dimension-lines animate-in fade-in duration-150">
          {/* Dimension Line to Left Wall (X=0) */}
          <line
            x1="0"
            y1={activeItem.y}
            x2={activeItem.x}
            y2={activeItem.y}
            stroke="#38bdf8"
            strokeWidth="1.5"
            strokeDasharray="4,3"
          />
          {/* Tick marks */}
          <line x1="0" y1={activeItem.y - 6} x2="0" y2={activeItem.y + 6} stroke="#38bdf8" strokeWidth="1.5" />
          <g transform={`translate(${activeItem.x / 2}, ${activeItem.y})`}>
            <rect x="-24" y="-18" width="48" height="15" rx="3" fill="#0369a1" stroke="#38bdf8" strokeWidth="1" />
            <text x="0" y="-7" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
              {activeItem.x} cm
            </text>
          </g>

          {/* Dimension Line to Right Wall (X=room.width) */}
          <line
            x1={activeItem.x}
            y1={activeItem.y}
            x2={room.width}
            y2={activeItem.y}
            stroke="#94a3b8"
            strokeWidth="1"
            strokeDasharray="3,3"
          />
          <line x1={room.width} y1={activeItem.y - 4} x2={room.width} y2={activeItem.y + 4} stroke="#94a3b8" strokeWidth="1" />
          <g transform={`translate(${activeItem.x + (room.width - activeItem.x) / 2}, ${activeItem.y})`}>
            <rect x="-22" y="-16" width="44" height="13" rx="3" fill="#1e293b" stroke="#475569" strokeWidth="1" />
            <text x="0" y="-6" fill="#cbd5e1" fontSize="8" textAnchor="middle" fontFamily="monospace">
              {room.width - activeItem.x} cm
            </text>
          </g>

          {/* Dimension Line to Top Wall (Y=0) */}
          <line
            x1={activeItem.x}
            y1="0"
            x2={activeItem.x}
            y2={activeItem.y}
            stroke="#38bdf8"
            strokeWidth="1.5"
            strokeDasharray="4,3"
          />
          <line x1={activeItem.x - 6} y1="0" x2={activeItem.x + 6} y2="0" stroke="#38bdf8" strokeWidth="1.5" />
          <g transform={`translate(${activeItem.x}, ${activeItem.y / 2})`}>
            <rect x="-24" y="-7.5" width="48" height="15" rx="3" fill="#0369a1" stroke="#38bdf8" strokeWidth="1" />
            <text x="0" y="3.5" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
              {activeItem.y} cm
            </text>
          </g>

          {/* Dimension Line to Bottom Wall (Y=room.length) */}
          <line
            x1={activeItem.x}
            y1={activeItem.y}
            x2={activeItem.x}
            y2={room.length}
            stroke="#94a3b8"
            strokeWidth="1"
            strokeDasharray="3,3"
          />
          <line x1={activeItem.x - 4} y1={room.length} x2={activeItem.x + 4} y2={room.length} stroke="#94a3b8" strokeWidth="1" />
          <g transform={`translate(${activeItem.x}, ${activeItem.y + (room.length - activeItem.y) / 2})`}>
            <rect x="-22" y="-6.5" width="44" height="13" rx="3" fill="#1e293b" stroke="#475569" strokeWidth="1" />
            <text x="0" y="3.5" fill="#cbd5e1" fontSize="8" textAnchor="middle" fontFamily="monospace">
              {room.length - activeItem.y} cm
            </text>
          </g>

          {/* Dimension line connecting to the nearest other fixture */}
          {nearestOther && (
            <g>
              <line
                x1={activeItem.x}
                y1={activeItem.y}
                x2={(nearestOther as any).x}
                y2={(nearestOther as any).y}
                stroke="#f59e0b"
                strokeWidth="1.8"
                strokeDasharray="5,3"
              />
              <circle cx={(activeItem.x + (nearestOther as any).x) / 2} cy={(activeItem.y + (nearestOther as any).y) / 2} r="14" fill="#78350f" stroke="#fbbf24" strokeWidth="1" />
              <text
                x={(activeItem.x + (nearestOther as any).x) / 2}
                y={(activeItem.y + (nearestOther as any).y) / 2 + 3.5}
                fill="#fef08a"
                fontSize="8.5"
                fontWeight="bold"
                textAnchor="middle"
                fontFamily="monospace"
              >
                {(nearestOther as any).dist}
              </text>
            </g>
          )}
        </g>
      )}

      {/* 2. Render all Lighting Fixtures */}
      {lightingList.map((light) => {
        const isSelected = selectedLightingId === light.id;
        const is5Mul = light.x % 5 === 0 && light.y % 5 === 0;

        return (
          <g
            key={light.id}
            transform={`translate(${light.x}, ${light.y})`}
            className="cursor-pointer transition-transform hover:scale-110"
            onClick={(e) => {
              e.stopPropagation();
              onSelectLighting(isSelected ? null : light.id);
              onSelectMep(null);
            }}
          >
            {/* Selection highlight glow */}
            {isSelected && (
              <circle r="16" fill="none" stroke="#38bdf8" strokeWidth="2.5" strokeDasharray="3,3" className="animate-spin" />
            )}

            {/* Light Symbol based on type */}
            {light.type === 'downlight' && (
              <g>
                <circle r="9" fill="#eab308" fillOpacity="0.25" />
                <circle r="6" fill="#facc15" stroke="#ffffff" strokeWidth="1.5" />
                <line x1="-8" y1="0" x2="8" y2="0" stroke="#ca8a04" strokeWidth="1" />
                <line x1="0" y1="-8" x2="0" y2="8" stroke="#ca8a04" strokeWidth="1" />
              </g>
            )}

            {light.type === 'spotlight' && (
              <g>
                <polygon points="0,-8 7,6 -7,6" fill="#f97316" stroke="#ffffff" strokeWidth="1.5" />
                <circle cx="0" cy="1" r="2.5" fill="#fef08a" />
              </g>
            )}

            {light.type === 'pendant' && (
              <g>
                <circle r="8" fill="#a855f7" stroke="#ffffff" strokeWidth="1.5" />
                <circle r="4" fill="#ffffff" />
                <line x1="-10" y1="-10" x2="10" y2="10" stroke="#e9d5ff" strokeWidth="1.2" />
                <line x1="10" y1="-10" x2="-10" y2="10" stroke="#e9d5ff" strokeWidth="1.2" />
              </g>
            )}

            {light.type === 'cove_strip' && (
              <g>
                <rect x="-14" y="-3" width="28" height="6" rx="2" fill="#fbbf24" stroke="#d97706" strokeWidth="1" />
              </g>
            )}

            {/* Label Badge */}
            <g transform="translate(10, -10)">
              <rect
                x="0"
                y="-11"
                width={Math.max(70, light.name.length * 8 + 30)}
                height="18"
                rx="3"
                fill="#1e1b4b"
                fillOpacity="0.9"
                stroke={isSelected ? '#38bdf8' : is5Mul ? '#6366f1' : '#f59e0b'}
                strokeWidth="1"
              />
              <text x="5" y="1" fill="#e0e7ff" fontSize="8" fontWeight="bold">
                {light.name}
              </text>
              <text x={Math.max(70, light.name.length * 8 + 30) - 4} y="1" fill="#a5b4fc" fontSize="7" textAnchor="end" fontFamily="monospace">
                FL+{light.elevation}
              </text>
            </g>
          </g>
        );
      })}

      {/* 3. Render all Electrical MEP Points */}
      {mepList.map((mep) => {
        const isSelected = selectedMepId === mep.id;
        const is5Mul = mep.x % 5 === 0 && mep.y % 5 === 0;

        return (
          <g
            key={mep.id}
            transform={`translate(${mep.x}, ${mep.y})`}
            className="cursor-pointer transition-transform hover:scale-110"
            onClick={(e) => {
              e.stopPropagation();
              onSelectMep(isSelected ? null : mep.id);
              onSelectLighting(null);
            }}
          >
            {/* Selection highlight glow */}
            {isSelected && (
              <circle r="16" fill="none" stroke="#38bdf8" strokeWidth="2.5" strokeDasharray="3,3" className="animate-spin" />
            )}

            {/* MEP Symbol based on type */}
            {mep.type === 'socket_110v' && (
              <g>
                <circle r="7" fill="#ef4444" stroke="#ffffff" strokeWidth="1.5" />
                <line x1="-3" y1="-3" x2="-3" y2="3" stroke="#ffffff" strokeWidth="1.2" />
                <line x1="3" y1="-3" x2="3" y2="3" stroke="#ffffff" strokeWidth="1.2" />
              </g>
            )}

            {mep.type === 'socket_220v' && (
              <g>
                <circle r="8" fill="#f97316" stroke="#ffffff" strokeWidth="1.5" />
                <circle r="5" fill="none" stroke="#ffffff" strokeWidth="1" />
                <polygon points="0,-4 3,3 -3,3" fill="#ffffff" />
              </g>
            )}

            {mep.type === 'switch' && (
              <g>
                <rect x="-6" y="-6" width="12" height="12" rx="2" fill="#22c55e" stroke="#ffffff" strokeWidth="1.5" />
                <line x1="-4" y1="-4" x2="4" y2="4" stroke="#ffffff" strokeWidth="1.5" />
              </g>
            )}

            {mep.type === 'network' && (
              <g>
                <polygon points="0,-7 7,0 0,7 -7,0" fill="#3b82f6" stroke="#ffffff" strokeWidth="1.5" />
                <text x="0" y="2.5" fill="#ffffff" fontSize="6" fontWeight="bold" textAnchor="middle">
                  N
                </text>
              </g>
            )}

            {mep.type === 'water_supply' && (
              <g>
                <circle r="7" fill="#06b6d4" stroke="#ffffff" strokeWidth="1.5" />
                <circle cx="0" cy="1" r="3" fill="#ffffff" />
              </g>
            )}

            {/* Label Badge */}
            <g transform="translate(10, -10)">
              <rect
                x="0"
                y="-11"
                width={Math.max(65, mep.name.length * 8 + 26)}
                height="18"
                rx="3"
                fill="#0f172a"
                fillOpacity="0.9"
                stroke={isSelected ? '#38bdf8' : is5Mul ? '#334155' : '#f59e0b'}
                strokeWidth="1"
              />
              <text x="5" y="1" fill="#f8fafc" fontSize="8" fontWeight="bold">
                {mep.name}
              </text>
              <text x={Math.max(65, mep.name.length * 8 + 26) - 4} y="1" fill="#38bdf8" fontSize="7" textAnchor="end" fontFamily="monospace">
                H+{mep.elevation}
              </text>
            </g>
          </g>
        );
      })}
    </g>
  );
};

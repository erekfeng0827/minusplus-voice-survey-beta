import { Door, WindowOpening } from '../types';

export type CanonicalWall = 'top' | 'bottom' | 'left' | 'right';

export const canonicalWall = (wall: Door['wall'] | WindowOpening['wall']): CanonicalWall => {
  if (wall === 'north') return 'top';
  if (wall === 'south') return 'bottom';
  if (wall === 'west') return 'left';
  if (wall === 'east') return 'right';
  return wall;
};

/** Local x follows the selected wall; local +y always points into the room. */
export const openingTransform = (wallValue: Door['wall'] | WindowOpening['wall'], offset: number, roomWidth: number, roomLength: number) => {
  const wall = canonicalWall(wallValue);
  if (wall === 'top') return `translate(${offset}, 0)`;
  if (wall === 'bottom') return `translate(${offset}, ${roomLength}) scale(1, -1)`;
  if (wall === 'left') return `translate(0, ${offset}) rotate(90) scale(1, -1)`;
  return `translate(${roomWidth}, ${offset}) rotate(90)`;
};

export const doorLeafGeometry = (door: Door) => {
  const outward = door.swingDirection === 'outward_left' || door.swingDirection === 'outward_right';
  const hingeRight = door.swingDirection === 'inward_right' || door.swingDirection === 'outward_right';
  const sign = outward ? -1 : 1;
  const width = door.width;
  if (door.swingDirection === 'sliding') return { sliding: true, leaf: '', arc: '', labelY: 18 };
  if (hingeRight) return { sliding: false, leaf: `M ${width} 0 L ${width} ${sign * width}`, arc: `M 0 0 A ${width} ${width} 0 0 ${sign > 0 ? 1 : 0} ${width} ${sign * width}`, labelY: sign > 0 ? 18 : -12 };
  return { sliding: false, leaf: `M 0 0 L 0 ${sign * width}`, arc: `M 0 ${sign * width} A ${width} ${width} 0 0 ${sign > 0 ? 1 : 0} ${width} 0`, labelY: sign > 0 ? 18 : -12 };
};

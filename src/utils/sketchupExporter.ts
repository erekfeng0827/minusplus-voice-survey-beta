/**
 * ==============================================================================
 * 📐 MINUS+ 加減設計 — SketchUp (SU) 高相容性 3D 模型與 LayOut 施工圖匯出引擎
 * 將全層與各房間 RoomData 真實幾何轉譯為 SU 友善的群組與組件，對應 MinusPlus A 系列圖層
 * ==============================================================================
 */
import { RoomData } from '../types';
import { generateSketchup3dDxf, generateSketchupLayOutGuide } from './minusPlusDesignEngine';

export { generateSketchup3dDxf, generateSketchupLayOutGuide };

/**
 * 依據專案與房間數據產生 SketchUp 專屬 3D DXF
 */
export function generateSketchupDxfString(rooms: RoomData[], projectName: string): string {
  // 若為全層模式或星玥灣專案，直接提供全層 3D 精確實體面模型
  if (!rooms || rooms.length === 0 || rooms.length >= 3) {
    return generateSketchup3dDxf();
  }

  // 單房模式生成 3D Box 面模型
  let dxf = '';
  dxf += '0\nSECTION\n2\nHEADER\n9\n$ACADVER\n1\nAC1009\n0\nENDSEC\n';
  dxf += '0\nSECTION\n2\nTABLES\n0\nTABLE\n2\nLAYER\n70\n4\n';
  dxf += '0\nLAYER\n2\n01_RC_WALL\n62\n7\n';
  dxf += '0\nLAYER\n2\n02_BEAMS\n62\n1\n';
  dxf += '0\nLAYER\n2\n03_OPENINGS\n62\n4\n';
  dxf += '0\nLAYER\n2\n04_WOODWORK\n62\n30\n';
  dxf += '0\nENDTAB\n0\nENDSEC\n';

  dxf += '0\nSECTION\n2\nENTITIES\n';

  const box3d = (ly: string, x: number, y: number, z: number, w: number, d: number, h: number) => {
    let out = '';
    // Bottom
    out += `0\n3DFACE\n8\n${ly}\n10\n${x}\n20\n${y}\n30\n${z}\n11\n${x+w}\n21\n${y}\n31\n${z}\n12\n${x+w}\n22\n${y+d}\n32\n${z}\n13\n${x}\n23\n${y+d}\n33\n${z}\n`;
    // Top
    out += `0\n3DFACE\n8\n${ly}\n10\n${x}\n20\n${y}\n30\n${z+h}\n11\n${x+w}\n21\n${y}\n31\n${z+h}\n12\n${x+w}\n22\n${y+d}\n32\n${z+h}\n13\n${x}\n23\n${y+d}\n33\n${z+h}\n`;
    // Front
    out += `0\n3DFACE\n8\n${ly}\n10\n${x}\n20\n${y}\n30\n${z}\n11\n${x+w}\n21\n${y}\n31\n${z}\n12\n${x+w}\n22\n${y}\n32\n${z+h}\n13\n${x}\n23\n${y}\n33\n${z+h}\n`;
    // Back
    out += `0\n3DFACE\n8\n${ly}\n10\n${x}\n20\n${y+d}\n30\n${z}\n11\n${x+w}\n21\n${y+d}\n31\n${z}\n12\n${x+w}\n22\n${y+d}\n32\n${z+h}\n13\n${x}\n23\n${y+d}\n33\n${z+h}\n`;
    return out;
  };

  rooms.forEach((room) => {
    const rw = room.width || 300;
    const rl = room.length || 400;
    const rh = 280;

    // 四面牆
    dxf += box3d('01_RC_WALL', 0, 0, 0, rw, 15, rh);
    dxf += box3d('01_RC_WALL', 0, rl - 15, 0, rw, 15, rh);
    dxf += box3d('01_RC_WALL', 0, 0, 0, 15, rl, rh);
    dxf += box3d('01_RC_WALL', rw - 15, 0, 0, 15, rl, rh);

    // 大梁
    if (room.beams) {
      room.beams.forEach((beam) => {
        const by = beam.y || 100;
        const bh = beam.depth || 45;
        const bz = rh - bh;
        dxf += box3d('02_BEAMS', 15, by, bz, rw - 30, beam.width || 40, bh);
      });
    }

    // 門窗
    if (room.doors) {
      room.doors.forEach((door) => {
        const dw = door.width || 90;
        const dh = door.height || 210;
        const doff = door.offset || 30;
        let dx = doff;
        let dy = 0;
        let dBoxW = dw;
        let dBoxD = 15;
        if (door.wall === 'bottom' || door.wall === 'south') {
          dy = rl - 15;
        } else if (door.wall === 'left' || door.wall === 'west') {
          dx = 0;
          dy = doff;
          dBoxW = 15;
          dBoxD = dw;
        } else if (door.wall === 'right' || door.wall === 'east') {
          dx = rw - 15;
          dy = doff;
          dBoxW = 15;
          dBoxD = dw;
        }
        dxf += box3d('03_OPENINGS', dx, dy, 0, dBoxW, dBoxD, dh);
      });
    }
    if (room.windows) {
      room.windows.forEach((win) => {
        const ww = win.width || 120;
        const wh = win.height || 120;
        const wsill = win.sillHeight || 90;
        const woff = win.offset || 40;
        let wx = woff;
        let wy = rl - 15;
        let wBoxW = ww;
        let wBoxD = 15;
        if (win.wall === 'top' || win.wall === 'north') {
          wy = 0;
        } else if (win.wall === 'left' || win.wall === 'west') {
          wx = 0;
          wy = woff;
          wBoxW = 15;
          wBoxD = ww;
        } else if (win.wall === 'right' || win.wall === 'east') {
          wx = rw - 15;
          wy = woff;
          wBoxW = 15;
          wBoxD = ww;
        }
        dxf += box3d('03_OPENINGS', wx, wy, wsill, wBoxW, wBoxD, wh);
      });
    }
  });

  dxf += '0\nENDSEC\n0\nEOF\n';
  return dxf;
}

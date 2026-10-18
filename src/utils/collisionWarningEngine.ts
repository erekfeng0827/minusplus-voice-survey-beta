import { RoomData, FurnitureItem, CollisionWarningIssue, CollisionOptimizationSolution } from '../types';

export function getDoorSwingBounds(room: RoomData, door: RoomData['doors'][number]) {
  const wall = door.wall === 'north' ? 'top' : door.wall === 'south' ? 'bottom' : door.wall === 'west' ? 'left' : door.wall === 'east' ? 'right' : door.wall;
  const margin = 10;
  const depth = door.width + 15;
  if (wall === 'top') return { minX: door.offset - margin, maxX: door.offset + door.width + margin, minY: 0, maxY: depth };
  if (wall === 'bottom') return { minX: door.offset - margin, maxX: door.offset + door.width + margin, minY: room.length - depth, maxY: room.length };
  if (wall === 'left') return { minX: 0, maxX: depth, minY: door.offset - margin, maxY: door.offset + door.width + margin };
  return { minX: room.width - depth, maxX: room.width, minY: door.offset - margin, maxY: door.offset + door.width + margin };
}

export function checkCollisionAndContractCompliance(
  room: RoomData,
  furnitureList: FurnitureItem[]
): CollisionWarningIssue[] {
  const issues: CollisionWarningIssue[] = [];
  const dropDepth = Math.round(room.length * 0.35); // 35% of length is drop ceiling zone
  const dropCeilingElev = room.ceilingDrop; // e.g. 230cm

  furnitureList.forEach((item) => {
    const itemLeft = item.x;
    const itemRight = item.x + item.width;
    const itemTop = item.y;
    const itemBottom = item.y + item.depth;
    const itemElevBottom = item.elevation;
    const itemElevTop = item.elevation + item.height;

    // 1. Check Ceiling Drop Penetration (空調降板天花衝突)
    // If item is placed inside the drop zone (itemTop < dropDepth)
    const inDropZone = itemTop < dropDepth;
    if (inDropZone && itemElevTop > dropCeilingElev) {
      const penetration = itemElevTop - dropCeilingElev;
      const suggestedTrimHeight = Math.max(10, Math.floor((dropCeilingElev - itemElevBottom - 5) / 5) * 5); // 5-multiple with 5cm tolerance

      const sol1: CollisionOptimizationSolution = {
        id: `sol-drop-trim-${item.id}`,
        title: `方案 A：櫃高修剪至 ${suggestedTrimHeight}cm`,
        description: `依《降板裁決_v003》第4條，將櫃體高度調整為 ${suggestedTrimHeight}cm，保留 5cm 維修縫並符合 5 倍數原則`,
        actionType: 'REDUCE_HEIGHT',
        newValues: {
          height: suggestedTrimHeight,
        },
      };

      const sol2: CollisionOptimizationSolution = {
        id: `sol-drop-move-${item.id}`,
        title: `方案 B：平移避讓至平頂區 (Y=${dropDepth + 20}cm)`,
        description: `將家具水平平移出 230cm 降板區，移動至無降板之 280cm 平頂區自由伸展`,
        actionType: 'SHIFT_POSITION',
        newValues: {
          y: dropDepth + 20,
        },
      };

      issues.push({
        id: `issue-drop-${item.id}`,
        furnitureId: item.id,
        furnitureName: item.name,
        collisionType: 'CEILING_DROP_PENETRATION',
        collidingWithTitle: `空調降板天花 (FL+${dropCeilingElev}cm)`,
        severity: 'CRITICAL',
        contractRuleClause: `《降板裁決_v003》第 4 條：空調降板區高程約束 (FL+${dropCeilingElev})`,
        issueDescription: `頂高 ${itemElevTop}cm 超出降板天花 ${dropCeilingElev}cm，向上穿透干涉 ${penetration}cm。`,
        currentHeightOrElev: itemElevTop,
        contractConstraintElev: dropCeilingElev,
        penetrationCm: penetration,
        solutions: [sol1, sol2],
      });
    }

    // 2. Check Beam Clearance Clash (大梁下淨高衝突)
    room.beams.forEach((beam) => {
      let beamLeft = 0;
      let beamRight = room.width;
      let beamTop = beam.y;
      let beamBottom = beam.y + beam.width;

      if (beam.orientation === 'vertical') {
        beamLeft = beam.x !== undefined ? beam.x : room.width / 2 - beam.width / 2;
        beamRight = beamLeft + beam.width;
        beamTop = beam.y !== undefined ? beam.y : 0;
        beamBottom = beamTop + (beam.depth || room.length);
      } else {
        if (beam.depth && beam.depth < room.width && beam.x !== undefined) {
          beamLeft = beam.x;
          beamRight = beam.x + beam.depth;
        }
      }

      // Check 2D footprint intersection
      const overlapX = itemLeft < beamRight && itemRight > beamLeft;
      const overlapY = itemTop < beamBottom && itemBottom > beamTop;

      if (overlapX && overlapY && itemElevTop > beam.clearHeight) {
        const penetration = itemElevTop - beam.clearHeight;
        const suggestedHeight = Math.max(10, Math.floor((beam.clearHeight - itemElevBottom - 5) / 5) * 5);

        issues.push({
          id: `issue-beam-${item.id}-${beam.id}`,
          furnitureId: item.id,
          furnitureName: item.name,
          collisionType: 'BEAM_CLEARANCE_CLASH',
          collidingWithTitle: `${beam.name} (梁下淨高 FL+${beam.clearHeight}cm)`,
          severity: 'CRITICAL',
          contractRuleClause: `幾何契約：大梁淨高合規 (FL+${beam.clearHeight})`,
          issueDescription: `物件頂部高程 ${itemElevTop}cm 與結構梁下 ${beam.clearHeight}cm 碰撞干涉 ${penetration}cm。`,
          currentHeightOrElev: itemElevTop,
          contractConstraintElev: beam.clearHeight,
          penetrationCm: penetration,
          solutions: [
            {
              id: `sol-beam-trim-${item.id}`,
              title: `修剪高度至 ${suggestedHeight}cm (梁下避讓)`,
              description: `高度降為 ${suggestedHeight}cm，低於梁底淨高並預留 5cm 緩衝。`,
              actionType: 'REDUCE_HEIGHT',
              newValues: { height: suggestedHeight },
            },
            {
              id: `sol-beam-shift-${item.id}`,
              title: `側移平開梁跨範圍 (X=${beamRight + 20}cm)`,
              description: `水平微調家具擺放位置，脫離梁底投影範圍。`,
              actionType: 'SHIFT_POSITION',
              newValues: { x: Math.min(room.width - item.width - 15, beamRight + 20) },
            },
          ],
        });
      }
    });

    // 3. Check Door Swing Blockage (防爆門/房門迴旋半徑干涉)
    room.doors.forEach((door) => {
        const swing = getDoorSwingBounds(room, door);

        const overlapSwingX = itemLeft < swing.maxX && itemRight > swing.minX;
        const overlapSwingY = itemTop < swing.maxY && itemBottom > swing.minY;

        if (overlapSwingX && overlapSwingY && itemElevBottom < door.height) {
          const shiftTargetX = swing.maxX + 25;
          const shiftTargetY = swing.minY - item.depth - 20;

          issues.push({
            id: `issue-doorswing-${item.id}-${door.id}`,
            furnitureId: item.id,
            furnitureName: item.name,
            collisionType: 'DOOR_SWING_BLOCKAGE',
            collidingWithTitle: `${door.name} 迴旋半徑 (${door.width}cm 門扇)`,
            severity: 'CRITICAL',
            contractRuleClause: '《建築技術規則》與 V-03 門窗通行淨空驗收',
            issueDescription: `家具佔據門扇 90° 開啟迴轉軌跡，導致無法完全開啟通過。`,
            currentHeightOrElev: itemElevBottom,
            contractConstraintElev: door.height,
            penetrationCm: door.width,
            solutions: [
              {
                id: `sol-door-shift-x-${item.id}`,
                title: `水平側移避讓 (X=${shiftTargetX}cm)`,
                description: `將物件向右平移出門扇開啟半徑，恢復 100% 開啟自由度。`,
                actionType: 'RELOCATE_AWAY_FROM_DOOR',
                newValues: { x: Math.min(room.width - item.width - 20, shiftTargetX) },
              },
              {
                id: `sol-door-shift-y-${item.id}`,
                title: `向上進深平移 (Y=${Math.max(20, shiftTargetY)}cm)`,
                description: `避開門後迴旋區，緊貼開揚走道。`,
                actionType: 'RELOCATE_AWAY_FROM_DOOR',
                newValues: { y: Math.max(20, shiftTargetY) },
              },
            ],
          });
        }
    });

    // 4. Check 5-Multiple Rule (5 倍數契約規範)
    const heightMod = item.height % 5;
    const elevMod = item.elevation % 5;
    if (heightMod !== 0 || elevMod !== 0) {
      const fixedHeight = Math.round(item.height / 5) * 5;
      const fixedElev = Math.round(item.elevation / 5) * 5;

      issues.push({
        id: `issue-5multiple-${item.id}`,
        furnitureId: item.id,
        furnitureName: item.name,
        collisionType: 'RULE_5_MULTIPLE_VIOLATION',
        collidingWithTitle: '5 倍數幾何契約規範',
        severity: 'WARNING',
        contractRuleClause: '幾何契約原則：所有高程與模數尺寸皆須為 5 之倍數',
        issueDescription: `當前標高 FL+${item.elevation}cm 或高度 ${item.height}cm 未整除 5，將造成現場放樣泥作與木作公差。`,
        currentHeightOrElev: item.elevation,
        contractConstraintElev: fixedElev,
        penetrationCm: Math.abs(item.elevation - fixedElev) || Math.abs(item.height - fixedHeight),
        solutions: [
          {
            id: `sol-5mult-align-${item.id}`,
            title: `一鍵校正至 5 倍數標高 (標高 ${fixedElev}cm / 高度 ${fixedHeight}cm)`,
            description: `自動捨入至最近之 5 倍數模數，完全符合契約標準。`,
            actionType: 'ALIGN_5_MULTIPLE',
            newValues: {
              height: fixedHeight,
              elevation: fixedElev,
            },
          },
        ],
      });
    }

    // 5. Check Headroom Clearance for Suspended Items (懸吊設備最低通行淨空)
    if (item.category === 'lighting' || item.category === 'ac_indoor_unit') {
      if (itemElevBottom < 210) {
        issues.push({
          id: `issue-headroom-${item.id}`,
          furnitureId: item.id,
          furnitureName: item.name,
          collisionType: 'HEADROOM_INADEQUATE',
          collidingWithTitle: '人體工學最低通行淨空 (210cm)',
          severity: 'CRITICAL',
          contractRuleClause: 'V-04 / 居家室內最低行走淨高 210cm (建議 FL+215cm 5倍數)',
          issueDescription: `懸吊燈具下緣僅 FL+${itemElevBottom}cm，低於行走通行安全高度 210cm。`,
          currentHeightOrElev: itemElevBottom,
          contractConstraintElev: 215,
          penetrationCm: 210 - itemElevBottom,
          solutions: [
            {
              id: `sol-headroom-raise-${item.id}`,
              title: '提升吊掛標高至 FL+215cm',
              description: '調整吊管或吊線長度，滿足 215cm 安全高度並符合 5 倍數原則。',
              actionType: 'ADJUST_ELEVATION',
              newValues: {
                elevation: 215,
                height: Math.min(item.height, 60),
              },
            },
          ],
        });
      }
    }
  });

  return issues;
}

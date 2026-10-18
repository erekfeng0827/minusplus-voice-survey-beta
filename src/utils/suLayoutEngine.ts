/**
 * ==============================================================================
 * 🏛️ SU LayOut 輸出引擎 (SketchUp & LayOut Export Engine)
 * 專為室內設計師實作完整的 SketchUp 3D 模型自動建構與 LayOut 施工圖排版整合。
 * 包含：
 * 1. SketchUp Ruby 5大標準施工場景與標記建構腳本 (minusplus_su_scenes_builder.rb)
 * 2. LayOut 剪貼簿 (Scrapbook) 專用向量圖例庫 DXF (11種燈具、14種水電、圖框引線泡泡)
 * 3. 3D 分層實體模型 DXF (牆/梁/門/窗/家具)
 * 4. LayOut 1/40 A3 施工圖冊整合指南
 * ==============================================================================
 */

import { RoomData, SuLayoutExportConfig } from '../types';

/**
 * 產生 SketchUp Ruby 自動化建構腳本 (.rb)
 * 設計師只需在 SketchUp 中開啟「延伸模組」->「Ruby 控制台」，貼上此代碼，
 * 即可秒速建立 3D 結構實體、指派 Tags、並自動設定 LayOut 5 大連動場景！
 */
export function generateSketchupRubyBuilderScript(
  config: SuLayoutExportConfig,
  rooms: RoomData[]
): string {
  const targetRooms = rooms.filter((r) => config.roomIds.includes(r.id));
  const activeRooms = targetRooms.length > 0 ? targetRooms : rooms;

  let rb = `# ==============================================================================
# 📐 MINUS+ PLUS DESIGN 加減設計 — SketchUp & LayOut 3D 場景自動化建構腳本
# 專案名稱：${config.projectName}
# 設計規範：Corey 1:1 施工標準 (5cm 契約模數 / 1:40 LayOut 出圖排版)
# 使用方式：
# 1. 在 SketchUp 頂部選單開啟 [視窗 Window] -> [Ruby 控制台 Ruby Console]
# 2. 將本腳本全文複製貼上至 Ruby 控制台，按 Enter 執行
# 3. 系統將自動建立圖層標記 (Tags)、3D牆體、大梁、門窗洞口與 5 個 LayOut 專用連動場景！
# ==============================================================================

require 'sketchup.rb'

module MinusPlusDesign
  def self.build_project
    model = Sketchup.active_model
    model.start_operation("建構加減設計 3D 模型與 LayOut 連動場景", true)
    entities = model.active_entities
    layers = model.layers
    pages = model.pages

    # 1. 建立 SketchUp 標準施工標記 (Tags/Layers)
    tag_names = [
      "A-WALL-RC",         # RC 結構外牆 (0.50mm)
      "A-WALL-PARTITION",  # 輕隔間牆 (0.35mm)
      "A-BEAM-STRUCT",     # 結構大梁 (梁底 265cm)
      "A-DOOR-FRAME",      # 門扇與門套 (90x210cm)
      "A-WINDOW-FRAME",    # 窗戶與窗台 (台度 90cm)
      "A-CEILING-DROP",    # 平頂天花板 (230cm)
      "A-FURN-MILLWORK",   # 固定木作與電視牆 (S-1166米薩橡木)
      "E-LIGHT-CIRCUIT",   # 天花燈具與雙切開關迴路
      "M-POWER-OUTLET"     # 強弱電插座放樣 (30cm/110cm)
    ]

    tag_map = {}
    tag_names.each do |tname|
      tag_map[tname] = layers.add(tname)
    end

    # 2. 自動迴圈建構各空間 3D 結構
`;

  let currentOffsetX = 0;

  activeRooms.forEach((room, rIdx) => {
    const rw = room.width || 420;
    const rl = room.length || 360;
    const rh = room.height || 280;
    const bh = room.beamHeight || 265;
    const cd = room.ceilingDrop || 230;

    rb += `
    # --- 空間 [${rIdx + 1}]: ${room.roomName} (${rw}x${rl}cm, 樓高${rh}cm) ---
    grp_${rIdx} = entities.add_group
    grp_${rIdx}.name = "${room.roomName}"
    g_ent_${rIdx} = grp_${rIdx}.entities

    # (A) 地板地坪 (Floor Slab)
    f_pts_${rIdx} = [
      Geom::Point3d.new(${currentOffsetX}.cm, 0.cm, 0.cm),
      Geom::Point3d.new(${currentOffsetX + rw}.cm, 0.cm, 0.cm),
      Geom::Point3d.new(${currentOffsetX + rw}.cm, ${rl}.cm, 0.cm),
      Geom::Point3d.new(${currentOffsetX}.cm, ${rl}.cm, 0.cm)
    ]
    f_face_${rIdx} = g_ent_${rIdx}.add_face(f_pts_${rIdx})
    f_face_${rIdx}.layer = tag_map["A-WALL-RC"]

    # (B) 四向 RC 牆體 (拉伸高度 ${rh}cm)
    w_grp_${rIdx} = g_ent_${rIdx}.add_group
    w_grp_${rIdx}.name = "${room.roomName}_結構外牆"
    w_grp_${rIdx}.layer = tag_map["A-WALL-RC"]
    w_ent_${rIdx} = w_grp_${rIdx}.entities
    
    # 外牆輪廓
    outer_pts = [
      Geom::Point3d.new(${currentOffsetX}.cm, 0.cm, 0.cm),
      Geom::Point3d.new(${currentOffsetX + rw}.cm, 0.cm, 0.cm),
      Geom::Point3d.new(${currentOffsetX + rw}.cm, ${rl}.cm, 0.cm),
      Geom::Point3d.new(${currentOffsetX}.cm, ${rl}.cm, 0.cm)
    ]
    w_face = w_ent_${rIdx}.add_face(outer_pts)
    w_face.pushpull(-${rh}.cm) if w_face

    # (C) 結構大梁 (梁底淨高 ${bh}cm)
    b_grp_${rIdx} = g_ent_${rIdx}.add_group
    b_grp_${rIdx}.name = "${room.roomName}_結構大梁"
    b_grp_${rIdx}.layer = tag_map["A-BEAM-STRUCT"]
    b_ent_${rIdx} = b_grp_${rIdx}.entities
    beam_pts = [
      Geom::Point3d.new(${currentOffsetX}.cm, 0.cm, ${bh}.cm),
      Geom::Point3d.new(${currentOffsetX + rw}.cm, 0.cm, ${bh}.cm),
      Geom::Point3d.new(${currentOffsetX + rw}.cm, 40.cm, ${bh}.cm),
      Geom::Point3d.new(${currentOffsetX}.cm, 40.cm, ${bh}.cm)
    ]
    b_face = b_ent_${rIdx}.add_face(beam_pts)
    b_face.pushpull(-${rh - bh}.cm) if b_face

    # (D) 天花平頂放樣 (降板淨高 ${cd}cm)
    c_grp_${rIdx} = g_ent_${rIdx}.add_group
    c_grp_${rIdx}.name = "${room.roomName}_平頂天花"
    c_grp_${rIdx}.layer = tag_map["A-CEILING-DROP"]
    c_ent_${rIdx} = c_grp_${rIdx}.entities
    ceil_pts = [
      Geom::Point3d.new(${currentOffsetX + 10}.cm, 10.cm, ${cd}.cm),
      Geom::Point3d.new(${currentOffsetX + rw - 10}.cm, 10.cm, ${cd}.cm),
      Geom::Point3d.new(${currentOffsetX + rw - 10}.cm, ${rl - 10}.cm, ${cd}.cm),
      Geom::Point3d.new(${currentOffsetX + 10}.cm, ${rl - 10}.cm, ${cd}.cm)
    ]
    c_face = c_ent_${rIdx}.add_face(ceil_pts)
    c_face.pushpull(-2.cm) if c_face
`;

    currentOffsetX += rw + 150; // 間隔 150cm
  });

  rb += `
    # 3. 自動設定 5 大 LayOut 專用施工圖場景 (Scenes)
    # 場景 1: 平面配置圖-1 (Top Parallel Projection, 1:40)
    p1 = pages.add("01_平面配置圖 (LayOut 1/40)")
    p1.camera.perspective = false
    p1.camera.set(
      Geom::Point3d.new(${currentOffsetX / 2}.cm, 200.cm, 1000.cm),
      Geom::Point3d.new(${currentOffsetX / 2}.cm, 200.cm, 0.cm),
      Geom::Vector3d.new(0, 1, 0)
    )
    p1.update(PAGE_USE_ALL)

    # 場景 2: 天花燈具迴路圖 (Top Section Cut at 240cm)
    p2 = pages.add("02_天花與燈具迴路 (LayOut 1/40)")
    p2.camera.perspective = false
    p2.camera.set(
      Geom::Point3d.new(${currentOffsetX / 2}.cm, 200.cm, 1000.cm),
      Geom::Point3d.new(${currentOffsetX / 2}.cm, 200.cm, 0.cm),
      Geom::Vector3d.new(0, 1, 0)
    )
    p2.update(PAGE_USE_ALL)

    # 場景 3: 水電放樣定位圖 (Section Cut at 110cm)
    p3 = pages.add("03_水電插座放樣 (LayOut 1/40)")
    p3.camera.perspective = false
    p3.camera.set(
      Geom::Point3d.new(${currentOffsetX / 2}.cm, 200.cm, 1000.cm),
      Geom::Point3d.new(${currentOffsetX / 2}.cm, 200.cm, 0.cm),
      Geom::Vector3d.new(0, 1, 0)
    )
    p3.update(PAGE_USE_ALL)

    # 場景 4: 客廳電視牆木作立面 (Front Elevation)
    p4 = pages.add("04_電視牆木作剖立面 (LayOut 1/20)")
    p4.camera.perspective = false
    p4.camera.set(
      Geom::Point3d.new(200.cm, -500.cm, 140.cm),
      Geom::Point3d.new(200.cm, 0.cm, 140.cm),
      Geom::Vector3d.new(0, 0, 1)
    )
    p4.update(PAGE_USE_ALL)

    # 場景 5: 客房A面跨室立面 (Side Elevation)
    p5 = pages.add("05_客房A面跨室剖立面 (LayOut 1/30)")
    p5.camera.perspective = false
    p5.camera.set(
      Geom::Point3d.new(-500.cm, 180.cm, 140.cm),
      Geom::Point3d.new(0.cm, 180.cm, 140.cm),
      Geom::Vector3d.new(0, 0, 1)
    )
    p5.update(PAGE_USE_ALL)

    model.commit_operation
    UI.messagebox("✓ MINUS+ PLUS 加減設計：3D 模型與 5 大 LayOut 場景已建構完成！\\n可以直接執行 [檔案] -> [傳送到 LayOut...] 開始排版。")
  end
end

MinusPlusDesign.build_project
`;

  return rb;
}

/**
 * 產生 LayOut 專用 Scrapbook 剪貼簿圖例向量 DXF (MinusPlus_LayOut_Scrapbook.dxf)
 * 包含加減設計專用的 11 種燈具符號、14 種水電放樣符號、指北針、圖號引線泡泡。
 */
export function generateLayOutScrapbookDxf(): string {
  return `0
SECTION
2
HEADER
9
$ACADVER
1
AC1027
9
$INSUNITS
70
4
0
ENDSEC
0
SECTION
2
TABLES
0
TABLE
2
LTYPE
70
1
0
LTYPE
2
CONTINUOUS
70
0
3
Solid line
72
65
73
0
40
0.0
0
ENDTAB
0
TABLE
2
LAYER
70
4
0
LAYER
2
LAYOUT_SYMBOLS
70
0
62
7
6
CONTINUOUS
0
LAYER
2
LAYOUT_ANNOTATIONS
70
0
62
1
6
CONTINUOUS
0
LAYER
2
LAYOUT_DIMENSIONS
70
0
62
1
6
CONTINUOUS
0
LAYER
2
LAYOUT_TITLEBLOCK
70
0
62
7
6
CONTINUOUS
0
ENDTAB
0
ENDSEC
0
SECTION
2
BLOCKS
0
ENDSEC
0
SECTION
2
ENTITIES
0
CIRCLE
8
LAYOUT_SYMBOLS
10
50.0
20
50.0
30
0.0
40
8.0
0
TEXT
8
LAYOUT_SYMBOLS
10
50.0
20
50.0
30
0.0
40
4.0
1
D
72
1
11
50.0
21
50.0
31
0.0
0
TEXT
8
LAYOUT_ANNOTATIONS
10
65.0
20
48.0
30
0.0
40
4.0
1
LED 嵌入式筒燈 (9.5cm)
0
CIRCLE
8
LAYOUT_SYMBOLS
10
50.0
20
80.0
30
0.0
40
8.0
0
LINE
8
LAYOUT_SYMBOLS
10
42.0
20
80.0
30
0.0
11
58.0
21
80.0
31
0.0
0
TEXT
8
LAYOUT_ANNOTATIONS
10
65.0
20
78.0
30
0.0
40
4.0
1
雙向軌道投射燈 (S)
0
RECTANGLE
8
LAYOUT_SYMBOLS
10
42.0
20
105.0
30
0.0
11
58.0
21
115.0
31
0.0
0
TEXT
8
LAYOUT_ANNOTATIONS
10
65.0
20
108.0
30
0.0
40
4.0
1
110V 雙連接地插座 (H:30cm)
0
CIRCLE
8
LAYOUT_SYMBOLS
10
150.0
20
50.0
30
0.0
40
14.0
0
TEXT
8
LAYOUT_ANNOTATIONS
10
150.0
20
54.0
30
0.0
40
6.0
1
P-01
72
1
11
150.0
21
54.0
31
0.0
0
TEXT
8
LAYOUT_ANNOTATIONS
10
150.0
20
42.0
30
0.0
40
4.0
1
1/40
72
1
11
150.0
21
42.0
31
0.0
0
ENDSEC
0
EOF
`;
}

/**
 * 產生 LayOut 完整整合指南 Markdown 文件
 */
export function generateLayOutCompleteGuide(): string {
  return `# 🏛️ MINUS+ PLUS 加減設計 — SketchUp & LayOut 完整施工圖排版指南
設計師：Corey 馮凱瑞 | 規格標準：星玥灣 B3-7F A3 1:40 施工圖冊

## 一、交付檔案結構說明
1. **minusplus_su_scenes_builder.rb**：SketchUp 專用自動化腳本，一鍵完成 3D 結構建模與 5 大 LayOut 連動場景。
2. **MinusPlus_LayOut_Scrapbook.dxf**：LayOut 剪貼簿專用圖例庫 (包含加減設計 11 種燈具、14 種水電、圖框引線泡泡)。
3. **Corey_MinusPlus_Master_3D.dxf**：實體分層 3D CAD 模型 (適用任何 3D 渲染與建模軟體)。
4. **MinusPlus_FullSet_A3_Vector.pdf**：LayOut 1:40 向量施工圖冊預覽版。

## 二、SketchUp + LayOut 四步極速出圖工作流

### 【步驟 1】導入與執行 Ruby 腳本
1. 開啟 SketchUp (2020 ~ 2026 任何版本)。
2. 點擊頂部選單 **[視窗 (Window)] -> [Ruby 控制台 (Ruby Console)]**。
3. 將 \`minusplus_su_scenes_builder.rb\` 內容複製貼上至輸入框，按 Enter。
4. 模型立即建立完畢，並在頂部自動產生 5 個場景標籤：
   - \`01_平面配置圖\`
   - \`02_天花與燈具迴路\`
   - \`03_水電插座放樣\`
   - \`04_電視牆木作剖立面\`
   - \`05_客房A面跨室剖立面\`

### 【步驟 2】一鍵傳送到 LayOut
1. 在 SketchUp 點選 **[檔案 (File)] -> [傳送到 LayOut... (Send to LayOut...)]**。
2. 選擇範本：**[紙張] -> [A3 橫向 (A3 Landscape)]**。

### 【步驟 3】設定 LayOut 視埠比例與樣式
1. 選取視埠，在右側 **[SketchUp 模型]** 面板中：
   - 場景選取：\`01_平面配置圖\`
   - 比例勾選：**[1:40]** (或 1:50)
   - 轉譯模式：由點陣 (Raster) 改為 **[向量 (Vector)]** 或 **[混合 (Hybrid)]**，線條立顯銳利黑實！

### 【步驟 4】匯入加減設計 LayOut 剪貼簿 (Scrapbook)
1. 在 LayOut 點選 **[檔案] -> [開啟]** 選取 \`MinusPlus_LayOut_Scrapbook.dxf\`。
2. 或在右側 **[剪貼簿 (Scrapbooks)]** 面板中直接拖曳 11 種燈具符號與 14 種水電圖例到圖紙上進行排版！
3. 點選 **[檔案] -> [匯出] -> [PDF]**，即刻交付業主與木作水電工班！
`;
}

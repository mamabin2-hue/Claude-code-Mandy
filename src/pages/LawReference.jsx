import { useState } from 'react'
import { Link } from 'react-router-dom'

// ── 指引速查資料 ──────────────────────────────────────────────
const GUIDE_SECTIONS = [
  {
    title: '🌡️ 熱危害風險等級（核心考點）',
    content: `
      <table class="ref-table">
        <tr><th>等級</th><th>熱指數值（℃）</th><th>管理原則</th></tr>
        <tr><td class="cr"><strong>第四級</strong></td><td class="hl">≥ 54.4</td><td>避免戶外作業；強制設遮陽降溫設備、休息場所、充足飲水</td></tr>
        <tr><td style="color:#fb923c"><strong>第三級</strong></td><td class="hl">40.6以上，未達54.4</td><td>避開高氣溫時段戶外作業；強化措施</td></tr>
        <tr><td class="cb"><strong>第二級</strong></td><td class="hl">32.2以上，未達40.6</td><td>實施危害預防措施及提升認知</td></tr>
        <tr><td class="cg"><strong>第一級</strong></td><td class="hl">26.7以上，未達32.2</td><td>基本防護；重體力作業提高警覺</td></tr>
      </table>
      <div class="ref-note">⚠️ 熱指數 = 溫度＋相對濕度查表得出（≠ WBGT）；高溫作業標準才用WBGT</div>`,
  },
  {
    title: '🔢 WBGT 計算公式（高溫作業作息標準適用）',
    content: `
      <div class="ref-item"><strong>室內 / 戶外無日曬：</strong><br>
      WBGT ＝ <span class="hl">0.7 × 自然濕球溫度</span> ＋ <span class="hl">0.3 × 黑球溫度</span><br>
      口訣：<strong>三七（濕球七、黑球三）</strong></div>
      <div class="ref-item"><strong>戶外有日曬：</strong><br>
      WBGT ＝ <span class="hl">0.7 × 濕球</span> ＋ <span class="hl">0.2 × 黑球</span> ＋ <span class="hl">0.1 × 乾球</span><br>
      口訣：<strong>七二一（濕球七、黑球二、乾球一）</strong></div>
      <div class="ref-item"><strong>工作分類（高溫作業作息）：</strong><br>
      <span class="cg">輕工作</span>：坐/立姿操縱機器｜
      <span class="cb">中度工作</span>：走動中提舉推動物體｜
      <span class="cr">重工作</span>：鏟、掘、推等全身運動</div>
      <div class="ref-item"><strong>連續作業WBGT門檻：</strong>
      輕工作 <span class="hl">30.6°C</span>、中度 <span class="hl">28.0°C</span>、重工作 <span class="hl">25.9°C</span><br>
      每日工作時間不得超過 <span class="cr">6小時</span>（職安法§19）</div>`,
  },
  {
    title: '⬆️ 提升等級條件（第一至三級適用）',
    content: `
      <div class="ref-item">以下情況需將熱危害風險等級 <span class="cr">提升一級</span>：<br>
      ① 陽光<strong>直接照射</strong>下作業<br>
      ② 穿著<strong>不透氣厚重或抗滲透性防護衣</strong>作業</div>
      <div class="ref-note">⚠️ 第四級已是最高，無法再提升</div>`,
  },
  {
    title: '💧 飲水補充規定',
    content: `
      <div class="ref-item">建議：每 <span class="hl">15～20 分鐘</span> 1次，每次 <span class="hl">150～200 mL</span></div>
      <div class="ref-item">受限時：每小時至少 <span class="hl">2～4 杯</span>（每杯約 240 mL）</div>
      <div class="ref-item">水溫建議：<span class="hl">攝氏 10～15 度</span></div>
      <div class="ref-item cr">❌ 禁止：含酒精飲料</div>`,
  },
  {
    title: '🔴 停工門檻（三標準）',
    content: `
      <div class="ref-item">① 耳溫：未適應者 ＞ <span class="hl">38°C</span>；已適應者 ＞ <span class="hl">38.5°C</span></div>
      <div class="ref-item">② 作業中心跳 ＞ <span class="hl">（180 − 年齡）次/分</span></div>
      <div class="ref-item">③ 停止作業後 1 分鐘心跳仍 ＞ <span class="hl">120 次/分</span></div>
      <div class="ref-note">符合任一條件即應停止作業，移至涼爽處休息並觀察</div>`,
  },
  {
    title: '🏋️ 熱適應訓練排程',
    content: `
      <table class="ref-table">
        <tr><th>族群</th><th>第1天</th><th>第2天</th><th>第3天</th><th>第4天以後</th></tr>
        <tr><td>新進（無高溫經驗）</td><td>≤20%</td><td>≤40%</td><td>≤60%</td><td>≤80%…逐日增加</td></tr>
        <tr><td>有高溫作業經驗</td><td>≤50%</td><td>≤60%</td><td>≤80%</td><td><span class="cg">正常作業</span></td></tr>
      </table>
      <div class="ref-note">百分比 = 該日暴露時間 / 全日工作時間</div>`,
  },
  {
    title: '🔵 第四級強制設施（最高等級）',
    content: `
      <div class="ref-item"><strong>作業場所：</strong>遮陽設施 ＋ 風扇/水霧降溫</div>
      <div class="ref-item"><strong>休息場所：</strong>冷氣、風扇或自然通風</div>
      <div class="ref-item cr"><strong>密閉空間（貨櫃屋等）：</strong>必設冷氣機</div>
      <div class="ref-item"><strong>提供充足飲水</strong></div>
      <div class="ref-item"><strong>第四級禁止（除緊急救援外）：</strong><br>
      ① 穿著不透氣厚重或抗滲透性防護衣作業<br>
      ② 重體力作業</div>`,
  },
  {
    title: '🟤 粉塵分類與容許濃度（114年修正）',
    content: `
      <table class="ref-table">
        <tr><th>粉塵種類</th><th>可呼吸性粉塵</th><th>總粉塵</th><th>備註</th></tr>
        <tr><td class="cr">結晶型游離二氧化矽<br>（石英/方矽石/鱗矽石）</td><td class="hl">0.1 mg/m³</td><td>－</td><td>符號：瘤<br><span class="cr">116.01.01施行</span></td></tr>
        <tr><td>石綿纖維</td><td class="hl">0.15 f/cc</td><td>－</td><td>符號：瘤</td></tr>
        <tr><td>厭惡性粉塵</td><td class="hl">5 mg/m³</td><td class="hl">10 mg/m³</td><td>－</td></tr>
      </table>
      <div class="ref-item"><strong>粒徑三分類：</strong><br>
      吸入性粉塵 &lt; <span class="hl">100 μm</span>（進入鼻腔）<br>
      胸腔性粉塵 &lt; <span class="hl">10 μm</span>（進入肺部）<br>
      可呼吸性粉塵 &lt; <span class="hl">4 μm</span>（進入無纖毛氣道）</div>
      <div class="ref-item"><strong>石綿纖維定義：</strong>長度 ≥ <span class="hl">5 μm</span>、直徑 &lt; <span class="hl">3 μm</span>、長寬比 ≥ <span class="hl">3</span></div>`,
  },
  {
    title: '📋 粉塵作業豁免條件（第12條）',
    content: `
      <div class="ref-item">符合以下<strong>任一情形</strong>，且供給適當呼吸防護具，得免設密閉/排氣設備：<br>
      ① <strong>臨時性作業</strong>：期間不超過 <span class="hl">3個月</span>，且1年內不再重覆<br>
      ② <strong>作業時間短暫</strong>：同一發生源每日不超過 <span class="hl">1小時</span><br>
      ③ <strong>作業期間短暫</strong>：期間不超過 <span class="hl">1個月</span>，且6個月內不再實施</div>`,
  },
]

// ── 法規條文資料 ──────────────────────────────────────────────
const LAW_SECTIONS = [
  {
    title: '✅ 法規核對說明（已驗證考點）',
    content: `
      <div class="ref-check">
        <strong>✅ 已驗證正確的知識點</strong><br>
        • 熱危害風險等級數值（26.7 / 32.2 / 40.6 / 54.4）<br>
        • WBGT公式（室內三七、戶外七二一）<br>
        • 飲水建議（15-20min / 150-200mL）<br>
        • 停工耳溫門檻（未適應38°C / 已適應38.5°C）<br>
        • 熱適應排程（新進第1天20%；有經驗第4天正常）<br>
        • 粉塵粒徑三分類（100 / 10 / 4 μm）<br>
        • 石綿定義（長≥5μm、徑&lt;3μm、長寬比≥3）<br>
        • 結晶型游離二氧化矽新制0.1 mg/m³（116.01.01施行）<br>
        • 臨時性/時間短暫/期間短暫定義
      </div>
      <div class="ref-warn">
        <strong>⚠️ 重要區分（兩套法規）</strong><br>
        <strong>高溫作業勞工作息時間標準</strong>：室內特定高溫作業（鍋爐/鑄造等），用WBGT管制，每日≦6小時<br>
        <strong>高氣溫作業熱危害預防指引</strong>：戶外高氣溫作業（營造/外送等），用熱指數（溫＋濕）管制
      </div>`,
  },
  {
    title: '【法規1】職業安全衛生法（相關條文）',
    content: `
      <div class="ref-item"><span class="hl">最近修正</span>：113年8月7日</div>
      <div class="ref-item"><strong>第6條第1項</strong>（雇主責任）<br>雇主對防止原料、材料、氣體、蒸氣、粉塵、溶劑、化學品等引起之危害，應有符合規定之必要安全衛生設施及措施。</div>
      <div class="ref-item"><strong>第6條第3項</strong>（授權訂定標準）<br>第一項必要之安全衛生設施及措施之標準，由中央主管機關定之。<br><span class="ref-note-inline">→ 粉塵危害預防標準即依此授權</span></div>
      <div class="ref-item"><strong>第12條第2項</strong>（容許暴露標準）<br>前項之容許暴露標準，由中央主管機關定之。<br><span class="ref-note-inline">→ 勞工作業場所容許暴露標準依此訂定</span></div>
      <div class="ref-item"><strong class="hl">第19條第1項</strong>（高溫作業工時限制）<br>在高溫場所工作之勞工，雇主不得使其每日工作時間超過 <span class="cr">六小時</span>；異常氣壓、高架、精密、重體力勞動等特殊危害作業，亦應規定減少工作時間並予適當休息。</div>
      <div class="ref-item"><strong>第19條第2項</strong>（授權訂定標準）<br>前項高溫度等特殊作業之減少工作時間與休息時間之標準，由中央主管機關定之。<br><span class="ref-note-inline">→ 高溫作業勞工作息時間標準依此訂定</span></div>`,
  },
  {
    title: '【法規2】高溫作業勞工作息時間標準（103.07.01）',
    content: `
      <div class="ref-item"><span class="hl">依據</span>：職業安全衛生法第19條第2項</div>
      <div class="ref-item"><strong>第2條</strong>（高溫作業種類）<br>
      一、於<strong>鍋爐房</strong>從事之作業<br>
      二、<strong>灼熱鋼鐵或其他金屬塊壓軋及鍛造</strong>之作業<br>
      三、於<strong>鑄造間處理熔融鋼鐵或其他金屬</strong>之作業<br>
      四、<strong>鋼鐵或其他金屬類物料加熱或熔煉</strong>之作業<br>
      五、<strong>處理搪瓷、玻璃、電石及熔爐高溫熔料</strong>之作業<br>
      六、於<strong>蒸汽火車、輪船機房</strong>從事之作業<br>
      七、從事<strong>蒸汽操作、燒窯</strong>等作業<br>
      八、其他經中央主管機關指定之高溫作業<br>
      <span class="ref-note-inline">⚠️ 不包括已採取自動化操作且勞工無暴露熱危害之虞者</span></div>
      <div class="ref-item"><strong>第3條</strong>（WBGT公式）<br>
      <span class="cb">室內/戶外無日曬：</span>WBGT ＝ <span class="hl">0.7×自然濕球</span> ＋ <span class="hl">0.3×黑球</span><br>
      <span class="cr">戶外有日曬：</span>WBGT ＝ <span class="hl">0.7×自然濕球</span> ＋ <span class="hl">0.2×黑球</span> ＋ <span class="hl">0.1×乾球</span></div>
      <div class="ref-item"><strong>第4條</strong>（工作分類定義）<br>
      <span class="cg">輕工作</span>：坐/立姿操縱機器｜
      <span class="cb">中度工作</span>：走動中提舉推動物體｜
      <span class="cr">重工作</span>：鏟、掘、推等全身運動</div>
      <div class="ref-item"><strong class="hl">第5條</strong>（作息時間分配表）<br>
      <table class="ref-table">
        <tr><th>WBGT(°C)</th><th>連續作業</th><th>75%作/25%休</th><th>50%作/50%休</th><th>25%作/75%休</th></tr>
        <tr><td class="cg">輕工作</td><td class="hl">30.6</td><td>31.4</td><td>32.2</td><td>33.0</td></tr>
        <tr><td class="cb">中度工作</td><td class="hl">28.0</td><td>29.4</td><td>31.1</td><td>32.6</td></tr>
        <tr><td class="cr">重工作</td><td class="hl">25.9</td><td>27.9</td><td>30.0</td><td>32.1</td></tr>
      </table>
      <span class="ref-note-inline">每日工作時間不得超過6小時（職安法§19）</span></div>
      <div class="ref-item"><strong>第6條</strong>（薪資保障）<br>依本標準降低工作時間之勞工，<span class="cr">其原有工資不得減少</span>。</div>
      <div class="ref-item"><strong>第6-1條</strong>（雇主措施）<br>雇主使勞工從事高溫作業，應充分供應飲用水及食鹽，並採取指導勞工避免高溫作業危害之必要措施。</div>`,
  },
  {
    title: '【法規3】勞工作業場所容許暴露標準（114.04.11修正）',
    content: `
      <div class="ref-item"><span class="hl">修正日期</span>：114年4月11日 ｜ 依職安法§12第2項<br>附表二（粉塵）<span class="cr">自116年1月1日施行</span>，其餘自發布日施行</div>
      <div class="ref-item"><strong>第2條</strong>（容許濃度定義）<br>
      • <strong>TWA-PEL（八小時日時量平均）</strong>：每天8小時重複暴露，不致有不良反應<br>
      • <strong>STEL-PEL（短時間時量平均）</strong>：連續暴露任何15分鐘，不致不可逆組織病變<br>
      • <strong>Ceiling-PEL（最高容許濃度）</strong>：任何時間均不得超過（標示「高」字）</div>
      <div class="ref-item"><strong class="hl">附表二 粉塵容許濃度（114年修正）</strong>
      <table class="ref-table">
        <tr><th>粉塵種類</th><th>可呼吸性粉塵</th><th>總粉塵</th><th>備註</th></tr>
        <tr><td class="cr">結晶型游離二氧化矽<br>（石英、方矽石、鱗矽石）</td><td class="hl">0.1 mg/m³</td><td>－</td><td>符號：瘤<br>116.01.01施行</td></tr>
        <tr><td>石綿纖維</td><td class="hl">0.15 f/cc</td><td>－</td><td>符號：瘤</td></tr>
        <tr><td>厭惡性粉塵</td><td class="hl">5 mg/m³</td><td class="hl">10 mg/m³</td><td>－</td></tr>
      </table></div>
      <div class="ref-item"><strong>附表二說明（重要定義）</strong><br>
      二、<span class="cb">可呼吸性粉塵</span>：進入<strong>無纖毛呼吸道</strong>之粉塵（粒徑 &lt; 4 μm）<br>
      三、<span class="cg">總粉塵</span>：特定體積空氣中懸浮之全部粉塵<br>
      四、<span class="cr">結晶型游離二氧化矽</span>：石英、方矽石及鱗矽石<br>
      五、<span class="cb">石綿粉塵</span>：長度 ≥ <span class="hl">5μm</span>、直徑 &lt; <span class="hl">3μm</span>、長寬比 ≥ <span class="hl">3</span></div>
      <div class="ref-item"><strong>114年修正要點</strong><br>
      一、新增<strong>鋁及其不溶性化合物</strong>容許標準（5 mg/m³）<br>
      二、修正<strong>甲醛</strong>容許濃度（<span class="cr">1ppm → 0.75ppm</span>）<br>
      三、合併第一種/第二種粉塵為<strong>結晶型游離二氧化矽</strong>，容許濃度 <span class="hl">0.1 mg/m³</span></div>`,
  },
  {
    title: '【法規4】粉塵危害預防標準（103.06.25）',
    content: `
      <div class="ref-item"><span class="hl">依據</span>：職業安全衛生法第6條第3項</div>
      <div class="ref-item"><strong>第2條</strong>（重要用辭定義）<br>
      • <span class="hl">臨時性作業</span>：期間不超過 <strong>3個月</strong>，且1年內不再重覆<br>
      • <span class="hl">作業時間短暫</span>：同一特定粉塵發生源每日作業不超過 <strong>1小時</strong><br>
      • <span class="hl">作業期間短暫</span>：期間不超過 <strong>1個月</strong>，且6個月內不再實施<br>
      • <strong>密閉設備</strong>：密閉粉塵發生源，使其不致散布之設備<br>
      • <strong>局部排氣裝置</strong>：藉動力強制吸引並排出已發散粉塵之設備</div>
      <div class="ref-item"><strong class="hl">第6條</strong>（工程控制，優先順序）<br>
      ① <span class="cg">密閉設備</span>（最優先）<br>
      ② <span class="cb">局部排氣裝置</span><br>
      ③ <span class="cr">維持濕潤狀態</span></div>
      <div class="ref-item"><strong>第7條</strong>（氣罩型式）<br>
      <span class="cb">包圍型</span>（效果最佳）｜<span class="cg">外裝型</span>（上/下/側向吸引）｜<span class="cr">吹吸型</span>（一側吹、另側吸）</div>
      <div class="ref-item"><strong class="hl">第12條</strong>（得免設置工程控制之條件）<br>
      符合以下任一情形，且供給適當呼吸防護具：<br>
      ① 臨時性作業｜② 作業時間短暫｜③ 作業期間短暫</div>
      <div class="ref-item"><strong>第13條</strong>（小型設備得改設整體換氣）<br>
      研磨輪直徑 &lt; <span class="hl">30cm</span>｜搗碎機能力 &lt; <span class="hl">20kg/hr</span>｜篩選機面積 &lt; <span class="hl">700cm²</span>｜混合機容積 &lt; <span class="hl">18公升</span></div>
      <div class="ref-item"><strong>第15條</strong>（局部排氣裝置規定）<br>
      • 排氣機應置於<strong>空氣清淨裝置後之位置</strong><br>
      • <span class="cr">排氣口應設於室外</span></div>
      <div class="ref-item"><strong>第20條</strong>（作業主管）<br>應<strong>指定粉塵作業主管</strong>監督作業。</div>
      <div class="ref-item"><strong>第22條</strong>（清掃規定）<br>
      室內粉塵作業場所每日清掃 <span class="hl">1次</span> 以上<br>
      每月至少使用<strong>真空吸塵器或水沖洗</strong>清除地面及設備 <span class="hl">1次</span><br>
      <span class="ref-note-inline">⚠️ 禁止乾式掃帚清掃（使粉塵再度揚起）</span></div>
      <div class="ref-item"><strong>第24條</strong>（輸氣管面罩）<br>連續使用輸氣管面罩每次不得超過 <span class="hl">1小時</span>。</div>`,
  },
  {
    title: '【法規5】高氣溫作業熱危害預防指引（114.06.20第二次修正）',
    content: `
      <div class="ref-item"><span class="hl">性質</span>：行政指導（非強制法規），依職安衛設施規則§303-1及§324-6訂定</div>
      <div class="ref-item"><strong>第3條</strong>（定義）<br>
      • <strong>熱指數</strong>：透過<strong>溫度＋相對濕度</strong>評估熱壓力之指標（≠ WBGT）<br>
      • <strong>熱壓力</strong>：代謝熱能＋環境因子（溫/濕/風速/輻射）＋衣著量對人體的熱負荷</div>
      <div class="ref-item"><strong class="hl">第5條</strong>（風險等級判定）
      <table class="ref-table">
        <tr><th>等級</th><th>熱指數值</th><th>風險管理原則</th></tr>
        <tr><td class="cr"><strong>第四級</strong></td><td class="hl">≥ 54.4</td><td>避免戶外作業；設遮陽降溫設備</td></tr>
        <tr><td style="color:#fb923c"><strong>第三級</strong></td><td class="hl">40.6以上，未達54.4</td><td>避開高氣溫時段；強化措施</td></tr>
        <tr><td class="cb"><strong>第二級</strong></td><td class="hl">32.2以上，未達40.6</td><td>實施危害預防措施</td></tr>
        <tr><td class="cg"><strong>第一級</strong></td><td class="hl">26.7以上，未達32.2</td><td>基本防護</td></tr>
      </table></div>
      <div class="ref-item"><strong>第6條</strong>（提升等級條件）<br>
      ① 陽光<strong>直接照射</strong>下作業　② 穿著<strong>不透氣厚重或抗滲透性防護衣</strong>作業<br>
      <span class="ref-note-inline">僅適用第一至三級；第四級無法再提升</span></div>
      <div class="ref-item"><strong>第7條</strong>（危害預防措施摘要）<br>
      飲水：每 <span class="hl">15-20分鐘</span> / <span class="hl">150-200mL</span>；受限時每小時至少 <span class="hl">2-4杯</span>（約240mL/杯）<br>
      停工門檻：耳溫未適應 ＞ <span class="hl">38°C</span>｜已適應 ＞ <span class="hl">38.5°C</span>｜心跳 ＞ <span class="hl">180-年齡</span>｜停後1分鐘仍 ＞ <span class="hl">120次/分</span><br>
      熱適應：新進第1天 ≤ <span class="hl">20%</span>；有經驗第 <span class="hl">4天</span> 正常</div>
      <div class="ref-item"><strong>第8條</strong>（重體力作業）<br>
      應給予每小時至少 <span class="hl">20分鐘</span> 充足休息。</div>
      <div class="ref-item"><strong>第9條</strong>（第四級禁止，除緊急救援外）<br>
      ① 穿著不透氣厚重或抗滲透性防護衣進行作業　② <strong>重體力作業</strong></div>`,
  },
  {
    title: '【法規6】職業安全衛生設施規則（相關條文）',
    content: `
      <div class="ref-item"><span class="hl">依據</span>：職業安全衛生法第6條第3項授權</div>
      <div class="ref-item"><strong class="hl">第303條之1</strong>（戶外高氣溫作業設備要求）<br>
      雇主使勞工於戶外高氣溫作業時，應視天候狀況採取適當措施，並設置：<br>
      一、<strong>遮陽設施</strong>（或具同等效果之設備）<br>
      二、<strong>降低勞工暴露溫度之設備</strong>（風扇、水霧或其他）<br>
      三、<strong>適當休息場所</strong><br>
      四、<strong>提供充足飲用水</strong></div>
      <div class="ref-item"><strong class="hl">第324條之6</strong>（戶外作業熱危害預防措施）<br>
      雇主使勞工從事戶外作業，應依下列規定辦理：<br>
      一、參照中央主管機關公告之高氣溫作業熱危害預防指引，訂定<strong>熱危害預防計畫</strong><br>
      二、對勞工實施<strong>熱危害預防安全衛生教育訓練</strong><br>
      三、建立<strong>緊急醫療、通報及應變處理機制</strong><br>
      <span class="ref-note-inline">⚠️ 高氣溫作業熱危害預防指引即依本條（§303-1、§324-6）訂定</span></div>`,
  },
]

// ── 主元件 ──────────────────────────────────────────────────
function AccordionItem({ title, content, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border border-gray-700 rounded-xl overflow-hidden mb-2">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-800 hover:bg-gray-750 text-left cursor-pointer"
      >
        <span className="text-sm font-semibold text-gray-100">{title}</span>
        <span className={`text-gray-400 text-lg transition-transform ${open ? 'rotate-180' : ''}`}>▾</span>
      </button>
      {open && (
        <div
          className="ref-body px-4 py-4 bg-gray-900 text-sm text-gray-200"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      )}
    </div>
  )
}

export default function LawReference() {
  const [tab, setTab] = useState('guide')

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Scoped CSS for highlighted content */}
      <style>{`
        .ref-body .hl   { background: rgba(240,165,0,.25); color: #fbbf24; font-weight: 700; padding: 0 3px; border-radius: 3px; }
        .ref-body .cr   { color: #f87171; }
        .ref-body .cb   { color: #60a5fa; }
        .ref-body .cg   { color: #4ade80; }
        .ref-body .ref-item { margin-bottom: 12px; line-height: 1.7; }
        .ref-body .ref-note { background: rgba(240,165,0,.08); border: 1px solid rgba(240,165,0,.2); border-radius: 8px; padding: 8px 12px; font-size: 12px; color: #fbbf24; margin-top: 8px; }
        .ref-body .ref-warn { background: rgba(251,191,36,.08); border: 1px solid rgba(251,191,36,.25); border-radius: 8px; padding: 12px; font-size: 12px; color: #fcd34d; line-height: 1.8; margin-top: 8px; }
        .ref-body .ref-check { background: rgba(34,197,94,.08); border: 1px solid rgba(34,197,94,.2); border-radius: 8px; padding: 12px; font-size: 12px; color: #86efac; line-height: 2; margin-bottom: 8px; }
        .ref-body .ref-note-inline { display: block; font-size: 11px; color: #60a5fa; margin-top: 4px; }
        .ref-body .ref-table { width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 12px; }
        .ref-body .ref-table th { background: rgba(240,165,0,.15); color: #fbbf24; padding: 6px 8px; text-align: left; border-bottom: 1px solid #374151; }
        .ref-body .ref-table td { padding: 6px 8px; border-bottom: 1px solid #1f2937; vertical-align: top; }
        .ref-body .ref-table tr:last-child td { border-bottom: none; }
        .ref-body strong { color: #e5e7eb; }
      `}</style>

      {/* Header */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 border-b border-gray-700 px-4 pt-8 pb-5">
        <div className="max-w-3xl mx-auto">
          <Link to="/" className="text-gray-400 text-sm mb-3 inline-block">← 返回首頁</Link>
          <h1 className="text-xl font-bold text-white">⚖️ 法規查閱</h1>
          <p className="text-gray-400 text-sm mt-1">熱危害 ＋ 粉塵危害 ｜ 完整條文＋重點標色</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-gray-800 border-b border-gray-700 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto flex">
          {[
            { id: 'guide', label: '📋 指引速查' },
            { id: 'law',   label: '⚖️ 法規條文' },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 py-3 text-sm font-semibold transition-colors cursor-pointer ${
                tab === t.id
                  ? 'text-yellow-400 border-b-2 border-yellow-400'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 py-4">
        {tab === 'guide' && (
          <div>
            <p className="text-xs text-gray-500 mb-3">
              關鍵數字以 <span className="bg-yellow-900/40 text-yellow-400 px-1 rounded text-xs">黃底</span> 標示，
              危險值以 <span className="text-red-400 text-xs">紅字</span> 標示。點標題展開詳細內容。
            </p>
            {GUIDE_SECTIONS.map((s, i) => (
              <AccordionItem key={i} title={s.title} content={s.content} defaultOpen={i === 0} />
            ))}
          </div>
        )}

        {tab === 'law' && (
          <div>
            <p className="text-xs text-gray-500 mb-3">
              法規條文以官方公告版本為準。
              <span className="text-yellow-500">黃色</span> = 關鍵數字／名詞，
              <span className="text-red-400">紅色</span> = 禁止/強制事項。
            </p>
            {LAW_SECTIONS.map((s, i) => (
              <AccordionItem key={i} title={s.title} content={s.content} defaultOpen={i === 0} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
